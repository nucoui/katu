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

import type { KatuNode } from "./JSX.namespace";

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
  /**
   * ShadowRoot用のスタイル（CSSコード）
   * Style for ShadowRoot (CSS code)
   */
  style?: string;
} & ({
  shadowRoot: true;
  /**
   * ShadowRootのモード
   *  ShadowRoot mode
   * @default "open"
   */
  shadowRootMode?: "open" | "closed";
} | {
  /**
   * @deprecated 未サポート
   */
  shadowRoot?: false;
  shadowRootMode?: never;
});

export type FunctionalCustomElement = (
  callback: (params: {
    reactivity: {
      signal: typeof import("@katu/reactivity").signal;
      computed: typeof import("@katu/reactivity").computed;
      effect: typeof import("@katu/reactivity").effect;
      startBatch: typeof import("@katu/reactivity").startBatch;
      endBatch: typeof import("@katu/reactivity").endBatch;
      Signal: typeof import("@katu/reactivity").Signal;
      Computed: typeof import("@katu/reactivity").Computed;
      Effect: typeof import("@katu/reactivity").Effect;
    };
    /**
     * Propsの定義を行う関数
     * Define the props
     *
     * @example
     *   const props = defineProps(["foo", "bar"])
     *   // props(): { foo: string | null, bar: string | null }
     */
    defineProps: <const T extends readonly string[] = readonly string[]>(props: T) => () => { [K in T[number]]: string | null };
    /**
     * Emitsの定義を行う関数
     * Define the emits
     *
     * @example
     *   const emits = defineEmits(["click", "change"])
     *   emits("click", { foo: "bar" }) // CustomEventで発火
     */
    defineEmits: <const U extends readonly `on-${string}`[] = readonly `on-${string}`[]>(events: U) => (type: U[number], detail?: any, options?: EventInit) => void;
    /**
     * connectedCallback時のフック登録
     * Register hook for connectedCallback
     */
    onConnected: (cb: () => void) => void;
    /**
     * disconnectedCallback時のフック登録
     * Register hook for disconnectedCallback
     */
    onDisconnected: (cb: () => void) => void;
    /**
     * 属性の変更を監視する
     * Observe attribute changes
     */
    onAttributeChanged: (cb: (name: string, oldValue: string | null, newValue: string | null) => void) => void;
    /**
     * adoptedCallback時のフック登録
     * Register hook for adoptedCallback
     */
    onAdopted: (cb: () => void) => void;
    /**
     * レンダリング関数の登録
     * Register render function
     */
    render: (cb: () => KatuNode) => void;
  }) => void,
  options: FunctionalCustomElementOptions
) => {
  new (): HTMLElement;
};
