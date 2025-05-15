// 新vNode型・生成・マウント・パッチ（最小構成、stringタグのみ対応）
export type VNode = {
  tag: string;
  props: Record<string, any>;
  children: Array<VNode | string>;
};

function normalizeChildren(input: any): Array<VNode | string> {
  if (input == null)
    return [];
  if (Array.isArray(input))
    return input.flatMap(normalizeChildren);
  if (typeof input === "string" || typeof input === "number")
    return [String(input)];
  if (typeof input === "object" && input !== null && "tag" in input && "props" in input && typeof input.tag === "string") {
    return [createVNode(input.tag, input.props)];
  }
  return [];
}

/**
 * JSXからの出力をvNodeに変換
 */
export function createVNode(tag: string, props: Record<string, any>): VNode {
  const { children, ...rest } = props ?? {};
  return {
    tag,
    props: rest,
    children: normalizeChildren(children),
  };
}

/**
 * vNodeからDOMノードを生成
 *
 * @param vnode vNodeオブジェクト
 * @returns DOMノード
 *
 * 日本語: vNodeからDOMノードを生成します。propsのboolean値はHTML属性としてtrueで空文字、falseで削除します。
 * English: Generates a DOM node from a vNode. Boolean props are set as empty string for true, removed for false.
 */
export function mount(vnode: VNode): Node {
  const el = document.createElement(vnode.tag);
  for (const [k, v] of Object.entries(vnode.props)) {
    if (v == null)
      continue;
    if (/^on[A-Z]/.test(k) && typeof v === "function") {
      // onClickなどはイベントリスナーとして登録
      const event = k.slice(2).toLowerCase();
      el.addEventListener(event, v as EventListenerOrEventListenerObject);
    }
    else if (typeof v === "boolean") {
      if (v) {
        el.setAttribute(k, "");
      }
      else {
        el.removeAttribute(k);
      }
    }
    else {
      el.setAttribute(k, String(v));
    }
  }
  for (const child of Array.isArray(vnode.children) ? vnode.children : []) {
    el.appendChild(
      typeof child === "string" ? document.createTextNode(child) : mount(child),
    );
  }
  return el;
}

/**
 * vNodeの差分を比較し、必要な箇所だけDOMを更新
 *
 * @param parent 親ノード
 * @param oldVNode 以前のvNode
 * @param newVNode 新しいvNode
 * @param index 子ノードのインデックス
 *
 * 日本語: vNodeの差分を比較し、propsのboolean値はHTML属性としてtrueで空文字、falseで削除します。
 * English: Compares vNode diffs and updates only necessary DOM parts. Boolean props are set as empty string for true, removed for false.
 */
export function patch(parent: Node, oldVNode: VNode, newVNode: VNode, index = 0) {
  const el = parent.childNodes[index] as Element;
  if (!el || oldVNode.tag !== newVNode.tag) {
    parent.replaceChild(mount(newVNode), el);
    return;
  }
  for (const [k, v] of Object.entries(newVNode.props)) {
    if (oldVNode.props[k] !== v) {
      if (typeof v === "boolean") {
        if (v) {
          el.setAttribute(k, "");
        }
        else {
          el.removeAttribute(k);
        }
      }
      else {
        el.setAttribute(k, String(v));
      }
    }
  }
  for (const k of Object.keys(oldVNode.props)) {
    if (!(k in newVNode.props)) {
      el.removeAttribute(k);
    }
  }

  const oldChildren = oldVNode.children;
  const newChildren = newVNode.children;
  const max = Math.max(oldChildren.length, newChildren.length);

  for (let i = 0; i < max; i++) {
    if (i >= oldChildren.length) {
      el.appendChild(
        typeof newChildren[i] === "string"
          ? document.createTextNode(newChildren[i] as string)
          : mount(newChildren[i] as VNode),
      );
    }
    else if (i >= newChildren.length) {
      el.removeChild(el.childNodes[i]);
    }
    else if (
      typeof oldChildren[i] === "string"
      && typeof newChildren[i] === "string"
    ) {
      if (oldChildren[i] !== newChildren[i]) {
        el.childNodes[i].textContent = newChildren[i] as string;
      }
    }
    else if (
      typeof oldChildren[i] === "object"
      && typeof newChildren[i] === "object"
    ) {
      patch(el, oldChildren[i] as VNode, newChildren[i] as VNode, i);
    }
    else {
      el.replaceChild(
        typeof newChildren[i] === "string"
          ? document.createTextNode(newChildren[i] as string)
          : mount(newChildren[i] as VNode),
        el.childNodes[i],
      );
    }
  }
}
