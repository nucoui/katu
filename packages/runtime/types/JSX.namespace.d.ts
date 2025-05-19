export type ToraNode =
  | string
  | number
  | ToraJSXElement
  | ToraNode[]
  | null
  | undefined;

export type FunctionComponentResult = ToraNode | Promise<ToraNode>;

export interface HTMLElementEvent<T extends EventTarget> extends Event {
  target: T;
}

export interface ToraJSXElement {
  tag: string | ((props: Record<string, unknown>) => FunctionComponentResult);
  props: Record<string, unknown>;
}

/**
 * onXXX系イベントハンドラ属性型
 * Event handler attributes (onXXX)
 */
interface ToraEventHandlers {
  /**
   * クリックイベント
   * Click event handler
   */
  onClick?: (event: MouseEvent) => void;
  /**
   * 変更イベント
   * Change event handler
   */
  onChange?: (event: HTMLElementEvent<EventTarget>) => void;
  // 必要に応じて他のonXXXイベントもここに追加可能
}

interface ToraIntrinsicElements extends ToraEventHandlers {
  /**
   * 要素のID属性
   * id attribute for the element
   */
  id?: string;
  /**
   * 子ノード
   * Children nodes
   */
  children?: ToraNode;
  /**
   * class属性
   * class attribute for the element
   */
  class?: string;
  /**
   * style属性（インラインスタイル）
   * style attribute (inline styles)
   */
  style?: string | Record<string, string | number>;
  /**
   * title属性（ツールチップなど）
   * title attribute (tooltip, etc.)
   */
  title?: string;
  /**
   * tabIndex属性
   * tabIndex attribute
   */
  tabIndex?: number;
  /**
   * role属性（アクセシビリティ）
   * role attribute (accessibility)
   */
  role?: string;
  /**
   * hidden属性（非表示）
   * hidden attribute (hidden element)
   */
  hidden?: boolean;
  /**
   * 任意のdata-*属性
   * Any data-* attribute
   */
  [dataAttr: `data-${string}`]: string | undefined;
  /**
   * 任意のaria-*属性
   * Any aria-* attribute
   */
  [ariaAttr: `aria-${string}`]: string | undefined;
}

/**
 * div要素の属性型
 * Attributes for div element
 */
export interface DivToraIntrinsicElement extends ToraIntrinsicElements {}
/**
 * h1要素の属性型
 * Attributes for h1 element
 */
export interface H1ToraIntrinsicElement extends ToraIntrinsicElements {}
/**
 * p要素の属性型
 * Attributes for p element
 */
export interface PToraIntrinsicElement extends ToraIntrinsicElements {}
/**
 * ul要素の属性型
 * Attributes for ul element
 */
export interface UlToraIntrinsicElement extends ToraIntrinsicElements {}
/**
 * ol要素の属性型
 * Attributes for ol element
 */
export interface OlToraIntrinsicElement extends ToraIntrinsicElements {}
/**
 * li要素の属性型
 * Attributes for li element
 */
export interface LiToraIntrinsicElement extends ToraIntrinsicElements {}
/**
 * span要素の属性型
 * Attributes for span element
 */
export interface SpanToraIntrinsicElement extends ToraIntrinsicElements {}
/**
 * button要素の属性型
 * Attributes for button element
 */
export interface ButtonToraIntrinsicElement extends ToraIntrinsicElements {
  type?: string;
  disabled?: boolean;
  autofocus?: boolean;
  form?: string;
  name?: string;
  value?: string | number;
}
/**
 * a要素の属性型
 * Attributes for a element
 */
export interface AToraIntrinsicElement extends ToraIntrinsicElements {
  href?: string;
  target?: string;
  rel?: string;
}
/**
 * img要素の属性型
 * Attributes for img element
 */
export interface ImgToraIntrinsicElement extends ToraIntrinsicElements {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
}
/**
 * input要素の属性型
 * Attributes for input element
 */
export interface InputToraIntrinsicElement extends ToraIntrinsicElements {
  type?: string;
  value?: string | number;
  checked?: boolean;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  autofocus?: boolean;
}
/**
 * textarea要素の属性型
 * Attributes for textarea element
 */
export interface TextareaToraIntrinsicElement extends ToraIntrinsicElements {
  value?: string;
  placeholder?: string;
  name?: string;
  disabled?: boolean;
  readonly?: boolean;
  autofocus?: boolean;
  rows?: number;
  cols?: number;
}
/**
 * form要素の属性型
 * Attributes for form element
 */
export interface FormToraIntrinsicElement extends ToraIntrinsicElements {
  action?: string;
  method?: string;
  enctype?: string;
  autocomplete?: string;
}
/**
 * label要素の属性型
 * Attributes for label element
 */
export interface LabelToraIntrinsicElement extends ToraIntrinsicElements {
  for?: string;
}
/**
 * td要素の属性型
 * Attributes for td element
 */
export interface TdToraIntrinsicElement extends ToraIntrinsicElements {
  colspan?: number;
  rowspan?: number;
}
/**
 * th要素の属性型
 * Attributes for th element
 */
