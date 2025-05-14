import type { VNode } from "@/functionalCustomElement/vNode";
import type { FunctionalCustomElement } from "@root/types/FunctionalCustomElement";
import { onAdopted, onAttributeChangedBase, onConnectedBase, onDisconnectedBase } from "@/functionalCustomElement/on";
import { createNode, nodeToVNode, patch } from "@/functionalCustomElement/vNode";
import { effect, signal } from "@katu/reactivity";

/**
 * FunctionalCustomElementの型引数を関数使用時に指定できるようにします。
 * Allow generics to be specified at function usage.
 */
const functionalCustomElement = <Props extends string[] = string[]>(
  callback: Parameters<FunctionalCustomElement<Props>>[0],
  options: Parameters<FunctionalCustomElement<Props>>[1],
) => {
  const {
    shadowRoot = true,
    shadowRootMode,
    isFormAssociated,
    propsNames,
  } = options || {};
  return class CustomElement extends HTMLElement {
    static formAssociated = isFormAssociated ?? false;
    static observedAttributes = propsNames ?? [];

    props = signal(Object.fromEntries(
      Array.from(this.getAttributeNames()).map(attr => [attr, this.getAttribute(attr)]),
    ));

    _vnode: VNode | string | null = null;

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
      if (shadowRoot) {
        this.attachShadow({ mode: shadowRootMode ?? "open" });
      }
      callback({
        reactivity: {
          signal,
          effect,
        },
        /**
         * このカスタムエレメントの全ての属性をオブジェクトとして返します。
         * Returns all attributes of this custom element as an object.
         */
        props: this.props[0] as unknown as () => Record<Props[number], string | null>,
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
            const newVNode = nodeToVNode(node);
            // shadowRootが有効ならshadowRoot、無効なら描画処理をスキップ
            const root: HTMLElement | ShadowRoot = this.shadowRoot ?? this;
            if (root === this) {
              // jsdomではカスタムエレメント本体に子ノードを持てないためスキップ
              return;
            }
            if (this._vnode == null) {
              root.innerHTML = "";
              root.appendChild(createNode(newVNode));
            }
            else {
              patch(root, this._vnode, newVNode, 0);
            }
            this._vnode = newVNode;
          };
          /**
           * 最後に登録されたrenderコールバックを保持します。
           * Stores the latest render callback for attribute-triggered re-rendering.
           */
          this._renderCallback = renderCallback;
        },
      });
    }

    connectedCallback() {
      // 初回のみeffect/renderCallbackを登録
      if (!this._effectInitialized && this._renderCallback) {
        effect(() => {
          this.props[0]();
          this._renderCallback!();
        });
        this._effectInitialized = true;
      }
      this.handleConnected();
    }

    handleConnected() {}

    handleDisconnected() {}
    disconnectedCallback() {
      this.handleDisconnected();
    }

    handleAttributeChanged(_name: string, _oldValue: string | null, _newValue: string | null) {}
    attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
      this.props[1](prev => ({
        ...prev,
        [name]: newValue,
      }));
      this.handleAttributeChanged(name, oldValue, newValue);
    }
  };
};

export { functionalCustomElement };
