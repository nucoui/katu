import type { parse } from "@/parser";
import type { NodePath } from "@babel/traverse";
import type * as t from "@babel/types";
import _traverse from "@babel/traverse";

const babelTraverse = _traverse.default;

/**
 * JSXのASTをトラバースして必要な情報を収集します。
 * @param ast - parseToAstで生成されたAST
 * @returns トラバース結果としての情報オブジェクト
 */
const traverse = (ast: ReturnType<typeof parse>): { className: string; elements: any[]; options: Record<string, any>; remainingCode: string; defineCustomElementCode: string; orderedNodes: { type: "defineCustomElement" | "customElementsDefine" | "other"; node: t.Statement }[] } => {
  const result: { className: string; elements: any[]; options: Record<string, any>; remainingCode: string; defineCustomElementCode: string; orderedNodes: { type: "defineCustomElement" | "customElementsDefine" | "other"; node: t.Statement }[] } = { className: "", elements: [], options: {}, remainingCode: "", defineCustomElementCode: "", orderedNodes: [] };

  babelTraverse(ast, {
    Program(path: NodePath<t.Program>) {
      const nodes: { type: "defineCustomElement" | "customElementsDefine" | "other"; node: t.Statement }[] = [];

      path.node.body.forEach((node) => {
        if (
          node.type === "VariableDeclaration"
          && node.declarations.some(
            declaration =>
              declaration.init?.type === "CallExpression"
              && declaration.init.callee.type === "Identifier"
              && declaration.init.callee.name === "defineCustomElement",
          )
        ) {
          nodes.push({ type: "defineCustomElement", node });
        }
        else if (
          node.type === "ExpressionStatement"
          && node.expression.type === "CallExpression"
          && node.expression.callee.type === "Identifier"
          && node.expression.callee.name === "customElements.define"
        ) {
          nodes.push({ type: "customElementsDefine", node });
        }
        else {
          nodes.push({ type: "other", node });
        }
      });

      result.orderedNodes = nodes;
    },
    FunctionDeclaration(path: NodePath<t.FunctionDeclaration>) {
      if (path.node.id?.type === "Identifier") {
        result.className = path.node.id.name;
        path.traverse({
          JSXElement(innerPath: NodePath<t.JSXElement>) {
            if (innerPath.node.type === "JSXElement") {
              result.elements.push(innerPath.node);
            }
          },
        });
      }
    },
    VariableDeclaration(path: NodePath<t.VariableDeclaration>) {
      path.node.declarations.forEach((declaration: t.VariableDeclarator) => {
        if (
          declaration.id.type === "Identifier"
          && declaration.init?.type === "ArrowFunctionExpression"
        ) {
          result.className = declaration.id.name;
          if (declaration.init.body.type === "BlockStatement") {
            declaration.init.body.body.forEach((statement: t.Statement) => {
              if (statement.type === "ReturnStatement" && statement.argument?.type === "JSXElement") {
                result.elements.push(statement.argument);
              }
            });
          }
        }
      });
    },
    CallExpression(path: NodePath<t.CallExpression>) {
      if (
        path.node.callee.type === "Identifier"
        && path.node.callee.name === "defineCustomElement"
      ) {
        const args = path.node.arguments;
        if (
          args.length >= 2
          && args[0].type === "ArrowFunctionExpression"
          && args[1].type === "ObjectExpression"
        ) {
          // Extract className from variable declaration
          const parentPath = path.findParent(p => p.isVariableDeclarator());
          if (parentPath?.isVariableDeclarator() && parentPath.node.id.type === "Identifier") {
            result.className = parentPath.node.id.name;
          }

          // Traverse JSX elements inside the arrow function
          if (args[0].body.type === "BlockStatement") {
            args[0].body.body.forEach((statement) => {
              if (statement.type === "ReturnStatement" && statement.argument?.type === "JSXElement") {
                result.elements.push(statement.argument);
              }
            });
          }
          else if (args[0].body.type === "JSXElement") {
            result.elements.push(args[0].body);
          }

          // Extract options from the second argument
          args[1].properties.forEach((prop) => {
            if (prop.type === "ObjectProperty" && prop.key.type === "Identifier") {
              result.options[prop.key.name]
                = prop.value.type === "StringLiteral" ? prop.value.value : prop.value;
            }
          });
        }
      }
    },
  });

  return result;
};

export { traverse };
