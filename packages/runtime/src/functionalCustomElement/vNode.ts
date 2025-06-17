import type { ChatoraNode } from "@root/types/JSX.namespace";

export type VNode = {
  tag: "#text" | "#empty" | "#fragment" | "#unknown" | string;
  props: Record<string | `on${string}`, any>;
  children: Array<VNode | string>;
};

// 空配列とオブジェクトの再利用でメモリ使用量を削減
const EMPTY_ARRAY: Array<VNode | string> = [];
const EMPTY_PROPS: Record<string, any> = {};

function normalizeChildren(input: ChatoraNode): Array<VNode | string> {
  if (input == null)
    return EMPTY_ARRAY;

  if (Array.isArray(input)) {
    const result: Array<VNode | string> = [];
    for (let i = 0; i < input.length; i++) {
      const normalized = normalizeChildren(input[i]);
      result.push(...normalized);
    }
    return result;
  }

  if (typeof input === "string" || typeof input === "number") {
    return [{ tag: "#text", props: EMPTY_PROPS, children: [String(input)] }];
  }

  if (typeof input === "object" && input !== null) {
    const vnode = genVNode(input);
    // fragmentの場合は子要素を平坦化（1レベルのみ）
    if (vnode.tag === "#fragment") {
      return vnode.children;
    }
    return [vnode];
  }

  return EMPTY_ARRAY;
}

export function genVNode(node: ChatoraNode): VNode {
  // 早期リターン: nullish値
  if (node == null || node === false || node === true || node === undefined) {
    return { tag: "#empty", props: EMPTY_PROPS, children: EMPTY_ARRAY };
  }

  // 早期リターン: プリミティブ値
  if (typeof node === "string" || typeof node === "number") {
    return { tag: "#text", props: EMPTY_PROPS, children: [String(node)] };
  }

  // オブジェクトの場合
  if ("tag" in node && "props" in node) {
    const { tag, props } = node;
    const { children, ...restProps } = props ?? {};

    // 関数コンポーネントの処理
    if (typeof tag === "function") {
      const result = tag(props as any);
      if (typeof result === "function") {
        const next = result();
        if (next && typeof next === "object" && "tag" in next && "props" in next) {
          return genVNode(next);
        }
      }
    }

    // 文字列タグの処理
    if (typeof tag === "string") {
      const normalizedChildren = children ? normalizeChildren(children as Array<VNode | string>) : EMPTY_ARRAY;
      const finalProps = Object.keys(restProps || {}).length > 0 ? (restProps ?? {}) : EMPTY_PROPS;

      if (tag === "#fragment") {
        return {
          tag: "#fragment",
          props: finalProps,
          children: normalizedChildren,
        };
      }

      return {
        tag,
        props: finalProps,
        children: normalizedChildren,
      };
    }

    // 未知のタグ
    return {
      tag: "#unknown",
      props: Object.keys(restProps || {}).length > 0 ? (restProps ?? {}) : EMPTY_PROPS,
      children: normalizeChildren(children as Array<VNode | string>),
    };
  }

  throw new Error(`Invalid node type: ${typeof node}`);
};
