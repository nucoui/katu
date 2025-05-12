import type * as t from "@babel/types";
import type { SignalInfo } from "./types";
import * as babelTypes from "@babel/types";

/**
 * JSXノードをHTML文字列に変換する関数
 */
export function jsxToHtmlAst(node: t.JSXElement | t.JSXFragment, signals: SignalInfo[]): t.Expression {
  if (node.type === "JSXFragment") {
    return babelTypes.callExpression(
      babelTypes.memberExpression(
        babelTypes.arrayExpression(node.children.filter(Boolean).map(child =>
          child.type === "JSXElement" || child.type === "JSXFragment"
            ? jsxToHtmlAst(child, signals)
            : child.type === "JSXText"
              ? babelTypes.stringLiteral(child.value)
              : child.type === "JSXExpressionContainer"
                ? (child.expression.type === "JSXEmptyExpression"
                    ? babelTypes.stringLiteral("")
                    : child.expression.type === "CallExpression"
                      ? child.expression
                      : babelTypes.callExpression(babelTypes.identifier("String"), [child.expression])
                  )
                : babelTypes.stringLiteral(""),
        )),
        babelTypes.identifier("join"),
      ),
      [babelTypes.stringLiteral("")],
    );
  }
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
                }
                else if (child.type === "JSXText") {
                  return babelTypes.stringLiteral(child.value);
                }
                else if (child.type === "JSXExpressionContainer") {
                  const expr = child.expression;
                  if (
                    expr.type === "CallExpression"
                    && expr.callee.type === "Identifier"
                    && signals.some(s => s.name === (expr.callee as t.Identifier).name)
                  ) {
                    const sig = signals.find(s => s.name === (expr.callee as t.Identifier).name)!;
                    return babelTypes.callExpression(
                      babelTypes.memberExpression(
                        babelTypes.memberExpression(
                          babelTypes.thisExpression(),
                          babelTypes.privateName(babelTypes.identifier(sig.name)),
                        ),
                        babelTypes.numericLiteral(0),
                        true,
                      ),
                      expr.arguments,
                    );
                  }
                  if (
                    expr.type === "CallExpression"
                    && expr.callee.type === "Identifier"
                    && signals.some(s => s.setter === (expr.callee as t.Identifier).name)
                  ) {
                    const sig = signals.find(s => s.setter === (expr.callee as t.Identifier).name)!;
                    return babelTypes.callExpression(
                      babelTypes.memberExpression(
                        babelTypes.memberExpression(
                          babelTypes.thisExpression(),
                          babelTypes.privateName(babelTypes.identifier(sig.name)),
                        ),
                        babelTypes.numericLiteral(1),
                        true,
                      ),
                      expr.arguments,
                    );
                  }
                  if (expr.type === "CallExpression" && expr.callee.type === "MemberExpression" && expr.callee.property.type === "Identifier" && expr.callee.property.name === "map") {
                    const mapArgs = expr.arguments;
                    if (mapArgs.length > 0 && (mapArgs[0].type === "ArrowFunctionExpression" || mapArgs[0].type === "FunctionExpression")) {
                      const cb = mapArgs[0];
                      if (cb.body.type === "JSXElement" || cb.body.type === "JSXFragment") {
                        const newCb = babelTypes.arrowFunctionExpression(
                          cb.params,
                          jsxToHtmlAst(cb.body, signals),
                        );
                        const newCall = babelTypes.callExpression(
                          babelTypes.memberExpression(expr.callee.object, expr.callee.property),
                          [newCb],
                        );
                        return babelTypes.callExpression(
                          babelTypes.memberExpression(newCall, babelTypes.identifier("join")),
                          [babelTypes.stringLiteral("")],
                        );
                      }
                    }
                    return babelTypes.callExpression(
                      babelTypes.memberExpression(expr, babelTypes.identifier("join")),
                      [babelTypes.stringLiteral("")],
                    );
                  }
                  else if (expr.type === "JSXEmptyExpression") {
                    return babelTypes.stringLiteral("");
                  }
                  else if (expr.type === "CallExpression") {
                    return expr;
                  }
                  else {
                    return babelTypes.callExpression(babelTypes.identifier("String"), [expr]);
                  }
                }
                else {
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