export interface ThToraIntrinsicElement extends ToraIntrinsicElements {
  colspan?: number;
  rowspan?: number;
  scope?: string;
}
/**
 * svg要素の属性型
 * Attributes for svg element
 */
export interface SvgToraIntrinsicElement extends ToraIntrinsicElements {
  width?: number | string;
  height?: number | string;
  viewBox?: string;
  fill?: string;
  stroke?: string;
}
/**
 * path要素の属性型
 * Attributes for path element
 */
export interface PathToraIntrinsicElement extends ToraIntrinsicElements {
  d?: string;
  fill?: string;
  stroke?: string;
}
/**
 * circle要素の属性型
 * Attributes for circle element
 */
export interface CircleToraIntrinsicElement extends ToraIntrinsicElements {
  cx?: number | string;
  cy?: number | string;
  r?: number | string;
  fill?: string;
  stroke?: string;
}
/**
 * rect要素の属性型
 * Attributes for rect element
 */
export interface RectToraIntrinsicElement extends ToraIntrinsicElements {
  x?: number | string;
  y?: number | string;
  width?: number | string;
  height?: number | string;
  fill?: string;
  stroke?: string;
}
/**
 * line要素の属性型
 * Attributes for line element
 */
export interface LineToraIntrinsicElement extends ToraIntrinsicElements {
  x1?: number | string;
  y1?: number | string;
  x2?: number | string;
  y2?: number | string;
  stroke?: string;
}
/**
 * polyline要素の属性型
 * Attributes for polyline element
 */
export interface PolylineToraIntrinsicElement extends ToraIntrinsicElements {
  points?: string;
  fill?: string;
  stroke?: string;
}
/**
 * polygon要素の属性型
 * Attributes for polygon element
 */
export interface PolygonToraIntrinsicElement extends ToraIntrinsicElements {
  points?: string;
  fill?: string;
  stroke?: string;
}
/**
 * ellipse要素の属性型
 * Attributes for ellipse element
 */
export interface EllipseToraIntrinsicElement extends ToraIntrinsicElements {
  cx?: number | string;
  cy?: number | string;
  rx?: number | string;
  ry?: number | string;
  fill?: string;
  stroke?: string;
}
/**
 * text要素の属性型
 * Attributes for text element
 */
export interface TextToraIntrinsicElement extends ToraIntrinsicElements {
  x?: number | string;
  y?: number | string;
  fill?: string;
  stroke?: string;
}

/**
 * slot要素の属性型
 * Attributes for slot element
 */
export interface SlotToraIntrinsicElement extends ToraIntrinsicElements {
  name?: string;
  /**
   * @deprecated
   * @description Deprecated: Use `name` attribute instead.
   */
  slot?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: DivToraIntrinsicElement;
      h1: H1ToraIntrinsicElement;
      p: PToraIntrinsicElement;
      ul: UlToraIntrinsicElement;
      ol: OlToraIntrinsicElement;
      li: LiToraIntrinsicElement;
      span: SpanToraIntrinsicElement;
      button: ButtonToraIntrinsicElement;
      a: AToraIntrinsicElement;
      img: ImgToraIntrinsicElement;
      input: InputToraIntrinsicElement;
      textarea: TextareaToraIntrinsicElement;
      form: FormToraIntrinsicElement;
      label: LabelToraIntrinsicElement;
      table: ToraIntrinsicElements;
      tr: ToraIntrinsicElements;
      td: TdToraIntrinsicElement;
      th: ThToraIntrinsicElement;
      thead: ToraIntrinsicElements;
      tbody: ToraIntrinsicElements;
      tfoot: ToraIntrinsicElements;
      section: ToraIntrinsicElements;
      article: ToraIntrinsicElements;
      nav: ToraIntrinsicElements;
      header: ToraIntrinsicElements;
      footer: ToraIntrinsicElements;
      aside: ToraIntrinsicElements;
      main: ToraIntrinsicElements;
      strong: ToraIntrinsicElements;
      em: ToraIntrinsicElements;
      b: ToraIntrinsicElements;
      i: ToraIntrinsicElements;
      u: ToraIntrinsicElements;
      s: ToraIntrinsicElements;
      pre: ToraIntrinsicElements;
      code: ToraIntrinsicElements;
      blockquote: ToraIntrinsicElements;
      hr: ToraIntrinsicElements;
      br: ToraIntrinsicElements;
      svg: SvgToraIntrinsicElement;
      path: PathToraIntrinsicElement;
      circle: CircleToraIntrinsicElement;
      rect: RectToraIntrinsicElement;
      line: LineToraIntrinsicElement;
      polyline: PolylineToraIntrinsicElement;
      polygon: PolygonToraIntrinsicElement;
      ellipse: EllipseToraIntrinsicElement;
      text: TextToraIntrinsicElement;
      slot: SlotToraIntrinsicElement;
    }

    type Element = ToraJSXElement;
    type ElementType = string | ((props: any) => FunctionComponentResult);

    interface ElementChildrenAttribute {
      children: unknown;
    }

    type LibraryManagedAttributes<_F, P> = P & ToraIntrinsicElements;
  }
}
