import type { FunctionComponentResult, KatuJSXElement } from "@/types/KatuJSXElement";
import type { KatuNode } from "@/types/KatuNode";

export function jsxDEV(
  tag: string | ((props: Record<string, unknown>) => FunctionComponentResult),
  props: Record<string, unknown>,
  key?: string | null,
  isStaticChildren?: boolean,
): KatuJSXElement & { key?: string | null; isStaticChildren?: boolean } {
  return { tag, props, key, isStaticChildren };
}

export function Fragment({ children }: { children?: KatuNode }): KatuNode {
  return children;
}
