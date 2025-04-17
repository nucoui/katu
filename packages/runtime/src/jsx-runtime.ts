import type { KatuJSXElement } from "@/types/KatuJSXElement";
import type { KatuNode } from "@/types/KatuNode";

export function jsx(
  tag: KatuJSXElement["tag"],
  props: KatuJSXElement["props"],
): KatuJSXElement {
  return { tag, props };
}

export { jsx as jsxs };

export function Fragment({ children }: { children?: KatuNode }): KatuNode {
  return children;
}
