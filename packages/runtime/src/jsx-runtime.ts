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
