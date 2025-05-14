import type { KatuJSXElement } from "@root/types/JSX.namespace";

/**
 * 仮想DOMノード型（最小構成）
 * Virtual DOM node type (minimal)
 */
type VNode = {
  tag: string;
  /**
   * 属性・イベントハンドラを含むprops
   * Props including attributes and event handlers
   */
  props: Record<string, any>;
  children: Array<VNode | string>;
  /**
   * Fragmentノードかどうか
   * Whether this node is a Fragment
   */
  isFragment?: boolean;
};

/**
 * childrenを常に配列として正規化し、KatuJSXElementはVNodeに変換する
 * Utility to normalize children to an array of VNode or string
 */
function normalizeChildren(input: any): Array<VNode | string> {
  if (input == null)
    return [];
  if (Array.isArray(input)) {
    return input.flatMap(normalizeChildren);
  }
  if (typeof input === "string" || typeof input === "number") {
    return [String(input)];
  }
  // KatuJSXElementの場合はVNodeに変換
  if (typeof input === "object" && "tag" in input && "props" in input) {
    return [nodeToVNode(input)];
  }
  return [];
}

/**
 * NodeまたはKatuJSXElementからVNodeへ変換する関数
 * Convert a real DOM Node or KatuJSXElement to a VNode
 * @param node DOMノードまたはKatuJSXElement
 * @returns VNodeまたはstring
 */
function nodeToVNode(node: Node): VNode | string;
function nodeToVNode(node: KatuJSXElement): VNode | string;
function nodeToVNode(node: any): VNode | string {
  // KatuJSXElementの場合
  if (node && typeof node === "object" && "tag" in node && "props" in node) {
    // childrenをpropsから除外
    const { children: _children, ...restProps } = node.props ?? {};
    // Fragmentの場合はchildrenを平坦化
    if (node.tag === "__fragment__") {
      const children = normalizeChildren(node.props.children);
      return {
        tag: "__fragment__",
        props: {},
        children,
        isFragment: true,
      };
    }
    // 通常ノード
    return {
      tag: node.tag,
      props: restProps,
      children: normalizeChildren(node.props.children),
    };
  }
  // Nodeの場合
  if (node instanceof Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent || "";
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const el = node as Element;
      const props: Record<string, string> = {};
      for (const attr of Array.from(el.attributes)) {
        props[attr.name] = attr.value;
      }
      const children = Array.from(node.childNodes).map(nodeToVNode);
      return { tag: el.tagName, props, children };
    }
  }
  return "";
}

/**
 * VNodeからNodeを生成する関数
 * Create a real DOM Node from a VNode
 */
function createNode(vnode: VNode | string): Node {
  if (typeof vnode === "string") {
    return document.createTextNode(vnode);
  }
  if (vnode.isFragment) {
    const fragment = document.createDocumentFragment();
    vnode.children.forEach((child) => {
      fragment.appendChild(createNode(child));
    });
    return fragment;
  }
  const el = document.createElement(vnode.tag);
  for (const [k, v] of Object.entries(vnode.props)) {
    if (/^on[A-Z]/.test(k) && typeof v === "function") {
      const event = k.slice(2).toLowerCase();
      el.addEventListener(event, v);
    }
    else if (v === true) {
      el.setAttribute(k, "");
    }
    else if (v != null && typeof v !== "function") {
      el.setAttribute(k, String(v));
    }
  }
  vnode.children.forEach((child) => {
    el.appendChild(createNode(child));
  });
  return el;
}

/**
 * 2つのVNodeを比較し、差分だけを実DOMに反映するpatch関数
 * Patch the real DOM based on the diff between two VNodes
 */
function patch(parent: Node, oldVNode: VNode | string | null, newVNode: VNode | string, index = 0) {
  const child = parent.childNodes[index];
  if (!oldVNode) {
    parent.appendChild(createNode(newVNode));
    return;
  }
  if (!newVNode) {
    if (child)
      parent.removeChild(child);
    return;
  }
  if (typeof oldVNode === "string" || typeof newVNode === "string") {
    if (oldVNode !== newVNode) {
      parent.replaceChild(createNode(newVNode), child);
    }
    return;
  }
  if (oldVNode.tag !== newVNode.tag) {
    parent.replaceChild(createNode(newVNode), child);
    return;
  }
  // 属性の差分反映
  const el = child as Element;
  for (const [k, v] of Object.entries(newVNode.props)) {
    if (/^on[A-Z]/.test(k) && typeof v === "function") {
      // onClick等はaddEventListenerでバインド
      const event = k.slice(2).toLowerCase();
      el.addEventListener(event, v);
    }
    else if (el.getAttribute(k) !== v && typeof v !== "function") {
      el.setAttribute(k, v);
    }
  }
  for (const k of Object.keys(oldVNode.props)) {
    if (!(k in newVNode.props)) {
      el.removeAttribute(k);
    }
  }
  // 子要素の差分反映
  const oldChildren = Array.isArray(oldVNode.children) ? oldVNode.children : [];
  const newChildren = Array.isArray(newVNode.children) ? newVNode.children : [];
  const max = Math.max(oldChildren.length, newChildren.length);
  for (let i = 0; i < max; i++) {
    patch(child, oldChildren[i], newChildren[i], i);
  }
}

export { createNode, nodeToVNode, patch };
export type { VNode };
