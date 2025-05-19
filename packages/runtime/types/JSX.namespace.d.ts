export type ChatoraNode =
  | string
  | number
  | ChatoraJSXElement
  | ChatoraNode[]
  | null
  | undefined;

export type FunctionComponentResult = ChatoraNode | Promise<ChatoraNode>;

export interface HTMLElementEvent<T extends EventTarget> extends Event {
  target: T;
}

export interface ChatoraJSXElement {
  tag: string | ((props: Record<string, unknown>) => FunctionComponentResult);
  props: Record<string, unknown>;
}

/**
 * onXXX系イベントハンドラ属性型
 * Event handler attributes (onXXX)
 */
interface ChatoraEventHandlers {
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

interface ChatoraIntrinsicElements extends ChatoraEventHandlers {
  /**
   * 要素のID属性
   * id attribute for the element
   */
  id?: string;
  /**
   * 子ノード
   * Children nodes
   */
  children?: ChatoraNode;
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
export interface DivChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * h1要素の属性型
 * Attributes for h1 element
 */
export interface H1ChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * p要素の属性型
 * Attributes for p element
 */
export interface PChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * ul要素の属性型
 * Attributes for ul element
 */
export interface UlChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * ol要素の属性型
 * Attributes for ol element
 */
export interface OlChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * li要素の属性型
 * Attributes for li element
 */
export interface LiChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * span要素の属性型
 * Attributes for span element
 */
export interface SpanChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * button要素の属性型
 * Attributes for button element
 */
export interface ButtonChatoraIntrinsicElement extends ChatoraIntrinsicElements {
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
export interface AChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  href?: string;
  target?: string;
  rel?: string;
}
/**
 * img要素の属性型
 * Attributes for img element
 */
export interface ImgChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
}
/**
 * input要素の属性型
 * Attributes for input element
 */
export interface InputChatoraIntrinsicElement extends ChatoraIntrinsicElements {
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
export interface TextareaChatoraIntrinsicElement extends ChatoraIntrinsicElements {
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
export interface FormChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  action?: string;
  method?: string;
  enctype?: string;
  autocomplete?: string;
}
/**
 * label要素の属性型
 * Attributes for label element
 */
export interface LabelChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  for?: string;
}
/**
 * td要素の属性型
 * Attributes for td element
 */
export interface TdChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  colspan?: number;
  rowspan?: number;
}
/**
 * th要素の属性型
 * Attributes for th element
 */
export interface ThChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  colspan?: number;
  rowspan?: number;
  scope?: string;
}
/**
 * svg要素の属性型
 * Attributes for svg element
 */
export interface SvgChatoraIntrinsicElement extends ChatoraIntrinsicElements {
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
export interface PathChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  d?: string;
  fill?: string;
  stroke?: string;
}
/**
 * circle要素の属性型
 * Attributes for circle element
 */
export interface CircleChatoraIntrinsicElement extends ChatoraIntrinsicElements {
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
export interface RectChatoraIntrinsicElement extends ChatoraIntrinsicElements {
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
export interface LineChatoraIntrinsicElement extends ChatoraIntrinsicElements {
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
export interface PolylineChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  points?: string;
  fill?: string;
  stroke?: string;
}
/**
 * polygon要素の属性型
 * Attributes for polygon element
 */
export interface PolygonChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  points?: string;
  fill?: string;
  stroke?: string;
}
/**
 * ellipse要素の属性型
 * Attributes for ellipse element
 */
export interface EllipseChatoraIntrinsicElement extends ChatoraIntrinsicElements {
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
export interface TextChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  x?: number | string;
  y?: number | string;
  fill?: string;
  stroke?: string;
}

/**
 * slot要素の属性型
 * Attributes for slot element
 */
export interface SlotChatoraIntrinsicElement extends ChatoraIntrinsicElements {
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
      div: DivChatoraIntrinsicElement;
      h1: H1ChatoraIntrinsicElement;
      p: PChatoraIntrinsicElement;
      ul: UlChatoraIntrinsicElement;
      ol: OlChatoraIntrinsicElement;
      li: LiChatoraIntrinsicElement;
      span: SpanChatoraIntrinsicElement;
      button: ButtonChatoraIntrinsicElement;
      a: AChatoraIntrinsicElement;
      img: ImgChatoraIntrinsicElement;
      input: InputChatoraIntrinsicElement;
      textarea: TextareaChatoraIntrinsicElement;
      form: FormChatoraIntrinsicElement;
      label: LabelChatoraIntrinsicElement;
      table: ChatoraIntrinsicElements;
      tr: ChatoraIntrinsicElements;
      td: TdChatoraIntrinsicElement;
      th: ThChatoraIntrinsicElement;
      thead: ChatoraIntrinsicElements;
      tbody: ChatoraIntrinsicElements;
      tfoot: ChatoraIntrinsicElements;
      section: ChatoraIntrinsicElements;
      article: ChatoraIntrinsicElements;
      nav: ChatoraIntrinsicElements;
      header: ChatoraIntrinsicElements;
      footer: ChatoraIntrinsicElements;
      aside: ChatoraIntrinsicElements;
      main: ChatoraIntrinsicElements;
      strong: ChatoraIntrinsicElements;
      em: ChatoraIntrinsicElements;
      b: ChatoraIntrinsicElements;
      i: ChatoraIntrinsicElements;
      u: ChatoraIntrinsicElements;
      s: ChatoraIntrinsicElements;
      pre: ChatoraIntrinsicElements;
      code: ChatoraIntrinsicElements;
      blockquote: ChatoraIntrinsicElements;
      hr: ChatoraIntrinsicElements;
      br: ChatoraIntrinsicElements;
      svg: SvgChatoraIntrinsicElement;
      path: PathChatoraIntrinsicElement;
      circle: CircleChatoraIntrinsicElement;
      rect: RectChatoraIntrinsicElement;
      line: LineChatoraIntrinsicElement;
      polyline: PolylineChatoraIntrinsicElement;
      polygon: PolygonChatoraIntrinsicElement;
      ellipse: EllipseChatoraIntrinsicElement;
      text: TextChatoraIntrinsicElement;
      slot: SlotChatoraIntrinsicElement;
    }

    type Element = ChatoraJSXElement;
    type ElementType = string | ((props: any) => FunctionComponentResult);

    interface ElementChildrenAttribute {
      children: unknown;
    }

    type LibraryManagedAttributes<_F, P> = P & ChatoraIntrinsicElements;
  }
}
