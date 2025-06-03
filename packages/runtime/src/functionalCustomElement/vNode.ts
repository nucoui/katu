// 内部属性のプレフィックス - 実DOMには反映されないが仮想DOMでは使用される
export const _INTERNAL_ATTRIBUTES = "_tora_internal_:";

/**
 * 内部属性かどうかを判定する
 * @param key 属性名
 * @returns 内部属性の場合はtrue
 */
export function isInternalAttribute(key: string): boolean {
  return key.startsWith(_INTERNAL_ATTRIBUTES);
}

/**
 * 内部属性の実際の名前を取得する（プレフィックスを除去）
 * @param key 内部属性名
 * @returns プレフィックスを除去した属性名
 */
export function getInternalAttributeName(key: string): string {
  if (!isInternalAttribute(key))
    return key;
  return key.substring(_INTERNAL_ATTRIBUTES.length);
}

/**
 * 仮想DOMノードから内部属性の値を取得する
 * @param vnode 仮想DOMノード
 * @param name 内部属性名（data-chatora-internalなど、プレフィックスなし）
 * @returns 属性値または undefined
 */
export function getInternalAttributeValue(vnode: VNode, name: string): any {
  const fullName = `${_INTERNAL_ATTRIBUTES}${name}`;
  return vnode.props[fullName];
}

/**
 * 仮想DOMノードに内部属性が存在するかチェックする
 * @param vnode 仮想DOMノード
 * @param name 内部属性名（data-chatora-internalなど、プレフィックスなし）
 * @returns 属性が存在する場合はtrue
 */
