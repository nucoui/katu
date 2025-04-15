import type { KatuNode } from "@/types/KatuNode";

export type FunctionComponentResult = KatuNode | Promise<KatuNode>;

export interface KatuJSXElement {
  tag: string | ((props: Record<string, unknown>) => FunctionComponentResult);
  props: Record<string, unknown>;
}
