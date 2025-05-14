import type { KatuJSXElement, KatuNode } from "../types/JSX.namespace";

/**
 * JSX.Fragment用の関数コンポーネント実装
 * JSX Fragment as a function component
 */
export function Fragment({ children }: { children: KatuNode }): KatuNode {
  // Fragmentはchildrenをそのまま返す（vNode化しない）
  return children;
}

/**
 * クライアント用: vNodeを生成するJSXランタイム関数
 * JSX runtime function for client: returns KatuJSXElement (VNode)
 * @param tag HTMLタグ名または関数コンポーネント
 * @param props 属性＋children
 * @returns KatuJSXElement
 */
export function jsx(
  tag: string | ((props: Record<string, unknown>) => KatuNode),
  props: Record<string, any>,
): KatuJSXElement {
  return { tag, props };
}

export { jsx as jsxs };

// export function jsxString(tag: string | typeof Fragment, props: Record<string, any>): string {
//   // Fragmentは子要素をそのまま連結
//   if (tag === Fragment || tag === "__fragment__") {
//     const c = props.children;
//     if (Array.isArray(c))
//       return c.map(String).join("");
//     return c != null ? String(c) : "";
//   }
//   let attrs = "";
//   for (const key in props) {
//     // onXXX属性（関数）はHTML属性として出力しない
//     if (key === "children" || props[key] == null || typeof props[key] === "function" || (/^on[A-Z]/.test(key) && typeof props[key] === "function"))
//       continue;
//     if (props[key] === true) {
//       attrs += ` ${key}`;
//     }
//     else {
//       attrs += ` ${key}='${String(props[key]).replace(/'/g, "&#39;")}'`;
//     }
//   }
//   const children = props.children;
//   let resultChildren = "";
//   if (Array.isArray(children))
//     resultChildren = children.map(String).join("");
//   else if (children == null)
//     resultChildren = "";
//   else
//     resultChildren = String(children);
//   return `<${typeof tag === "string" ? tag : "div"}${attrs}>${resultChildren}</${typeof tag === "string" ? tag : "div"}>`;
// }
