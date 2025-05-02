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
// 修正: elementsの型を適切に変更し、processJSXElementの戻り値を正しく扱う
const traverse = (ast: ReturnType<typeof parse>): { className: string; elements: { statements: t.Statement[]; elements: t.JSXElement[] }[]; options: Record<string, any>; remainingCode: string; defineCustomElementCode: string; orderedNodes: { type: "defineCustomElement" | "customElementsDefine" | "other"; node: t.Statement }[] } => {
  const result: { className: string; elements: { statements: t.Statement[]; elements: t.JSXElement[] }[]; options: Record<string, any>; remainingCode: string; defineCustomElementCode: string; orderedNodes: { type: "defineCustomElement" | "customElementsDefine" | "other"; node: t.Statement }[] } = { className: "", elements: [], options: {}, remainingCode: "", defineCustomElementCode: "", orderedNodes: [] };

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
              // 修正: processJSXElementの戻り値を直接JSXElement型として扱わない
              result.elements.push(
                { statements: processJSXElement(innerPath.node, "shadow", { count: 0 }).statements, elements: [] }
              );
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
                // 修正: processJSXElementの戻り値を直接JSXElement型として扱わない
                result.elements.push(
                  { statements: processJSXElement(statement.argument, "shadow", { count: 0 }).statements, elements: [] }
                );
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
                // 修正: processJSXElementの戻り値を直接JSXElement型として扱わない
                result.elements.push(
                  { statements: processJSXElement(statement.argument, "shadow", { count: 0 }).statements, elements: [] }
                );
              }
            });
          }
          else if (args[0].body.type === "JSXElement") {
            // 修正: processJSXElementの戻り値を直接JSXElement型として扱わない
            result.elements.push(
              { statements: processJSXElement(args[0].body, "shadow", { count: 0 }).statements, elements: [] }
            );
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

  // 修正: processJSXElementの戻り値を適切に扱うように変更
  result.elements = result.elements.map(({ statements, elements }) => ({ statements, elements }));

  return result;
};

/**
 * JSX要素を再帰的に処理して必要な情報を収集します。
 * @param jsxElement - 処理するJSX要素
 * @param parentVar - 親要素の変数名
 * @param elementCounter - 要素のカウンターオブジェクト
 * @param elementCounter.count - 現在の要素のカウント値
 * @returns 収集された情報
 */
function processJSXElement(jsxElement: t.JSXElement, parentVar: string, elementCounter: { count: number }): { statements: t.Statement[]; elements: t.JSXElement[] } {
  const statements: t.Statement[] = [];
  const elements: t.JSXElement[] = [];

  const elementVar = `el${elementCounter.count++}`;

  // 要素の作成
  statements.push({
    type: "VariableDeclaration",
    kind: "const",
    declarations: [
      {
        type: "VariableDeclarator",
        id: { type: "Identifier", name: elementVar },
        init: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            object: { type: "Identifier", name: "document" },
            property: { type: "Identifier", name: "createElement" },
            computed: false,
          },
          arguments: [
            { type: "StringLiteral", value: (jsxElement.openingElement.name as t.JSXIdentifier).name },
          ],
        },
      },
    ],
  });

  // 属性の設定
  jsxElement.openingElement.attributes.forEach((attr) => {
    if (attr.type === "JSXAttribute" && attr.name.type === "JSXIdentifier") {
      statements.push({
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            object: { type: "Identifier", name: elementVar },
            property: { type: "Identifier", name: "setAttribute" },
            computed: false,
          },
          arguments: [
            { type: "StringLiteral", value: attr.name.name },
            { type: "StringLiteral", value: attr.value?.type === "StringLiteral" ? attr.value.value : "" },
          ],
        },
      });
    }
  });

  // 子要素の処理
  jsxElement.children.forEach((child) => {
    if (child.type === "JSXText") {
      const textVar = `text${elementCounter.count++}`;
      statements.push(
        {
          type: "VariableDeclaration",
          kind: "const",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: textVar },
              init: {
                type: "CallExpression",
                callee: {
                  type: "MemberExpression",
                  object: { type: "Identifier", name: "document" },
                  property: { type: "Identifier", name: "createTextNode" },
                  computed: false,
                },
                arguments: [
                  { type: "StringLiteral", value: child.value.trim() },
                ],
              },
            },
          ],
        },
        {
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: {
              type: "MemberExpression",
              object: { type: "Identifier", name: elementVar },
              property: { type: "Identifier", name: "appendChild" },
              computed: false,
            },
            arguments: [
              { type: "Identifier", name: textVar },
            ],
          },
        },
      );
    }
    else if (child.type === "JSXElement") {
      const childResult = processJSXElement(child, elementVar, elementCounter);
      statements.push(...childResult.statements);
      elements.push(...childResult.elements);
    }
  });

  // 親要素に追加
  statements.push({
    type: "ExpressionStatement",
    expression: {
      type: "CallExpression",
      callee: {
        type: "MemberExpression",
        object: { type: "Identifier", name: parentVar },
        property: { type: "Identifier", name: "appendChild" },
        computed: false,
      },
      arguments: [
        { type: "Identifier", name: elementVar },
      ],
    },
  });

  return { statements, elements };
}

export { processJSXElement, traverse };
