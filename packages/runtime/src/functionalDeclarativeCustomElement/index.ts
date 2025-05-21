import type { ChatoraComponent, FunctionalCustomElementOptions } from "@root/types/FunctionalCustomElement";
import type { ChatoraJSXElement, ChatoraNode } from "@root/types/JSX.namespace";
import type { Element, ElementContent, Root } from "hast";
import { computed, effect, endBatch, signal, startBatch } from "@chatora/reactivity";

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
  callback: ChatoraComponent,
  options?: FunctionalCustomElementOptions,
): Root => {
  const {
    shadowRoot = true,
    shadowRootMode = "open",
    style,
  } = options || {};

  // プロパティやステートの初期化
  const props = signal<Record<string, string | null>>({});
  let jsxResult: ChatoraNode | null = null;

  // コールバック関数を実行し、レンダリング関数などを取得
  callback({
    reactivity: {
      signal,
      effect,
      computed,
      startBatch,
      endBatch,
    },
    /**
     * 属性名リストを受け取り、属性値を取得するgetter関数を返します。
     * SSRでは初期値のみを返します。
     *
     * @param _propsNames - 属性名の配列
     * @returns 属性値を取得するgetter関数
     */
    defineProps: (_propsNames) => {
      // SSRでは空のプロップを返す（実際の値はクライアント側で注入される）
      return props[0] as any;
    },
    /**
     * イベント名リストを受け取り、イベントを発火する関数を返します。
     * SSRではイベントは実行されないためダミー関数を返します。
     *
     * @param events - イベント名の配列
     * @returns イベントを発火する関数（SSRではダミー）
     */
    defineEmits: (events) => {
      // SSRモードではイベントは機能しないためダミー関数を返す
      const dummyEmit = (_type: any, _detail: any, _options?: any) => {
        // SSRではイベントは動作しない
      };

      // イベント名からメソッド名へのマッピング (on-foo → foo)
      for (const event of events) {
        const methodName = event.replace(/^on-/, "");
        (dummyEmit as any)[methodName] = (_detail: any, _options?: any) => {
          // SSRではイベントは動作しない
        };
      }

      return dummyEmit;
    },
    // ライフサイクルフックはSSRでは実行されないためダミー関数を返す
    onConnected: () => {},
    onDisconnected: () => {},
    onAttributeChanged: () => {},
    onAdopted: () => {},
    /**
     * ホスト要素（このカスタム要素自身）を取得します
     * SSRではダミーオブジェクトを返します
     *
     * @returns ダミーのホスト要素
     */
    getHost: () => {
      return {} as HTMLElement;
    },
    /**
     * ShadowRootを取得します
     * SSRではnullを返します
     *
     * @returns null
     */
    getShadowRoot: () => {
      return null;
    },
    /**
     * レンダリング関数を実行し、JSX結果を保存します
     * functionalCustomElementとは異なり、effectは使用せず単純に結果を保存します
     *
     * @param cb - レンダリングコールバック関数
     */
    render: (cb) => {
      // レンダリングコールバックを実行してJSX要素を取得
      jsxResult = cb();
    },
  });

  // jsxResultがなければ空のDOM要素を生成
  if (!jsxResult && jsxResult !== 0) {
    return {
      type: "root",
      children: [],
    };
  }

  // JSX結果をhastに変換
  const contentElement = jsxToHast(jsxResult);

  // スタイル要素を作成（存在する場合）
  const styleElements: Element[] = [];
  if (style) {
    const styles = Array.isArray(style) ? style : [style];
    for (const cssText of styles) {
      styleElements.push({
        type: "element",
        tagName: "style",
        properties: {},
        children: [{ type: "text", value: cssText }],
      });
    }
  }

  // Declarative Shadow DOMのtemplate要素を作成 (shadowRoot=trueの場合のみ)
  if (shadowRoot) {
    const templateElement: Element = {
      type: "element",
      tagName: "template",
      properties: { shadowroot: shadowRootMode },
      children: [
        ...styleElements,
        ...(Array.isArray(contentElement) ? contentElement : [contentElement]),
      ].filter(Boolean) as ElementContent[],
    };

    return {
      type: "root",
      children: [templateElement],
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
 *
 * @param node - 変換対象のChatoraNode
 * @returns 変換後のhast要素
 */
function jsxToHast(node: ChatoraNode): ElementContent | ElementContent[] {
  // nullやundefinedの場合は空のテキストノードを返す
  if (node === null || node === undefined) {
    return { type: "text", value: "" };
  }

  // プリミティブ値の場合はテキストノードに変換
  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return { type: "text", value: String(node) };
  }

  // 配列の場合は各要素を変換
  if (Array.isArray(node)) {
    return node.map(item => jsxToHast(item)).flat();
  }

  // ChatoraJSXElementの場合
  if (typeof node === "object" && "tag" in node && "props" in node) {
    const jsxElement = node as ChatoraJSXElement;

    // タグが関数の場合は実行結果を変換
    if (typeof jsxElement.tag === "function") {
      const result = jsxElement.tag(jsxElement.props || {});
      // Promise型の場合は非同期処理が必要だがSSRでは対応しないためundefinedを返す
      if (result instanceof Promise) {
        console.warn("Promise-based components are not supported in SSR mode");
        return { type: "text", value: "" };
      }
      return jsxToHast(result);
    }

    // タグが文字列の場合はhast要素に変換
    const tagName = jsxElement.tag as string;
    const props = { ...jsxElement.props };
    const children = props.children;
    delete props.children;

    // onXXX系のイベントハンドラプロパティを削除
    Object.keys(props).forEach((key) => {
      if (key.startsWith("on") && key.length > 2 && key[2] === key[2].toUpperCase()) {
        delete props[key];
      }
    });

    // プロパティをhast形式に変換
    const properties: Record<string, any> = {};
    for (const [key, value] of Object.entries(props)) {
      // class → className 変換
      if (key === "className") {
        properties.class = value;
      }
      // 通常のプロパティ
      else {
        properties[key] = value;
      }
    }

    return {
      type: "element",
      tagName,
      properties,
      children: children
        ? (Array.isArray(children)
            ? children.map(child => jsxToHast(child)).flat()
          // childrenがオブジェクトでもChatoraNodeとして扱える場合のみ変換
            : typeof children === "string" || typeof children === "number"
              || (typeof children === "object" && children !== null && ("tag" in children || Array.isArray(children)))
              ? [jsxToHast(children as ChatoraNode)]
              : []
          ).filter(Boolean) as ElementContent[]
        : [],
    };
  }

  // その他の場合は空のテキストノード
  return { type: "text", value: "" };
}

export { functionalDeclarativeCustomElement };
