import type { AsFunctionType, CC } from "@root/types/FunctionalCustomElement";
import type { ChatoraNode } from "@root/types/JSX.namespace";
import type { Element, ElementContent, Root } from "hast";
import { genVNode } from "../functionalCustomElement/vNode";

/**
 * JSX/TSXを使用してDeclarative Shadow DOMのHTML要素を作成する関数です。
 * SSR（サーバーサイドレンダリング）用途に最適化されています。
 * functionalCustomElementと同じ引数を取りますが、DOM操作ではなくhastオブジェクトを返します。
 *
 * Creates Declarative Shadow DOM HTML elements using JSX/TSX for server-side rendering.
 * Takes the same arguments as functionalCustomElement but returns a hast object instead of manipulating the DOM.
 *
 * @param callback - ライフサイクルフックやレンダリング関数を登録するコールバック
 * @param options - ShadowRootやForm関連のオプション
 * @returns hastオブジェクト (HTML Abstract Syntax Tree)
 */
const functionalDeclarativeCustomElement = <
  P extends Record<string, any> = Record<string, never>,
  E extends Record<`on-${string}`, any> = Record<`on-${string}`, never>,
>(
  callback: CC<P, E>,
  options?: { props?: P },
): Root => {
  const {
    props: initialProps,
  } = options || {};

  // プロパティの初期化（SSRでは静的なため、signalは不要）
  const _propsData = initialProps || {};
  let jsxResult: ChatoraNode | null = null;

  // SSR用の軽量化されたreactivity実装
  const ssrSignal = <T>(value: T): [() => T, (newValue: T | ((prev: T) => T)) => void] => {
    const getter = () => value;
    const setter = () => {}; // SSRでは更新不要
    return [getter, setter];
  };

  const ssrComputed = <T>(fn: () => T) => () => fn();
  const ssrEffect = () => () => {}; // SSRでは副作用不要
  const noop = () => {};

  const {
    options: {
      shadowRoot,
      shadowRootMode,
      styles,
    },
    render,
  } = callback({
    reactivity: {
      signal: ssrSignal,
      effect: ssrEffect,
      computed: ssrComputed,
      startBatch: noop,
      endBatch: noop,
    },
    /**
     * 属性変換関数オブジェクトを受け取り、属性値を取得するgetter関数を返します。
     * SSRでは初期値のみを返します。
     *
     * @param propsTransformers - 属性変換関数オブジェクト
     * @returns 属性値を取得するgetter関数
     */
    defineProps: <T extends AsFunctionType<P>>(propsTransformers: T) => {
      // プロパティ値を事前計算（SSRでは変更されない）
      const computedProps: Record<string, any> = {};

      // 変換関数でデフォルト値を生成
      for (const key of Object.keys(propsTransformers)) {
        computedProps[key] = propsTransformers[key as keyof T](undefined);
      }

      // 初期プロパティで上書き
      for (const key of Object.keys(_propsData)) {
        if (key in propsTransformers) {
          computedProps[key] = propsTransformers[key as keyof T](
            (_propsData as Record<string, any>)[key],
          );
        }
      }

      return () => computedProps as any;
    },
    /**
     * イベントハンドラオブジェクトを受け取り、イベントを発火する関数を返します。
     * SSRではイベントは実行されないためダミー関数を返します。
     *
     * @param _events - イベントハンドラオブジェクト（SSRでは使用しない）
     * @returns イベントを発火する関数（SSRではダミー）
     */
    defineEmits: (_events: Record<`on-${string}`, (detail: any) => void>) => {
      // SSRでは最小限のダミー関数を返す
      const dummyEmit = () => {};
      return dummyEmit as any;
    },
    // ライフサイクルフックはSSRでは不要
    onConnected: noop,
    onDisconnected: noop,
    onAttributeChanged: noop,
    onAdopted: noop,
    /**
     * ホスト要素（このカスタム要素自身）を取得します
     * SSRでは空オブジェクトを返します
     */
    getHost: () => ({} as HTMLElement),
    /**
     * ShadowRootを取得します
     * SSRではnullを返します
     */
    getShadowRoot: () => null,
    /**
     * ElementInternalsを取得します（SSRでは常にundefined）
     * Returns undefined for SSR (no ElementInternals)
     */
    getInternals: () => undefined,
  });

  jsxResult = render();

  // VNode化
  const vnode = genVNode(jsxResult);
  // VNode→hast変換
  const contentElement = vNodeToHast(vnode);

  // スタイル要素を事前に生成（存在する場合）
  const styleElements: Element[] = styles
    ? (Array.isArray(styles) ? styles : [styles]).map(cssText => ({
        type: "element",
        tagName: "style",
        properties: {},
        children: [{ type: "text", value: cssText }],
      }))
    : [];

  // Declarative Shadow DOMのtemplate要素を作成 (shadowRoot=trueの場合のみ)
  if (shadowRoot) {
    const templateChildren = [
      ...styleElements,
      ...(Array.isArray(contentElement) ? contentElement : [contentElement]),
    ].filter(Boolean) as ElementContent[];

    return {
      type: "root",
      children: [{
        type: "element",
        tagName: "template",
        properties: { shadowrootmode: shadowRootMode },
        children: templateChildren,
      }],
    };
  }

  // shadowRoot=falseの場合は通常のHTML要素を返す
  return {
    type: "root",
    children: Array.isArray(contentElement) ? contentElement : [contentElement],
  };
};

/**
 * ChatoraNode (JSX結果) をhast要素に変換する関数
 * functionalCustomElementのVNode構造と一致するように変換
 */
function vNodeToHast(node: any): ElementContent | ElementContent[] {
  if (!node)
    return { type: "text", value: "" };
  // #text, #empty, #fragment, #unknown, string, number, VNode, 配列
  if (Array.isArray(node)) {
    return node.flatMap(vNodeToHast);
  }
  if (typeof node === "string" || typeof node === "number") {
    return { type: "text", value: String(node) };
  }
  if (typeof node === "object" && node.tag) {
    if (node.tag === "#text") {
      return { type: "text", value: node.children[0] ?? "" };
    }
    if (node.tag === "#empty") {
      return { type: "text", value: "" };
    }
    if (node.tag === "#fragment") {
      // fragmentは子要素を平坦化
      return node.children.flatMap(vNodeToHast);
    }
    // 通常の要素
    const props: Record<string, any> = {};
    for (const [k, v] of Object.entries(node.props ?? {})) {
      if (k === "className")
        props.class = v;
      else if (!/^on[A-Z]/.test(k))
        props[k] = v;
    }
    return {
      type: "element",
      tagName: node.tag,
      properties: props,
      children: node.children ? node.children.flatMap(vNodeToHast) : [],
    };
  }
  return { type: "text", value: "" };
}

export { functionalDeclarativeCustomElement };
