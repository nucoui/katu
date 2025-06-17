import type { ChatoraJSXElement } from "@root/types/JSX.namespace";

export type IC<P extends Record<string, any> = Record<string, never>> = InlineComponent<P>;

export type InlineComponent<P extends Record<string, any> = Record<string, never>> = (props: P) => () => ChatoraJSXElement;
