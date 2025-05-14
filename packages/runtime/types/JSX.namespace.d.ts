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

/**
 * onXXX系イベントハンドラ属性型
 * Event handler attributes (onXXX)
 */
interface KatuEventHandlers {
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

interface KatuIntrinsicElements extends KatuEventHandlers {
  /**
   * 要素のID属性
   * id attribute for the element
   */
  id?: string;
  /**
   * 子ノード
   * Children nodes
   */
  children?: KatuNode;
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
export interface DivKatuIntrinsicElement extends KatuIntrinsicElements {}
/**
 * h1要素の属性型
 * Attributes for h1 element
 */
export interface H1KatuIntrinsicElement extends KatuIntrinsicElements {}
/**
 * p要素の属性型
 * Attributes for p element
 */
export interface PKatuIntrinsicElement extends KatuIntrinsicElements {}
/**
 * ul要素の属性型
 * Attributes for ul element
 */
export interface UlKatuIntrinsicElement extends KatuIntrinsicElements {}
/**
 * ol要素の属性型
 * Attributes for ol element
 */
export interface OlKatuIntrinsicElement extends KatuIntrinsicElements {}
/**
 * li要素の属性型
 * Attributes for li element
 */
export interface LiKatuIntrinsicElement extends KatuIntrinsicElements {}
/**
 * span要素の属性型
 * Attributes for span element
 */
export interface SpanKatuIntrinsicElement extends KatuIntrinsicElements {}
/**
 * button要素の属性型
 * Attributes for button element
 */
export interface ButtonKatuIntrinsicElement extends KatuIntrinsicElements {}
/**
 * a要素の属性型
 * Attributes for a element
 */
export interface AKatuIntrinsicElement extends KatuIntrinsicElements {
  href?: string;
  target?: string;
  rel?: string;
}
/**
 * img要素の属性型
 * Attributes for img element
 */
export interface ImgKatuIntrinsicElement extends KatuIntrinsicElements {
  src?: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
}
/**
 * input要素の属性型
 * Attributes for input element
 */
export interface InputKatuIntrinsicElement extends KatuIntrinsicElements {
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
export interface TextareaKatuIntrinsicElement extends KatuIntrinsicElements {
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
export interface FormKatuIntrinsicElement extends KatuIntrinsicElements {
  action?: string;
  method?: string;
  enctype?: string;
  autocomplete?: string;
}
/**
 * label要素の属性型
 * Attributes for label element
 */
export interface LabelKatuIntrinsicElement extends KatuIntrinsicElements {
  for?: string;
}
/**
 * td要素の属性型
 * Attributes for td element
 */
export interface TdKatuIntrinsicElement extends KatuIntrinsicElements {
  colspan?: number;
  rowspan?: number;
}
/**
 * th要素の属性型
 * Attributes for th element
 */
export interface ThKatuIntrinsicElement extends KatuIntrinsicElements {
  colspan?: number;
  rowspan?: number;
  scope?: string;
}
/**
 * svg要素の属性型
 * Attributes for svg element
 */
export interface SvgKatuIntrinsicElement extends KatuIntrinsicElements {
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
export interface PathKatuIntrinsicElement extends KatuIntrinsicElements {
  d?: string;
  fill?: string;
  stroke?: string;
}
/**
 * circle要素の属性型
 * Attributes for circle element
 */
export interface CircleKatuIntrinsicElement extends KatuIntrinsicElements {
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
export interface RectKatuIntrinsicElement extends KatuIntrinsicElements {
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
export interface LineKatuIntrinsicElement extends KatuIntrinsicElements {
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
export interface PolylineKatuIntrinsicElement extends KatuIntrinsicElements {
  points?: string;
  fill?: string;
  stroke?: string;
}
/**
 * polygon要素の属性型
 * Attributes for polygon element
 */
export interface PolygonKatuIntrinsicElement extends KatuIntrinsicElements {
  points?: string;
  fill?: string;
  stroke?: string;
}
/**
 * ellipse要素の属性型
 * Attributes for ellipse element
 */
export interface EllipseKatuIntrinsicElement extends KatuIntrinsicElements {
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
export interface TextKatuIntrinsicElement extends KatuIntrinsicElements {
  x?: number | string;
  y?: number | string;
  fill?: string;
  stroke?: string;
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      div: DivKatuIntrinsicElement;
      h1: H1KatuIntrinsicElement;
      p: PKatuIntrinsicElement;
      ul: UlKatuIntrinsicElement;
      ol: OlKatuIntrinsicElement;
      li: LiKatuIntrinsicElement;
      span: SpanKatuIntrinsicElement;
      button: ButtonKatuIntrinsicElement;
      a: AKatuIntrinsicElement;
      img: ImgKatuIntrinsicElement;
      input: InputKatuIntrinsicElement;
      textarea: TextareaKatuIntrinsicElement;
      form: FormKatuIntrinsicElement;
      label: LabelKatuIntrinsicElement;
      table: KatuIntrinsicElements;
      tr: KatuIntrinsicElements;
      td: TdKatuIntrinsicElement;
      th: ThKatuIntrinsicElement;
      thead: KatuIntrinsicElements;
      tbody: KatuIntrinsicElements;
      tfoot: KatuIntrinsicElements;
      section: KatuIntrinsicElements;
      article: KatuIntrinsicElements;
      nav: KatuIntrinsicElements;
      header: KatuIntrinsicElements;
      footer: KatuIntrinsicElements;
      aside: KatuIntrinsicElements;
      main: KatuIntrinsicElements;
      strong: KatuIntrinsicElements;
      em: KatuIntrinsicElements;
      b: KatuIntrinsicElements;
      i: KatuIntrinsicElements;
      u: KatuIntrinsicElements;
      s: KatuIntrinsicElements;
      pre: KatuIntrinsicElements;
      code: KatuIntrinsicElements;
      blockquote: KatuIntrinsicElements;
      hr: KatuIntrinsicElements;
      br: KatuIntrinsicElements;
      svg: SvgKatuIntrinsicElement;
      path: PathKatuIntrinsicElement;
      circle: CircleKatuIntrinsicElement;
      rect: RectKatuIntrinsicElement;
      line: LineKatuIntrinsicElement;
      polyline: PolylineKatuIntrinsicElement;
      polygon: PolygonKatuIntrinsicElement;
      ellipse: EllipseKatuIntrinsicElement;
      text: TextKatuIntrinsicElement;
    }

    type Element = KatuJSXElement;
    type ElementType = string | ((props: any) => FunctionComponentResult);

    interface ElementChildrenAttribute {
      children: unknown;
    }

    type LibraryManagedAttributes<_F, P> = P & KatuIntrinsicElements;
  }
}
