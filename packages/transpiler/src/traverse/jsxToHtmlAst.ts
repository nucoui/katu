import type * as t from "@babel/types";
import type { SignalInfo } from "./types";
import * as babelTypes from "@babel/types";
import { replaceSignalCalls } from "./replaceSignalCalls";

/**
 * JSXノードや式ノードをHTML文字列に変換する関数
 * @param node Babel ASTノード（JSXElement, JSXFragment, JSXExpressionContainer, Expression, ConditionalExpressionなど）
 * @param signals signal情報
 * @returns Babel Expressionノード
 * @description
 * JSX/TSXのASTノードを静的HTML文字列へ変換するためのBabel式ノードを生成します。
 * 三項演算子の条件式(test)にはString()を適用せず、Boolean評価を維持します。
 *
 * Converts JSX/TSX AST nodes to Babel Expression nodes for static HTML string generation.
 * The test part of ConditionalExpression is not wrapped with String(), preserving boolean evaluation.
 */
export function jsxToHtmlAst(node: t.Expression | t.JSXElement | t.JSXFragment, signals: SignalInfo[]): t.Expression {
  if (!node) return babelTypes.stringLiteral("");
  if (node.type === "JSXFragment") {
    return babelTypes.callExpression(
      babelTypes.memberExpression(
        babelTypes.arrayExpression(node.children.filter(Boolean).map(child => {
          if (child.type === "JSXElement" || child.type === "JSXFragment") {
            return jsxToHtmlAst(child, signals);
          } else if (child.type === "JSXText") {
            return babelTypes.stringLiteral(child.value);
          } else if (child.type === "JSXExpressionContainer") {
            if (child.expression.type === "JSXEmptyExpression") {
              return babelTypes.stringLiteral("");
            } else {
              return jsxToHtmlAst(child.expression, signals);
            }
          } else {
            return babelTypes.stringLiteral("");
          }
        })),
        babelTypes.identifier("join"),
      ),
      [babelTypes.stringLiteral("")],
    );
  }
  if (node.type === "JSXElement") {
    const tag = node.openingElement.name.type === "JSXIdentifier" ? node.openingElement.name.name : "div";
    const children = node.children.filter(Boolean);
    const attrs = node.openingElement.attributes.map((attr) => {
      if (attr.type === "JSXAttribute") {
        const name = typeof attr.name.name === "string" ? attr.name.name : "";
        if (attr.value && attr.value.type === "StringLiteral") {
          return `${name}='${attr.value.value}'`;
        }
      }
      return null;
    }).filter(Boolean).join(" ");
    return babelTypes.binaryExpression(
      "+",
      babelTypes.stringLiteral(`<${tag}${attrs ? ` ${attrs}` : ""}>`),
      children.length === 0
        ? babelTypes.stringLiteral(`</${tag}>`)
        : babelTypes.binaryExpression(
            "+",
            babelTypes.callExpression(
              babelTypes.memberExpression(
                babelTypes.arrayExpression(children.map((child) => {
                  if (child.type === "JSXElement" || child.type === "JSXFragment") {
                    return jsxToHtmlAst(child, signals);
                  } else if (child.type === "JSXText") {
                    return babelTypes.stringLiteral(child.value);
                  } else if (child.type === "JSXExpressionContainer") {
                    if (child.expression.type === "JSXEmptyExpression") {
                      return babelTypes.stringLiteral("");
                    } else {
                      return jsxToHtmlAst(child.expression, signals);
                    }
                  } else {
                    return babelTypes.stringLiteral("");
                  }
                })),
                babelTypes.identifier("join"),
              ),
              [babelTypes.stringLiteral("")],
            ),
            babelTypes.stringLiteral(`</${tag}>`),
          ),
    );
  }
  // mapなどのCallExpressionで返り値がJSXを含む場合も対応
  if (
    node.type === "CallExpression" &&
    node.callee.type === "MemberExpression" &&
    node.callee.property.type === "Identifier" &&
    node.callee.property.name === "map"
  ) {
    const callback = node.arguments[0];
    if (
      callback &&
      (callback.type === "ArrowFunctionExpression" || callback.type === "FunctionExpression")
    ) {
      const body = callback.body;
      // アロー関数のbodyがJSXなら変換
      if (body.type === "JSXElement" || body.type === "JSXFragment") {
        // mapの返り値を変換してjoin
        const newCallback = babelTypes.arrowFunctionExpression(
          callback.params,
          jsxToHtmlAst(body, signals)
        );
        const mapped = babelTypes.callExpression(
          babelTypes.memberExpression(node.callee.object, babelTypes.identifier("map")),
          [newCallback]
        );
        return babelTypes.callExpression(
          babelTypes.memberExpression(mapped, babelTypes.identifier("join")),
          [babelTypes.stringLiteral("")]
        );
      }
      // ブロックの場合はreturn文のargumentがJSXか判定
      if (body.type === "BlockStatement" && body.body.length > 0) {
        const ret = body.body.find(
          (s): s is t.ReturnStatement => s.type === "ReturnStatement" && !!s.argument
        );
        if (
          ret &&
          ret.argument &&
          (ret.argument.type === "JSXElement" || ret.argument.type === "JSXFragment")
        ) {
          const newCallback = babelTypes.arrowFunctionExpression(
            callback.params,
            jsxToHtmlAst(ret.argument, signals)
          );
          const mapped = babelTypes.callExpression(
            babelTypes.memberExpression(node.callee.object, babelTypes.identifier("map")),
            [newCallback]
          );
          return babelTypes.callExpression(
            babelTypes.memberExpression(mapped, babelTypes.identifier("join")),
            [babelTypes.stringLiteral("")]
          );
        }
      }
    }
    // それ以外は従来通り
  }
  // 三項演算子（ConditionalExpression）は各部分を再帰的に変換
  if (node.type === "ConditionalExpression") {
    const replaced = replaceSignalCalls(node, signals) as t.ConditionalExpression;
    // test部分はBoolean評価のためString()でラップしない
    return babelTypes.conditionalExpression(
      replaced.test, // ここはreplaceSignalCallsのみ適用
      jsxToHtmlAst(replaced.consequent, signals),
      jsxToHtmlAst(replaced.alternate, signals),
    );
  }
  // signal呼び出しやprops参照などはreplaceSignalCallsで必ず変換
  const replaced = replaceSignalCalls(node, signals);
  // signal呼び出しはそのまま返す
  if (
    replaced.type === "CallExpression" &&
    replaced.callee.type === "MemberExpression" &&
    replaced.callee.object.type === "MemberExpression" &&
    replaced.callee.object.object.type === "ThisExpression"
  ) {
    return replaced;
  }
  // それ以外の式はString()でラップ
  return babelTypes.callExpression(babelTypes.identifier("String"), [replaced]);
}
