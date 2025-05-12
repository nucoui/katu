import type * as t from "@babel/types";
import type { EventBinding } from "./types";
import * as babelTypes from "@babel/types";

/**
 * JSXからイベントハンドラ抽出＋data属性付与
 */
export function extractEventHandlersAndMark(
  node: t.JSXElement | t.JSXFragment,
  eventBindings: EventBinding[],
  eventIdx: { current: number },
): void {
  if (node.type === "JSXElement") {
    // const tag = node.openingElement.name.type === "JSXIdentifier" ? node.openingElement.name.name : "";
    let handlerName = null;
    let eventName = null;
    node.openingElement.attributes.forEach((attr) => {
      if (
        attr.type === "JSXAttribute"
        && typeof attr.name.name === "string"
        && attr.name.name.startsWith("on")
      ) {
        eventName = attr.name.name.slice(2).toLowerCase();
        if (attr.value && attr.value.type === "JSXExpressionContainer") {
          if (attr.value.expression.type === "Identifier") {
            handlerName = attr.value.expression.name;
          }
        }
      }
    });
    if (handlerName && eventName) {
      node.openingElement.attributes.push(
        babelTypes.jsxAttribute(
          babelTypes.jsxIdentifier("data-katu-evt"),
          babelTypes.stringLiteral(`${eventName}-${eventIdx.current}`),
        ),
      );
      eventBindings.push({ selector: `[data-katu-evt=\"${eventName}-${eventIdx.current}\"]`, event: eventName, handler: handlerName });
      eventIdx.current++;
    }
    node.children.forEach((child) => {
      if (child && (child.type === "JSXElement" || child.type === "JSXFragment")) {
        extractEventHandlersAndMark(child, eventBindings, eventIdx);
      }
    });
  }
  else if (node.type === "JSXFragment") {
    node.children.forEach((child) => {
      if (child && (child.type === "JSXElement" || child.type === "JSXFragment")) {
        extractEventHandlersAndMark(child, eventBindings, eventIdx);
      }
    });
  }
}
