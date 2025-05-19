import type { ToraJSXElement, ToraNode } from "../types/JSX.namespace";

/**
 * JSX.Fragment用の関数コンポーネント実装
 * JSX Fragment as a function component
 */
export function Fragment({ children }: { children: ToraNode }): ToraNode {
  // Fragmentはchildrenをそのまま返す（vNode化しない）
  return children;
}

/**
 * クライアント用: vNodeを生成するJSXランタイム関数
 * JSX runtime function for client: returns ToraJSXElement (VNode)
 * @param tag HTMLタグ名または関数コンポーネント
 * @param props 属性＋children
 * @returns ToraJSXElement
 */
export function jsx(
  tag: string | ((props: Record<string, unknown>) => ToraNode),
  props: Record<string, any>,
): ToraJSXElement {
  return { tag, props };
}

export { jsx as jsxs };
