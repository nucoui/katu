import type * as t from "@babel/types";
import type { SignalInfo } from "./types";
import * as babelTypes from "@babel/types";
import { replaceSignalCalls } from "./replaceSignalCalls";

/**
 * JSXノードや式ノードをjsx関数呼び出し式に変換する関数
 * @param node Babel ASTノード（JSXElement, JSXFragment, JSXExpressionContainer, Expression, ConditionalExpressionなど）
 * @param signals signal情報
 * @returns Babel Expressionノード
 * @description
 * JSX/TSXのASTノードをjsx('tag', { ...props, children })形式のBabel式ノードに変換します。
 *
 * Converts JSX/TSX AST nodes to Babel Expression nodes for jsx('tag', { ... }) call.
 */
export function jsxToHtmlAst(node: t.Expression | t.JSXElement | t.JSXFragment, signals: SignalInfo[]): t.Expression {
  if (!node)
    return babelTypes.stringLiteral("");
  // JSXFragment → jsxDom(Fragment, { children: [...] })
  if (node.type === "JSXFragment") {
    const childrenExprs = node.children.filter(Boolean).map((child) => {
      if (child.type === "JSXElement" || child.type === "JSXFragment") {
        return jsxToHtmlAst(child, signals);
      }
      else if (child.type === "JSXText") {
        // 空白・タブ・改行のみのテキスト（インデント含む）は無視
        if (/^[\t\r\n ]*$/.test(child.value))
          return null;
        return babelTypes.stringLiteral(child.value);
      }
      else if (child.type === "JSXExpressionContainer") {
        if (child.expression.type === "JSXEmptyExpression") {
          return null;
        }
        else {
          return jsxToHtmlAst(child.expression, signals);
        }
      }
      else {
        return null;
      }
    }).filter((v): v is t.Expression => v !== null);
    return babelTypes.callExpression(
      babelTypes.identifier("jsxDom"),
      [
        babelTypes.identifier("Fragment"),
        babelTypes.objectExpression([
          babelTypes.objectProperty(
            babelTypes.identifier("children"),
            babelTypes.arrayExpression(childrenExprs as t.Expression[]),
          ),
        ]),
      ],
    );
  }
  // JSXElement → jsxDom('tag', { ...props, children })
  if (node.type === "JSXElement") {
    const tag = node.openingElement.name.type === "JSXIdentifier"
      ? babelTypes.stringLiteral(node.openingElement.name.name)
      : babelTypes.stringLiteral("div");
    // props
    const propsObjProps: t.ObjectProperty[] = [];
    node.openingElement.attributes.forEach((attr) => {
      if (attr.type === "JSXAttribute") {
        const name = typeof attr.name.name === "string" ? attr.name.name : "";
        if (attr.value) {
          if (attr.value.type === "StringLiteral") {
            propsObjProps.push(
              babelTypes.objectProperty(babelTypes.identifier(name), babelTypes.stringLiteral(attr.value.value)),
            );
          }
          else if (attr.value.type === "JSXExpressionContainer") {
            if (attr.value.expression.type === "JSXEmptyExpression") {
              propsObjProps.push(
                babelTypes.objectProperty(babelTypes.identifier(name), babelTypes.stringLiteral("")),
              );
            }
            else {
              // onXXX属性で関数名（Identifier）の場合はthis.を付与
              if (/^on[A-Z]/.test(name) && attr.value.expression.type === "Identifier") {
                propsObjProps.push(
                  babelTypes.objectProperty(
                    babelTypes.identifier(name),
                    babelTypes.memberExpression(babelTypes.thisExpression(), attr.value.expression),
                  ),
                );
              // onXXX属性で関数リテラルの場合はそのまま
              }
              else if (/^on[A-Z]/.test(name) && (attr.value.expression.type === "ArrowFunctionExpression" || attr.value.expression.type === "FunctionExpression")) {
                propsObjProps.push(
                  babelTypes.objectProperty(babelTypes.identifier(name), attr.value.expression),
                );
              }
              else {
                propsObjProps.push(
                  babelTypes.objectProperty(babelTypes.identifier(name), jsxToHtmlAst(attr.value.expression, signals)),
                );
              }
            }
          }
        }
        else {
          // boolean属性
          propsObjProps.push(
            babelTypes.objectProperty(babelTypes.identifier(name), babelTypes.booleanLiteral(true)),
          );
        }
      }
    });
    // children
    const childrenExprs = node.children.filter(Boolean).map((child) => {
      if (child.type === "JSXElement" || child.type === "JSXFragment") {
        return jsxToHtmlAst(child, signals);
      }
      else if (child.type === "JSXText") {
        // 空白・タブ・改行のみのテキスト（インデント含む）は無視
        if (/^[\t\r\n ]*$/.test(child.value))
          return null;
        return babelTypes.stringLiteral(child.value);
      }
      else if (child.type === "JSXExpressionContainer") {
        if (child.expression.type === "JSXEmptyExpression") {
          return null;
        }
        else {
          return jsxToHtmlAst(child.expression, signals);
        }
      }
      else {
        return null;
      }
    }).filter((v): v is t.Expression => v !== null);
    if (childrenExprs.length > 0) {
      propsObjProps.push(
        babelTypes.objectProperty(
          babelTypes.identifier("children"),
          childrenExprs.length === 1 ? childrenExprs[0] : babelTypes.arrayExpression(childrenExprs as t.Expression[]),
        ),
      );
    }
    return babelTypes.callExpression(
      babelTypes.identifier("jsxDom"),
      [tag, babelTypes.objectExpression(propsObjProps)],
    );
  }
  // JSXText → 文字列
  if ((node as any).type === "JSXText") {
    return babelTypes.stringLiteral((node as any).value);
  }
  // JSXExpressionContainer → 中身を再帰
  if ((node as any).type === "JSXExpressionContainer") {
    if ((node as any).expression.type === "JSXEmptyExpression") {
      return babelTypes.stringLiteral("");
    }
    return jsxToHtmlAst((node as any).expression, signals);
  }
  // mapなどのCallExpressionで返り値がJSXを含む場合も対応
  if (
    node.type === "CallExpression"
    && node.callee.type === "MemberExpression"
    && node.callee.property.type === "Identifier"
    && node.callee.property.name === "map"
  ) {
    const callback = node.arguments[0];
    if (
      callback
      && (callback.type === "ArrowFunctionExpression" || callback.type === "FunctionExpression")
    ) {
      const body = callback.body;
      // アロー関数のbodyがJSXなら変換
      if (body.type === "JSXElement" || body.type === "JSXFragment") {
        const newCallback = babelTypes.arrowFunctionExpression(
          callback.params,
          jsxToHtmlAst(body, signals),
        );
        const mapped = babelTypes.callExpression(
          babelTypes.memberExpression(node.callee.object, babelTypes.identifier("map")),
          [newCallback],
        );
        return mapped;
      }
      // ブロックの場合はreturn文のargumentがJSXか判定
      if (body.type === "BlockStatement" && body.body.length > 0) {
        const ret = body.body.find(
          (s): s is t.ReturnStatement => s.type === "ReturnStatement" && !!s.argument,
        );
        if (
          ret
          && ret.argument
          && (ret.argument.type === "JSXElement" || ret.argument.type === "JSXFragment")
        ) {
          const newCallback = babelTypes.arrowFunctionExpression(
            callback.params,
            jsxToHtmlAst(ret.argument, signals),
          );
          const mapped = babelTypes.callExpression(
            babelTypes.memberExpression(node.callee.object, babelTypes.identifier("map")),
            [newCallback],
          );
          return mapped;
        }
      }
    }
  }
  // 三項演算子（ConditionalExpression）は各部分を再帰的に変換
  if (node.type === "ConditionalExpression") {
    const replaced = replaceSignalCalls(node, signals) as t.ConditionalExpression;
    return babelTypes.conditionalExpression(
      replaced.test,
      jsxToHtmlAst(replaced.consequent, signals),
      jsxToHtmlAst(replaced.alternate, signals),
    );
  }
  // signal呼び出しやprops参照などはreplaceSignalCallsで必ず変換
  const replaced = replaceSignalCalls(node, signals);
  // signal呼び出しはそのまま返す
  if (
    replaced.type === "CallExpression"
    && replaced.callee.type === "MemberExpression"
    && replaced.callee.object.type === "MemberExpression"
    && replaced.callee.object.object.type === "ThisExpression"
  ) {
    return replaced;
  }
  // それ以外の式はString()でラップ
  return babelTypes.callExpression(babelTypes.identifier("String"), [replaced]);
}