export function hasInternalAttribute(vnode: VNode, name: string): boolean {
  const fullName = `${_INTERNAL_ATTRIBUTES}${name}`;
  return fullName in vnode.props;
}

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
 * @param tag HTML要素のタグ名
 * @param props JSX属性と子要素を含むオブジェクト
 * @returns 仮想DOMノード(VNode)
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

  // props処理の最適化：事前にエントリ配列を取得してfor文で処理
  const propsEntries = Object.entries(vnode.props);
  for (let i = 0; i < propsEntries.length; i++) {
    const [k, v] = propsEntries[i];
    if (v == null)
      continue;

    // 内部属性（_tora_internal_:プレフィックスを持つ）はDOMに反映しない
    if (k.length > _INTERNAL_ATTRIBUTES.length && k.startsWith(_INTERNAL_ATTRIBUTES))
      continue;

    // イベントハンドラの判定を最適化（正規表現を避ける）
    if (k.length > 2 && k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110 && k.charCodeAt(2) >= 65 && k.charCodeAt(2) <= 90 && typeof v === "function") { // 'o'=111, 'n'=110, 'A'-'Z'=65-90
      // onClickなどはイベントリスナーとして登録
      const event = k.slice(2).toLowerCase();
      el.addEventListener(event, v);
    }
    else if (typeof v === "boolean") {
      v ? el.setAttribute(k, "") : el.removeAttribute(k);
    }
    else {
      el.setAttribute(k, String(v));
    }
  }

  // children処理の最適化
  const children = vnode.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
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

  // イベントリスナーの更新を効率化するためのマップ
  const oldEventListeners = new Map<string, EventListenerOrEventListenerObject>();
  const newEventListeners = new Map<string, EventListenerOrEventListenerObject>();

  // 古いイベントリスナーを収集（正規表現を避けて最適化）
  const oldPropsEntries = Object.entries(oldVNode.props);
  for (let i = 0; i < oldPropsEntries.length; i++) {
    const [k, v] = oldPropsEntries[i];
    if (k.length > 2 && k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110 && k.charCodeAt(2) >= 65 && k.charCodeAt(2) <= 90 && typeof v === "function") { // 'o'=111, 'n'=110, 'A'-'Z'=65-90
      oldEventListeners.set(k.slice(2).toLowerCase(), v);
    }
  }

  // 新しいpropsを適用（最適化版）
  const newPropsEntries = Object.entries(newVNode.props);
  for (let i = 0; i < newPropsEntries.length; i++) {
    const [k, v] = newPropsEntries[i];
    // 内部属性（_tora_internal_:プレフィックスを持つ）はDOMに反映しない
    if (k.startsWith(_INTERNAL_ATTRIBUTES))
      continue;

    if (k.length > 2 && k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110 && k.charCodeAt(2) >= 65 && k.charCodeAt(2) <= 90 && typeof v === "function") { // 'o'=111, 'n'=110, 'A'-'Z'=65-90
      // イベントリスナーの処理
      const event = k.slice(2).toLowerCase();
      newEventListeners.set(event, v);

      // 古いリスナーと異なる場合のみ更新
      const oldListener = oldEventListeners.get(event);
      if (oldListener !== v) {
        if (oldListener) {
          el.removeEventListener(event, oldListener);
        }
        el.addEventListener(event, v);
      }
      continue;
    }

    // 値が変わった場合のみ更新
    if (oldVNode.props[k] !== v) {
      if (typeof v === "boolean") {
        v ? el.setAttribute(k, "") : el.removeAttribute(k);
      }
      else if (v == null) {
        el.removeAttribute(k);
      }
      else {
        el.setAttribute(k, String(v));
      }
    }
  }

  // 古いイベントリスナーを削除（新しいpropsに存在しないもの）
  for (const [event, listener] of oldEventListeners.entries()) {
    if (!newEventListeners.has(event)) {
      el.removeEventListener(event, listener);
    }
  }

  // 削除された属性を処理（最適化版）
  for (let i = 0; i < oldPropsEntries.length; i++) {
    const [k] = oldPropsEntries[i];
    // 内部属性と既に処理されたイベントリスナーは無視
    if (k.startsWith(_INTERNAL_ATTRIBUTES) || (k.length > 2 && k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110 && k.charCodeAt(2) >= 65 && k.charCodeAt(2) <= 90 && typeof oldVNode.props[k] === "function"))
      continue;

    if (!(k in newVNode.props)) {
      el.removeAttribute(k);
    }
  }

  const oldChildren = oldVNode.children;
  const newChildren = newVNode.children;

  // 1. まず新しい子要素をすべて更新または追加する
  for (let i = 0; i < newChildren.length; i++) {
    if (i >= oldChildren.length) {
      // 新しい要素を追加
      el.appendChild(
        typeof newChildren[i] === "string"
          ? document.createTextNode(newChildren[i] as string)
          : mount(newChildren[i] as VNode),
      );
    }
    else if (
      typeof oldChildren[i] === "string"
      && typeof newChildren[i] === "string"
    ) {
      // 文字列ノードの更新（値が変わった場合のみ）
      if (oldChildren[i] !== newChildren[i]) {
        el.childNodes[i].textContent = newChildren[i] as string;
      }
    }
    else if (
      typeof oldChildren[i] === "object"
      && typeof newChildren[i] === "object"
    ) {
      // オブジェクトノードの更新（再帰的）
      patch(el, oldChildren[i] as VNode, newChildren[i] as VNode, i);
    }
    else {
      // タイプが異なる場合は置換
      el.replaceChild(
        typeof newChildren[i] === "string"
          ? document.createTextNode(newChildren[i] as string)
          : mount(newChildren[i] as VNode),
        el.childNodes[i],
      );
    }
  }

  // 2. 古い要素で余分なものを削除（後ろから削除することで、インデックスのズレを防ぐ）
  if (newChildren.length < oldChildren.length) {
    // 削除すべき余分な子要素を効率的に削除
    for (let i = oldChildren.length - 1; i >= newChildren.length; i--) {
      const childToRemove = el.childNodes[i];
      if (childToRemove) {
        el.removeChild(childToRemove);
      }
    }
  }
}
