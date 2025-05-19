import type { VNode } from "@/functionalCustomElement/vNode";
import type { FunctionalCustomElement } from "@root/types/FunctionalCustomElement";
import { onAdopted, onAttributeChangedBase, onConnectedBase, onDisconnectedBase } from "@/functionalCustomElement/on";
import { applyStyles } from "@/functionalCustomElement/style";
import {
  _INTERNAL_ATTRIBUTES,
  createVNode,
  mount,
  patch,
} from "@/functionalCustomElement/vNode";
import { computed, Computed, effect, Effect, endBatch, signal, Signal, startBatch } from "@tora/reactivity";

/**
 * FunctionalCustomElementの型引数を関数使用時に指定できるようにします。
 * Allow generics to be specified at function usage.
 */
const functionalCustomElement: FunctionalCustomElement = (
  callback,
  options,
) => {
  const {
    shadowRoot = true,
    shadowRootMode,
    isFormAssociated,
    style,
  } = options || {};

  return class extends HTMLElement {
    static formAssociated = isFormAssociated ?? false;
    /**
     * MutationObserverインスタンス
     * MutationObserver instance for attribute changes
     *
     * TypeScriptの制約により、エクスポートされるクラスのprivate/protectedプロパティは型エラーとなるためpublicにします。
     */
    _attributeObserver: MutationObserver;
    /**
     * 監視対象属性リスト
     * List of observed attributes
     */
    observedAttributes: readonly string[] = [];

    /**
     * 属性値を保持するリアクティブなprops
     * Reactive props holding attribute values
     */
    props = signal<Record<string, string | null>>({});

    _vnode: VNode | null = null;

    /**
     * 最後に登録されたrenderコールバックを保持します。
     * Stores the latest render callback for attribute-triggered re-rendering.
     */
    _renderCallback?: () => void;

    /**
     * effect/renderの初回登録済みフラグ
     * Prevent multiple effect registrations
     */
    _effectInitialized = false;

    constructor() {
      super();
      callback({
        reactivity: {
          signal,
          effect,
          computed,
          startBatch,
          endBatch,
          Signal,
          Computed,
          Effect,
        },
        /**
         * 属性名リストを受け取り、属性値を取得するgetter関数を返します。
         * Accepts a list of attribute names and returns a getter function for attribute values.
         * @param props - 属性名の配列 (Array of attribute names)
         * @returns 属性値を取得するgetter関数 (Getter function for attribute values)
         */
        defineProps: (props) => {
          this.observedAttributes = props;

          // インスタンスが持つ全属性値をバッチで一度に初期化
          const initialProps: Record<string, string | null> = {};
          for (const name of props) {
            initialProps[name] = this.getAttribute(name) || null;
          }

          // 一度の更新処理でpropsを設定（バッチ処理）
          this.props[1](prev => ({ ...prev, ...initialProps }));

          return this.props[0] as any;
        },
        /**
         * イベント名リストを受け取り、イベントを発火する関数を返します。
         * Accepts a list of event names and returns a function to emit events.
         * @param events - イベント名の配列 (Array of event names)
         * @returns イベントを発火する関数 (Function to emit events)
         */
        defineEmits: (events) => {
          // デフォルトのイベントオプション（一度だけ作成）
          const defaultOptions = { bubbles: true, composed: true, cancelable: true };

          // イベント名からメソッド名へのマッピングを事前に作成（on-foo → foo）
          const methodMap = new Map(events.map(event => [
            event,
            event.replace(/^on-/, ""),
          ]));

          // イベント発火の基本関数
          const emit = (type: any, detail: any, options?: { bubbles?: boolean; composed?: boolean; cancelable?: boolean }) => {
            if (events.includes(type)) {
              // オプションをマージするよりもスプレッド構文の方が効率的
              this.dispatchEvent(
                new CustomEvent(type, {
                  detail,
                  ...defaultOptions,
                  ...options,
                }),
              );
            }
          };

          // 特定のイベント用のヘルパー関数を追加（on-foo → emit.foo()のようにアクセス可能）
          for (const [event, methodName] of methodMap.entries()) {
            (emit as any)[methodName] = (detail: any, options?: any) => {
              emit(event, detail, options);
            };
          }

          return emit;
        },
        onConnected: (cb) => {
          onConnectedBase(cb, this.constructor);
        },
        onDisconnected: (cb) => {
          onDisconnectedBase(cb, this.constructor);
        },
        onAttributeChanged: (cb) => {
          onAttributeChangedBase(cb, this.constructor);
        },
        onAdopted: (cb) => {
          onAdopted(cb, this.constructor);
        },
        /**
         * ホスト要素（このカスタム要素自身）を取得します
         * Returns the host element (this custom element itself)
         * @returns ホスト要素（HTMLElement）
         */
        getHost: () => {
          return this;
        },
        /**
         * ShadowRootを取得します（存在する場合）
         * Returns the ShadowRoot if it exists
         * @returns ShadowRoot または null
         */
        getShadowRoot: () => {
          return this.shadowRoot;
        },
        render: (cb) => {
          // 内部属性の値を一度だけ作成しておく（再利用）
          const internalAttribute = `${_INTERNAL_ATTRIBUTES}data-tora-internal`;

          const renderCallback = () => {
            const node = cb();
            if (!node && node !== 0)
              return;

            let newVNode: VNode;

            // JSX/TSXから返されたオブジェクトを適切なVNodeに変換
            if (typeof node === "object" && node !== null && "tag" in node && "props" in node && typeof node.tag === "string") {
              // オブジェクト生成を最小限に
              const nodeProps = node.props || {};
              const updatedProps = { ...nodeProps, [internalAttribute]: "" };
              newVNode = createVNode(node.tag, updatedProps);
            }
            else {
              // 文字列やプリミティブ値の場合はspanで包む
              newVNode = createVNode("span", {
                [internalAttribute]: "",
                children: [String(node)],
              });
            }

            // shadowRootが存在するかチェック
            const shadowRootInstance = this.shadowRoot;
            if (!shadowRootInstance)
              return;

            if (this._vnode == null) {
              // 初回レンダリング: style要素を除いてコンテンツをクリア
              const children = shadowRootInstance.children;
              for (let i = children.length - 1; i >= 0; i--) {
                if (children[i].tagName !== "STYLE") {
                  shadowRootInstance.removeChild(children[i]);
                }
              }

              // 新しい要素を追加
              shadowRootInstance.appendChild(mount(newVNode));
            }
            else {
              // 差分更新: 既存のDOM要素を更新
              // DOM構造内での適切なインデックスを効率的に見つける
              let domIndex = 0;
              const childNodes = shadowRootInstance.childNodes;
              for (let i = 0; i < childNodes.length; i++) {
                const node = childNodes[i];
                if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName !== "STYLE") {
                  domIndex = i;
                  break;
                }
              }

              patch(shadowRootInstance, this._vnode, newVNode, domIndex);
            }
            this._vnode = newVNode;
          };
          this._renderCallback = renderCallback;
        },
      });
      // MutationObserverのセットアップ（バッチ処理を使って最適化）
      this._attributeObserver = new MutationObserver((mutationRecords) => {
        if (mutationRecords.length === 0)
          return;

        // バッチ処理を開始して、複数の属性変更を1度にまとめて処理
        startBatch();

        // 変更された属性を格納するオブジェクト
        const changedAttributes: Record<string, { oldValue: string | null; newValue: string | null }> = {};

        // まず全ての変更を収集
        for (const record of mutationRecords) {
          if (
            record.type === "attributes"
            && record.attributeName
            && this.observedAttributes.includes(record.attributeName)
          ) {
            const name = record.attributeName;
            changedAttributes[name] = {
              oldValue: record.oldValue,
              newValue: this.getAttribute(name),
            };
          }
        }

        // 一度にpropsを更新
        if (Object.keys(changedAttributes).length > 0) {
          this.props[1]((prev) => {
            const newProps = { ...prev };
            for (const [name, { newValue }] of Object.entries(changedAttributes)) {
              newProps[name] = newValue;
            }
            return newProps;
          });

          // 各属性変更に対してハンドラを呼び出し
          for (const [name, { oldValue, newValue }] of Object.entries(changedAttributes)) {
            this.handleAttributeChanged(name, oldValue, newValue);
          }
        }

        // バッチ処理を終了
        endBatch();
      });
    }

    handleConnected() {}
    connectedCallback() {
      // observedAttributesが空でない場合のみMutationObserverを設定
      if (this.observedAttributes.length > 0) {
        this._attributeObserver.observe(this, {
          attributes: true,
          attributeOldValue: true,
          attributeFilter: [...this.observedAttributes],
        });
      }

      // 初回のみeffect/renderCallbackを登録
      if (!this._effectInitialized && this._renderCallback) {
        // shadowRootの生成とスタイル適用を1回の処理にまとめる
        if (shadowRoot) {
          const shadowRootInstance = this.attachShadow({ mode: shadowRootMode ?? "open" });
          // スタイルがある場合のみ適用処理を実行
          if (style) {
            applyStyles(shadowRootInstance, style);
          }
        }

        // props変更とレンダリングを連動させるエフェクト
        effect(() => {
          this.props[0](); // props値の監視
          this._renderCallback!();
        });
        this._effectInitialized = true;
      }

      this.handleConnected();
    }

    handleDisconnected() {}
    disconnectedCallback() {
      // MutationObserverの監視停止
      this._attributeObserver.disconnect();
      this.handleDisconnected();
    }

    handleAttributeChanged(_name: string, _oldValue: string | null, _newValue: string | null) {}
  };
};

export { functionalCustomElement };
