import type { VNode } from "@/functionalCustomElement/vNode";
import { mount } from "@/functionalCustomElement/mount";

// VNode変換の最適化（インライン化）
function toVNode(child: VNode | string | undefined): VNode {
  if (typeof child === "string") {
    return { tag: "#text", props: {}, children: [child] };
  }
  if (!child) {
    return { tag: "#empty", props: {}, children: [] };
  }
  return child;
}

// プロパティパッチの最適化
function patchProps(el: HTMLElement, oldProps: Record<string, any>, newProps: Record<string, any>) {
  // 高速パス: プロパティが同じオブジェクトの場合
  if (oldProps === newProps)
    return;

  // 削除されたプロパティを処理
  for (const k in oldProps) {
    if (!(k in newProps)) {
      if (k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110 && typeof oldProps[k] === "function") { // "on"
        const event = k.slice(2).toLowerCase();
        el.removeEventListener(event, oldProps[k]);
      }
      else {
        el.removeAttribute(k);
      }
    }
  }

  // 新規・更新されたプロパティを処理
  for (const k in newProps) {
    const newVal = newProps[k];
    const oldVal = oldProps[k];

    // 値が同じなら何もしない（高速化）
    if (newVal === oldVal)
      continue;

    if (newVal == null || newVal === undefined) {
      el.removeAttribute(k);
      continue;
    }

    if (k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110 && typeof newVal === "function") { // "on"
      const event = k.slice(2).toLowerCase();
      if (oldVal)
        el.removeEventListener(event, oldVal);
      el.addEventListener(event, newVal);
    }
    else if (typeof newVal === "boolean") {
      newVal ? el.setAttribute(k, "") : el.removeAttribute(k);
    }
    else {
      const newStr = String(newVal);
      if (el.getAttribute(k) !== newStr) {
        el.setAttribute(k, newStr);
      }
    }
  }
}

// 子要素パッチの最適化
function patchChildren(
  oldChildren: Array<VNode | string>,
  newChildren: Array<VNode | string>,
  parent: Node,
  getChildDom: (idx: number) => Node | null,
  insertRef: Node | null = null,
) {
  const oldLen = oldChildren.length;
  const newLen = newChildren.length;

  // 高速パス: 両方空の場合
  if (oldLen === 0 && newLen === 0)
    return;

  // 高速パス: 長さが同じで全て文字列の場合
  if (oldLen === newLen && oldLen > 0) {
    let allStrings = true;
    for (let i = 0; i < oldLen; i++) {
      if (typeof oldChildren[i] !== "string" || typeof newChildren[i] !== "string") {
        allStrings = false;
        break;
      }
    }
    if (allStrings) {
      for (let i = 0; i < oldLen; i++) {
        const childDom = getChildDom(i);
        if (childDom && childDom.nodeType === Node.TEXT_NODE && oldChildren[i] !== newChildren[i]) {
          childDom.textContent = newChildren[i] as string;
        }
      }
      return;
    }
  }

  const maxLen = Math.max(oldLen, newLen);

  // 通常の差分パッチ処理（逆順で処理して削除時のインデックスズレを回避）
  for (let i = maxLen - 1; i >= 0; i--) {
    const oldChild = i < oldLen ? toVNode(oldChildren[i]) : undefined;
    const newChild = i < newLen ? toVNode(newChildren[i]) : undefined;
    const childDom = getChildDom(i);

    if (oldChild && newChild) {
      // 既存ノードをpatch
      if (childDom) {
        patch(oldChild, newChild, parent, childDom);
      }
    }
    else if (!oldChild && newChild) {
      // 新しいノードを追加
      const newNode = mount(newChild);
      if (parent instanceof Element || parent instanceof ShadowRoot) {
        if (insertRef) {
          parent.insertBefore(newNode, insertRef);
        }
        else {
          parent.appendChild(newNode);
        }
      }
    }
    else if (oldChild && !newChild) {
      // 古いノードを削除
      if (childDom && (parent instanceof Element || parent instanceof ShadowRoot)) {
        parent.removeChild(childDom);
      }
    }
  }
}

/**
 * Patch the DOM by comparing oldVNode and newVNode, updating only the changed parts.
 * @param oldVNode The previous virtual node
 * @param newVNode The new virtual node
 * @param parent The parent DOM node
 * @param domNode The current DOM node corresponding to oldVNode
 * @returns The updated DOM node
 */
export function patch(
  oldVNode: VNode,
  newVNode: VNode,
  parent: Node,
  domNode: Node,
): Node {
  // 高速パス: 同じVNodeオブジェクトの場合
  if (oldVNode === newVNode)
    return domNode;

  // 早期リターン: ノードが存在しない場合
  if (!domNode) {
    const newDom = mount(newVNode);
    if (parent instanceof Element || parent instanceof ShadowRoot) {
      parent.appendChild(newDom);
    }
    return newDom;
  }

  const oldTag = oldVNode.tag;
  const newTag = newVNode.tag;

  // 早期リターン: タグが変わった場合は置換
  if (oldTag !== newTag) {
    const newDom = mount(newVNode);
    parent.replaceChild(newDom, domNode);
    return newDom;
  }

  // テキストノードの最適化
  if (newTag === "#text") {
    if (domNode.nodeType === Node.TEXT_NODE) {
      const newText = newVNode.children.join("");
      if (domNode.textContent !== newText) {
        domNode.textContent = newText;
      }
      return domNode;
    }
    const newDom = mount(newVNode);
    parent.replaceChild(newDom, domNode);
    return newDom;
  }

  // 空ノードの場合
  if (newTag === "#empty") {
    return domNode;
  }

  // 通常のHTMLエレメント
  if (typeof newTag === "string" && newTag !== "#fragment") {
    const el = domNode as HTMLElement;
    const oldProps = oldVNode.props || {};
    const newProps = newVNode.props || {};

    // プロパティの差分更新
    patchProps(el, oldProps, newProps);

    // 子要素の差分更新
    patchChildren(
      oldVNode.children || [],
      newVNode.children || [],
      el,
      idx => el.childNodes[idx] || null,
    );
    return el;
  }

  // その他の場合は新しくマウント
  const newDom = mount(newVNode);
  parent.replaceChild(newDom, domNode);
  return newDom;
}
