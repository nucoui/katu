import type { VNode } from "@/functionalCustomElement/vNode";
import type { FunctionalCustomElement } from "@root/types/FunctionalCustomElement";
import { onConnectedBase } from "@/functionalCustomElement/on";
import { createNode, nodeToVNode, patch } from "@/functionalCustomElement/vNode";
import { effect, signal } from "@katu/reactivity";

const functionalCustomElement: FunctionalCustomElement = (callback, {
  shadowRoot = true,
  shadowRootMode,
  isFormAssociated,
}) => {
  return class CustomElement extends HTMLElement {
    static formAssociated = isFormAssociated ?? false;

    _vnode: VNode | string | null = null;

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
        onConnected: (cb) => {
          onConnectedBase(cb, this.constructor);
        },
        render: (cb) => {
          const renderCallback = () => {
            const node = cb();
            const newVNode = nodeToVNode(node);
            if (this._vnode == null) {
              this.shadowRoot!.innerHTML = "";
              this.shadowRoot!.appendChild(createNode(newVNode));
            }
            else {
              patch(this.shadowRoot!, this._vnode, newVNode, 0);
            }
            this._vnode = newVNode;
          };
          effect(renderCallback);
        },
      });
    }

    handleConnected() {}

    // connectedCallbackはconstructorで上書きされるため、ここは空実装
    connectedCallback() {
      this.handleConnected();
    }
  };
};

export { functionalCustomElement };
