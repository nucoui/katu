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

/**
 * 全HTML要素の属性型（MDNリファレンス準拠）
 * https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements
 */
export interface AbbrChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface AddressChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface AreaChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  alt?: string;
  coords?: string;
  shape?: string;
  href?: string;
  target?: string;
  download?: string;
  rel?: string;
  referrerpolicy?: string;
}
export interface ArticleChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface AsideChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface AudioChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  src?: string;
  controls?: boolean;
  autoplay?: boolean;
  loop?: boolean;
  muted?: boolean;
  preload?: "none" | "metadata" | "auto";
  crossorigin?: "anonymous" | "use-credentials";
}
export interface BaseChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  href?: string;
  target?: string;
}
export interface BChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface BdiChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface BdoChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  dir?: string;
}
export interface BlockquoteChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  cite?: string;
}
export interface BodyChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface BrChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface ButtonChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  autofocus?: boolean;
  disabled?: boolean;
  form?: string;
  formaction?: string;
  formenctype?: string;
  formmethod?: string;
  formnovalidate?: boolean;
  formtarget?: string;
  name?: string;
  type?: "button" | "submit" | "reset";
  value?: string | number;
}
export interface CanvasChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  width?: number | string;
  height?: number | string;
}
export interface CaptionChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface CiteChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface CodeChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface ColChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  span?: number;
  width?: number | string;
}
export interface ColgroupChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  span?: number;
}
export interface DataChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  value?: string | number;
}
export interface DatalistChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface DdChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface DelChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  cite?: string;
  datetime?: string;
}
export interface DetailsChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  open?: boolean;
}
export interface DfnChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface DialogChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  open?: boolean;
  returnValue?: string;
}
export interface DlChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface DtChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface EmChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface EmbedChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  src?: string;
  type?: string;
  width?: number | string;
  height?: number | string;
}
export interface FieldsetChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  disabled?: boolean;
  form?: string;
  name?: string;
}
export interface FigcaptionChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface FigureChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface FooterChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface FormChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  acceptCharset?: string;
  action?: string;
  autocomplete?: string;
  enctype?: string;
  method?: string;
  name?: string;
  novalidate?: boolean;
  rel?: string;
  target?: string;
}
export interface HeadChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface HeaderChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface HgroupChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface HrChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface HtmlChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  manifest?: string;
}
export interface IChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface IframeChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  allow?: string;
  allowfullscreen?: boolean;
  allowpaymentrequest?: boolean;
  height?: number | string;
  loading?: "eager" | "lazy";
  name?: string;
  referrerpolicy?: string;
  sandbox?: string;
  src?: string;
  srcdoc?: string;
  width?: number | string;
}
export interface ImgChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  alt?: string;
  src?: string;
  srcset?: string;
  width?: number | string;
  height?: number | string;
  decoding?: "async" | "sync" | "auto";
  loading?: "eager" | "lazy";
  referrerpolicy?: string;
  sizes?: string;
  crossorigin?: "anonymous" | "use-credentials";
  usemap?: string;
  ismap?: boolean;
}
export interface InputChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  accept?: string;
  alt?: string;
  autocomplete?: string;
  autofocus?: boolean;
  capture?: boolean | string;
  checked?: boolean;
  dirname?: string;
  disabled?: boolean;
  form?: string;
  formaction?: string;
  formenctype?: string;
  formmethod?: string;
  formnovalidate?: boolean;
  formtarget?: string;
  height?: number | string;
  list?: string;
  max?: number | string;
  maxlength?: number;
  min?: number | string;
  minlength?: number;
  multiple?: boolean;
  name?: string;
  pattern?: string;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  size?: number;
  src?: string;
  step?: number | string;
  type?: string;
  value?: string | number | readonly string[];
  width?: number | string;
}
export interface InsChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  cite?: string;
  datetime?: string;
}
export interface KbdChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface KeygenChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  autofocus?: boolean;
  challenge?: string;
  disabled?: boolean;
  form?: string;
  keytype?: string;
  name?: string;
}
export interface LabelChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  for?: string;
  form?: string;
}
export interface LegendChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface LiChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  value?: number;
}
export interface LinkChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  as?: string;
  crossorigin?: string;
  disabled?: boolean;
  href?: string;
  hreflang?: string;
  imagesizes?: string;
  imagesrcset?: string;
  integrity?: string;
  media?: string;
  referrerpolicy?: string;
  rel?: string;
  sizes?: string;
  title?: string;
  type?: string;
}
export interface MainChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface MapChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  name?: string;
}
export interface MarkChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface MenuChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  type?: string;
  label?: string;
}
export interface MetaChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  charset?: string;
  content?: string;
  httpEquiv?: string;
  name?: string;
}
export interface MeterChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  value?: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
}
export interface NavChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface NoscriptChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface ObjectChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  data?: string;
  form?: string;
  height?: number | string;
  name?: string;
  type?: string;
  typemustmatch?: boolean;
  usemap?: string;
  width?: number | string;
}
export interface OlChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  reversed?: boolean;
  start?: number;
  type?: string;
}
export interface OptgroupChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  disabled?: boolean;
  label?: string;
}
export interface OptionChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  disabled?: boolean;
  label?: string;
  selected?: boolean;
  value?: string | number;
}
export interface OutputChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  for?: string;
  form?: string;
  name?: string;
}
export interface PChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface ParamChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  name?: string;
  value?: string | number;
}
export interface PictureChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface PreChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface ProgressChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  max?: number;
  value?: number;
}
export interface QChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  cite?: string;
}
export interface RpChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface RtChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface RubyChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface SChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface SampChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface ScriptChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  async?: boolean;
  charset?: string;
  crossorigin?: string;
  defer?: boolean;
  integrity?: string;
  nomodule?: boolean;
  nonce?: string;
  referrerpolicy?: string;
  src?: string;
  type?: string;
}
export interface SectionChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface SelectChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  autofocus?: boolean;
  disabled?: boolean;
  form?: string;
  multiple?: boolean;
  name?: string;
  required?: boolean;
  size?: number;
}
export interface SmallChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface SourceChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  media?: string;
  sizes?: string;
  src?: string;
  srcset?: string;
  type?: string;
}
export interface SpanChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface StrongChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface StyleChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  media?: string;
  nonce?: string;
  scoped?: boolean;
  type?: string;
}
export interface SubChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface SummaryChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface SupChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface TableChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  border?: number | string;
}
export interface TbodyChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface TdChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  colspan?: number;
  headers?: string;
  rowspan?: number;
}
export interface TemplateChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface TextareaChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  autofocus?: boolean;
  cols?: number;
  dirname?: string;
  disabled?: boolean;
  form?: string;
  maxlength?: number;
  minlength?: number;
  name?: string;
  placeholder?: string;
  readonly?: boolean;
  required?: boolean;
  rows?: number;
  wrap?: string;
}
export interface TfootChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface ThChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  abbr?: string;
  colspan?: number;
  headers?: string;
  rowspan?: number;
  scope?: string;
}
export interface TheadChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface TimeChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  datetime?: string;
}
export interface TitleChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface TrChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface TrackChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  default?: boolean;
  kind?: string;
  label?: string;
  src?: string;
  srclang?: string;
}
export interface UChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface UlChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface VarChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
export interface VideoChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  autoplay?: boolean;
  controls?: boolean;
  height?: number | string;
  loop?: boolean;
  muted?: boolean;
  playsinline?: boolean;
  poster?: string;
  preload?: "none" | "metadata" | "auto";
  src?: string;
  width?: number | string;
  crossorigin?: "anonymous" | "use-credentials";
}
export interface WbrChatoraIntrinsicElement extends ChatoraIntrinsicElements {}

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
