import type { IC } from "@/main";
import type { ChatoraJSXElement, ChatoraNode } from "../types/JSX.namespace";

/**
 * JSX.Fragment用の関数コンポーネント実装
 * JSX Fragment as a function component - #fragmentタグを返し、normalizeChildrenで平坦化される
 */
export const Fragment: IC<{ children: ChatoraNode }> = ({ children }) => {
  return () => ({
    tag: "#fragment",
    props: {
      children: Array.isArray(children) ? children : [children],
    },
  });
};

type HostProps = {
  children: ChatoraNode;
  shadowRoot?: boolean;
  style?: string | string[];
} & ({
  shadowRoot?: true;
  shadowRootMode?: "open" | "closed";
} | {
  shadowRoot?: false;
  shadowRootMode?: never;
});

export const Host: IC<HostProps> = ({ children, ...rest }) => {
  return () => ({
    tag: "#root",
    props: {
      children: Array.isArray(children) ? children : [children],
      ...rest,
    },
  });
};

/**
 * クライアント用: vNodeを生成するJSXランタイム関数
 * JSX runtime function for client: returns ChatoraJSXElement (VNode)
 * @param tag HTMLタグ名または関数コンポーネント
 * @param props 属性＋children
 * @returns ChatoraJSXElement
 */
export function jsx(
  tag: string | IC,
  props: Record<string, any>,
): ChatoraJSXElement {
  return { tag, props };
}

export { jsx as jsxs };
