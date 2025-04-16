import type {
  FunctionComponentResult,
  KatuJSXElement,
} from "@/types/KatuJSXElement";
import type { KatuNode } from "@/types/KatuNode";

interface PropsForAnyJSXElement {}

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
