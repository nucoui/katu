export type KatuNode =
  | string
  | number
  | KatuJSXElement
  | KatuNode[]
  | null
  | undefined;

export type FunctionComponentResult = KatuNode | Promise<KatuNode>;

export interface HTMLElementEvent<T extends EventTarget> extends Event {
  target: T;
}

export interface KatuJSXElement {
  tag: string | ((props: Record<string, unknown>) => FunctionComponentResult);
  props: Record<string, unknown>;
}

interface PropsForAnyJSXElement {
  repeat?: number;
}

interface PropsForAnyIntrinsicElement extends PropsForAnyJSXElement {
  children?: KatuNode;
  onClick?: (event: MouseEvent) => void;
  onChange?: (event: HTMLElementEvent<EventTarget>) => void;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: PropsForAnyIntrinsicElement;
      h1: PropsForAnyIntrinsicElement & { id?: string };
      p: PropsForAnyIntrinsicElement;
      ul: PropsForAnyIntrinsicElement;
      ol: PropsForAnyIntrinsicElement;
      li: PropsForAnyIntrinsicElement;
      span: PropsForAnyIntrinsicElement;
      button: PropsForAnyIntrinsicElement;
      a: PropsForAnyIntrinsicElement & { href?: string; target?: string; rel?: string };
      img: PropsForAnyIntrinsicElement & { src?: string; alt?: string; width?: number | string; height?: number | string };
      input: PropsForAnyIntrinsicElement & { type?: string; value?: string | number; checked?: boolean; placeholder?: string; name?: string; disabled?: boolean; readonly?: boolean; autofocus?: boolean };
      textarea: PropsForAnyIntrinsicElement & { value?: string; placeholder?: string; name?: string; disabled?: boolean; readonly?: boolean; autofocus?: boolean; rows?: number; cols?: number };
      form: PropsForAnyIntrinsicElement & { action?: string; method?: string; enctype?: string; autocomplete?: string };
      label: PropsForAnyIntrinsicElement & { for?: string };
      table: PropsForAnyIntrinsicElement;
      tr: PropsForAnyIntrinsicElement;
      td: PropsForAnyIntrinsicElement & { colspan?: number; rowspan?: number };
      th: PropsForAnyIntrinsicElement & { colspan?: number; rowspan?: number; scope?: string };
      thead: PropsForAnyIntrinsicElement;
      tbody: PropsForAnyIntrinsicElement;
      tfoot: PropsForAnyIntrinsicElement;
      section: PropsForAnyIntrinsicElement;
      article: PropsForAnyIntrinsicElement;
      nav: PropsForAnyIntrinsicElement;
      header: PropsForAnyIntrinsicElement;
      footer: PropsForAnyIntrinsicElement;
      aside: PropsForAnyIntrinsicElement;
      main: PropsForAnyIntrinsicElement;
      strong: PropsForAnyIntrinsicElement;
      em: PropsForAnyIntrinsicElement;
      b: PropsForAnyIntrinsicElement;
      i: PropsForAnyIntrinsicElement;
      u: PropsForAnyIntrinsicElement;
      s: PropsForAnyIntrinsicElement;
      pre: PropsForAnyIntrinsicElement;
      code: PropsForAnyIntrinsicElement;
      blockquote: PropsForAnyIntrinsicElement;
      hr: PropsForAnyIntrinsicElement;
      br: PropsForAnyIntrinsicElement;
      svg: PropsForAnyIntrinsicElement & { width?: number | string; height?: number | string; viewBox?: string; fill?: string; stroke?: string };
      path: PropsForAnyIntrinsicElement & { d?: string; fill?: string; stroke?: string };
      // g: PropsForAnyIntrinsicElement;
      circle: PropsForAnyIntrinsicElement & { cx?: number | string; cy?: number | string; r?: number | string; fill?: string; stroke?: string };
      rect: PropsForAnyIntrinsicElement & { x?: number | string; y?: number | string; width?: number | string; height?: number | string; fill?: string; stroke?: string };
      line: PropsForAnyIntrinsicElement & { x1?: number | string; y1?: number | string; x2?: number | string; y2?: number | string; stroke?: string };
      polyline: PropsForAnyIntrinsicElement & { points?: string; fill?: string; stroke?: string };
      polygon: PropsForAnyIntrinsicElement & { points?: string; fill?: string; stroke?: string };
      ellipse: PropsForAnyIntrinsicElement & { cx?: number | string; cy?: number | string; rx?: number | string; ry?: number | string; fill?: string; stroke?: string };
      text: PropsForAnyIntrinsicElement & { x?: number | string; y?: number | string; fill?: string; stroke?: string };
    }

    type Element = KatuJSXElement;
    type ElementType = string | ((props: any) => FunctionComponentResult);

    interface ElementChildrenAttribute {
      children: unknown;
    }

    type LibraryManagedAttributes<_F, P> = P & PropsForAnyIntrinsicElement;
  }
}
