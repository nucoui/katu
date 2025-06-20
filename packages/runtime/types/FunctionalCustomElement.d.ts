// @ts-check

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

import type { ChatoraNode } from "./JSX.namespace";

type UnionKeys<T> = T extends T ? keyof T : never;

export type AsFunctionType<T> = [T] extends [object]
  ? { [K in UnionKeys<T>]: (v: string | undefined) => T[K]; }
  : never;

// CCの短縮型を定義
export type CC<
  P extends Record<string, any> = Record<string, never>,
  E extends Record<`on-${string}`, any> = Record<never, never>,
> = ChatoraComponent<P, E>;

export type ChatoraComponent<P extends Record<string, any> = Record<string, never>, E extends Record<`on-${string}`, any> = Record<`on-${string}`, never>> = (params: {
  reactivity: {
    signal: typeof import("@chatora/reactivity").signal;
    computed: typeof import("@chatora/reactivity").computed;
    effect: typeof import("@chatora/reactivity").effect;
    startBatch: typeof import("@chatora/reactivity").startBatch;
    endBatch: typeof import("@chatora/reactivity").endBatch;
  };
  /**
   * Propsの定義を行う関数
   * Define the props
   *
   * @example
   *   // 変換関数を使用
   *   const props = defineProps({
   *     disabled: toBoolean,
   *     value: (v) => v
   *   })
   *   // props(): { disabled: boolean | undefined, value: string | undefined }
   */
  defineProps: <const T extends AsFunctionType<P>>(props: T) => () => {
    [K in keyof T]: undefined extends ReturnType<T[K]>
      ? P[K]
      : Required<P[K]>
  };
  /**
   * Emitsの定義を行う関数
   * Define the emits
   *
   * @example
   *   // 型安全なイベント定義
   *   const emits = defineEmits({
   *     "on-click": (detail: { count: number }) => {},
   *     "on-change": (detail: string) => {}
   *   })
   *   emits("on-click", { count: 1 }) // 型安全なCustomEventで発火
   */
  defineEmits: <T extends { [K in keyof E]: (detail: E[K]) => void }>(events: T) => <K extends keyof E>(type: K, detail?: E[K], options?: EventInit) => void;
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
  getHost: () => HTMLElement;
  getShadowRoot: () => ShadowRoot | null;
  /**
   * ElementInternalsを取得します（formAssociated時のみ有効）
   * Returns ElementInternals if formAssociated is enabled
   */
  getInternals: () => ElementInternals | undefined;
}) => () => ChatoraNode | ChatoraNode[];

export type FunctionalCustomElement = <
  P extends Record<string, any> = Record<string, never>,
  E extends Record<`on-${string}`, any> = Record<`on-${string}`, never>,
>(
  component: ChatoraComponent<P, E>,
) => {
  new (): HTMLElement;
};

/**
 * Extracts the Props type from a CC<Props, Emits> component.
 * @template T - The component type.
 */
export type ComponentProps<T> = T extends CC<infer P, any> ? P : never;

/**
 * Extracts the Emits type from a CC<Props, Emits> component.
 * @template T - The component type.
 */
export type ComponentEmits<T> = T extends CC<any, infer E> ? E : never;
