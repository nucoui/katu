import type { VNode } from "@/functionalCustomElement/vNode";
import type { FunctionalCustomElement } from "@root/types/FunctionalCustomElement";
import { onAdopted, onAttributeChangedBase, onConnectedBase, onDisconnectedBase } from "@/functionalCustomElement/on";
import { createVNode, mount, patch } from "@/functionalCustomElement/vNode";
import { computed, Computed, effect, Effect, endBatch, signal, Signal, startBatch } from "@katu/reactivity";

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
    // style,
  } = options || {};

  return class CustomElement extends HTMLElement {
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
         * このカスタムエレメントの全ての属性をオブジェクトとして返します。
         * Returns all attributes of this custom element as an object.
         */
        /**
         * 属性名リストを受け取り、属性値を取得するgetter関数を返します。
         * Accepts a list of attribute names and returns a getter function for attribute values.
         * @param props - 属性名の配列 (Array of attribute names)
         * @returns 属性値を取得するgetter関数 (Getter function for attribute values)
         */
        defineProps: (props) => {
          this.observedAttributes = props;
          this.props[1]((prev) => {
            const newProps = { ...prev };
            (props as readonly string[]).forEach((name) => {
              newProps[name] = this.getAttribute(name);
            });
            return newProps;
          });

          return this.props[0] as any;
        },
        /**
         * イベント名リストを受け取り、イベントを発火する関数を返します。
         * Accepts a list of event names and returns a function to emit events.
         * @param events - イベント名の配列 (Array of event names)
         * @returns イベントを発火する関数 (Function to emit events)
         */
        defineEmits: (events) => {
          return (type, detail, options) => {
            if (events.includes(type)) {
              this.dispatchEvent(
                new CustomEvent(type, {
                  detail,
                  bubbles: options?.bubbles ?? true,
                  composed: options?.composed ?? true,
                  cancelable: options?.cancelable ?? true,
                }),
              );
            }
          };
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
        render: (cb) => {
          const renderCallback = () => {
            const node = cb();
            if (!node && node !== 0)
              return;
            let newVNode: VNode;
            if (typeof node === "object" && node !== null && "tag" in node && "props" in node && typeof node.tag === "string") {
              newVNode = createVNode(node.tag, node.props);
            }
            else {
              newVNode = createVNode("span", { children: [String(node)] });
            }
            const root: HTMLElement | ShadowRoot = this.shadowRoot ?? this;
            if (root === this)
              return;
            if (this._vnode == null) {
              root.innerHTML = "";
              root.appendChild(mount(newVNode));
            }
            else {
              patch(root, this._vnode, newVNode, 0);
            }
            this._vnode = newVNode;
          };
          this._renderCallback = renderCallback;
        },
      });
      // MutationObserverのセットアップ
      this._attributeObserver = new MutationObserver((mutationRecords) => {
        mutationRecords.forEach((record) => {
          if (
            record.type === "attributes"
            && record.attributeName
            && this.observedAttributes.includes(record.attributeName)
          ) {
            const name = record.attributeName;
            const oldValue = record.oldValue;
            const newValue = this.getAttribute(name);
            this.props[1]((prev) => {
              const newProps = { ...prev };
              newProps[name] = newValue;
              return newProps;
            });
            this.handleAttributeChanged(name, oldValue, newValue);
          }
        });
      });
    }

    handleConnected() {}
    connectedCallback() {
      // MutationObserverの監視開始
      this._attributeObserver.observe(this, {
        attributes: true,
        attributeOldValue: true,
        attributeFilter: [...(this.observedAttributes as readonly string[])],
      });

      // 初回のみeffect/renderCallbackを登録
      if (!this._effectInitialized && this._renderCallback) {
        if (shadowRoot) {
          this.attachShadow({ mode: shadowRootMode ?? "open" });
        }
        effect(() => {
          this.props[0]();
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
