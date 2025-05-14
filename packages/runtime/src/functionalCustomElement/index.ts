import type { VNode } from "@/functionalCustomElement/vNode";
import type { FunctionalCustomElement } from "@root/types/FunctionalCustomElement";
import { onAdopted, onAttributeChangedBase, onConnectedBase, onDisconnectedBase } from "@/functionalCustomElement/on";
import { createVNode, mount, patch } from "@/functionalCustomElement/vNode";
import { computed, Computed, effect, Effect, endBatch, signal, Signal, startBatch } from "@katu/reactivity";

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
    style,
  } = options || {};

  return class CustomElement extends HTMLElement {
    static formAssociated = isFormAssociated ?? false;
    static observedAttributes = propsNames ?? [];

    props = signal(Object.fromEntries(
      (propsNames ?? []).map(attr => [attr, this.getAttribute(attr)]),
    ));

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
    }

    handleConnected() {}
    connectedCallback() {
      // 初回のみeffect/renderCallbackを登録
      if (!this._effectInitialized && this._renderCallback) {
        if (shadowRoot) {
          this.attachShadow({ mode: shadowRootMode ?? "open" });
          if (style && this.shadowRoot) {
            if (!this.shadowRoot.querySelector("style[data-katu-root-style]") && style.trim() !== "") {
              const styleEl = document.createElement("style");
              styleEl.setAttribute("data-katu-root-style", "");
              styleEl.textContent = style;
              this.shadowRoot.appendChild(styleEl);
            }
          }
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
