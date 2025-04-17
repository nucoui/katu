import type { KatuJSXElement } from "@/types/KatuJSXElement";

export type KatuNode =
  | string
  | KatuJSXElement
  | KatuNode[]
  | null
  | undefined;
