import type { VNode } from "./vNode";

// 空オブジェクトの参照
const EMPTY_PROPS: Record<string, any> = {};

/**
 * Generates a DOM node from a vNode. Boolean props are set as empty string for true, removed for false.
 * @param vnode vNode object
 * @param _parent Parent DOM node (optional for compatibility)
 * @returns DOM node
 */
export function mount(vnode: VNode, _parent?: HTMLElement | ShadowRoot | Element | DocumentFragment): Node {
  const { tag, props, children } = vnode;

  // 最も頻繁なケースを最初に処理
  if (typeof tag === "string" && tag !== "#text" && tag !== "#empty" && tag !== "#fragment") {
    // 通常のHTML要素の高速パス
    const el = document.createElement(tag);

    // プロパティ設定の最適化
    if (props && props !== EMPTY_PROPS) {
      for (const k in props) {
        const v = props[k];
        if (v == null)
          continue;

        // イベントハンドラの高速チェック
        if (k.charCodeAt(0) === 111 && k.charCodeAt(1) === 110 && typeof v === "function") { // "on"
          const event = k.slice(2).toLowerCase();
          el.addEventListener(event, v as EventListenerOrEventListenerObject);
        }
        else if (typeof v === "boolean") {
          if (v)
            el.setAttribute(k, "");
        }
        else {
          el.setAttribute(k, String(v));
        }
      }
    }

    // 子要素の追加最適化
    if (children.length > 0) {
      if (children.length === 1) {
        // 子要素が1つの場合の高速パス
        const child = children[0];
        const node = typeof child === "string" ? document.createTextNode(child) : mount(child);
        el.appendChild(node);
      }
      else {
        // 複数の子要素の場合はDocumentFragmentを使用
        const fragment = document.createDocumentFragment();
        for (let i = 0; i < children.length; i++) {
          const child = children[i];
          const node = typeof child === "string" ? document.createTextNode(child) : mount(child);
          fragment.appendChild(node);
        }
        el.appendChild(fragment);
      }
    }

    return el;
  }

  // 特殊なタグの処理
  if (tag === "#empty") {
    return document.createComment("");
  }

  if (tag === "#text") {
    return document.createTextNode(children.join(""));
  }

  // 未知のタグの場合はdivとして作成
  const el = document.createElement("div");
  el.setAttribute("data-unknown-tag", tag);
  return el;
}
