import type { createCustomElement } from "@/customElement/createCustomElement";

export const resisterElement = (tag: string, element: ReturnType<typeof createCustomElement>) => {
  if (window.customElements === undefined) {
    throw new Error("Custom elements are not supported in this environment.");
  }

  if (customElements.get(tag)) {
    return;
  }

  customElements.define(tag, element);
};
