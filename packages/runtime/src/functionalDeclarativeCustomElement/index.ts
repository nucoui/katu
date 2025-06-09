import type { CC, FunctionalCustomElementOptions } from "@root/types/FunctionalCustomElement";
import type { ChatoraJSXElement, ChatoraNode } from "@root/types/JSX.namespace";
import type { Element, ElementContent, Root } from "hast";

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
const functionalDeclarativeCustomElement = (
  callback: CC,
  options?: FunctionalCustomElementOptions & { props?: Record<string, string | undefined> },
): Root => {
  const {
    shadowRoot = true,
    shadowRootMode = "open",
    styles,
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

  callback({
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
    defineProps: <T extends Record<string, (value: string | undefined) => any>>(propsTransformers: T) => {
      // プロパティ値を事前計算（SSRでは変更されない）
      const computedProps: Record<string, any> = {};

      // 変換関数でデフォルト値を生成
      for (const key of Object.keys(propsTransformers)) {
        computedProps[key] = propsTransformers[key as keyof T](undefined);
      }

      // 初期プロパティで上書き
      for (const key of Object.keys(_propsData)) {
        if (key in propsTransformers) {
          computedProps[key] = propsTransformers[key as keyof T](_propsData[key]);
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
     * レンダリング関数を実行し、JSX結果を保存します
     * SSRでは単純に結果を保存するだけです
     */
    render: (cb) => {
      jsxResult = cb();
    },
  });

  // jsxResultがなければ空のDOM要素を生成
  if (jsxResult === null || jsxResult === undefined) {
    return { type: "root", children: [] };
  }

  // JSX結果をhastに変換
  const contentElement = jsxToHast(jsxResult);

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
        properties: { shadowroot: shadowRootMode },
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
 * SSR用に最適化された軽量版
 */
function jsxToHast(node: ChatoraNode): ElementContent | ElementContent[] {
  // nullやundefinedの場合は空のテキストノード
  if (node === null || node === undefined) {
    return { type: "text", value: "" };
  }

  // プリミティブ値の場合はテキストノードに変換
  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return { type: "text", value: String(node) };
  }

  // 配列の場合は各要素を変換
  if (Array.isArray(node)) {
    return node.flatMap(item => jsxToHast(item));
  }

  // ChatoraJSXElementの場合
  if (typeof node === "object" && "tag" in node && "props" in node) {
    const jsxElement = node as ChatoraJSXElement;

    // タグが関数の場合は実行結果を変換
    if (typeof jsxElement.tag === "function") {
      const result = jsxElement.tag(jsxElement.props || {});
      // Promise型の場合は警告を出してスキップ
      if (result instanceof Promise) {
        console.warn("Promise-based components are not supported in SSR mode");
        return { type: "text", value: "" };
      }
      return jsxToHast(result);
    }

    // タグが文字列の場合はhast要素に変換
    const tagName = jsxElement.tag as string;
    const { children, ...props } = jsxElement.props || {};

    // イベントハンドラプロパティを除去（SSRでは不要）
    const filteredProps: Record<string, any> = {};
    for (const [key, value] of Object.entries(props)) {
      if (!(key.startsWith("on") && key.length > 2 && key[2] === key[2].toUpperCase())) {
        filteredProps[key === "className" ? "class" : key] = value;
      }
    }

    return {
      type: "element",
      tagName,
      properties: filteredProps,
      children: children
        ? (Array.isArray(children)
            ? children.flatMap(child => jsxToHast(child as ChatoraNode))
            : [jsxToHast(children as ChatoraNode)]
          ).filter(Boolean) as ElementContent[]
        : [],
    };
  }

  // その他の場合は空のテキストノード
  return { type: "text", value: "" };
}

export { functionalDeclarativeCustomElement };
