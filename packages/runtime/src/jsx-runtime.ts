import type { FunctionComponentResult, KatuJSXElement } from "@/types/KatuJSXElement";
import type { KatuNode } from "@/types/KatuNode";

export function jsx(
  tag: string | ((props: Record<string, unknown>) => FunctionComponentResult),
  props: Record<string, unknown>,
): KatuJSXElement {
  return { tag, props };
}

export { jsx as jsxs };

export function Fragment({ children }: { children?: KatuNode }): KatuNode {
  return children;
}
