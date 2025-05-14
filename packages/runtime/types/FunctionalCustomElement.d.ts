/**
 * functionalCustomElement の型定義ファイル
 *
 * JSX/TSXでWeb ComponentsのCustom Element Classを生成するためのファクトリ関数です。
 *
 * @param callback - ライフサイクルフックやレンダリング関数を登録するコールバック
 * @param options - ShadowRootやForm関連のオプション
 * @returns CustomElementクラス
 *
 * Factory function for creating Web Components Custom Element Class using JSX/TSX.
 *
 * @param callback - Callback to register lifecycle hooks and render function
 * @param options - Options for ShadowRoot and form association
 * @returns CustomElement class
 */

import type { effect } from "@katu/reactivity";
import type { VNode } from "../src/functionalCustomElement/vNode";
import type { KatuJSXElement } from "./JSX.namespace";

export type FunctionalCustomElementOptions = {
  /**
   * ShadowRootを有効にするかどうか
   * Enable ShadowRoot or not
   */
  shadowRoot?: boolean;
  /**
   * Form要素として関連付けるかどうか
   * Whether to associate as a form element or not
   */
  isFormAssociated?: boolean;
} & ({
  shadowRoot: true;
  /**
   * ShadowRootのモード
   *  ShadowRoot mode
   * @default "open"
   */
  shadowRootMode?: "open" | "closed";
} | {
  shadowRoot?: false;
  shadowRootMode?: never;
});

export type FunctionalCustomElement = (
  callback: (params: {
    reactivity: {
      signal: typeof import("@katu/reactivity").signal;
      effect: typeof import("@katu/reactivity").effect;
    };
    /**
     * connectedCallback時のフック登録
     * Register hook for connectedCallback
     */
    onConnected: (cb: () => void) => void;
    /**
     * レンダリング関数の登録
     * Register render function
     */
    render: (cb: () => KatuJSXElement) => void;
  }) => void,
  options: FunctionalCustomElementOptions
) => {
  new (): HTMLElement & {
    /**
     * 仮想DOMノードのキャッシュ
     * Cache for virtual DOM node
     */
    _vnode: VNode | string | null;
    /**
     * connectedCallbackのハンドラ
     * Handler for connectedCallback
     */
    handleConnected: () => void;
  };
};
