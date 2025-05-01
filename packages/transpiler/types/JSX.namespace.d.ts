export type KatuNode =
  | string
  | KatuJSXElement
  | KatuNode[]
  | null
  | undefined;

export type FunctionComponentResult = KatuNode | Promise<KatuNode>;

export interface KatuJSXElement {
  tag: string | ((props: Record<string, unknown>) => FunctionComponentResult);
  props: Record<string, unknown>;
}

interface PropsForAnyJSXElement {
  repeat?: number;
}

interface PropsForAnyIntrinsicElement extends PropsForAnyJSXElement {
  children?: KatuNode;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: PropsForAnyIntrinsicElement;
      h1: PropsForAnyIntrinsicElement & { id?: string };
      p: PropsForAnyIntrinsicElement;
    }

    type Element = KatuJSXElement;
    type ElementType = string | ((props: any) => FunctionComponentResult);

    interface ElementChildrenAttribute {
      children: unknown;
    }

    type LibraryManagedAttributes<_F, P> = P & PropsForAnyIntrinsicElement;
  }
}
