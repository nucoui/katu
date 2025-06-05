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

/**
 * Global attributes for all HTML elements (WHATWG HTML spec 3.2.6)
 * https://html.spec.whatwg.org/multipage/dom.html#global-attributes
 */
interface ChatoraIntrinsicElements extends ChatoraEventHandlers {
  /**
   * Specifies a shortcut key to activate/focus the element
   */
  accesskey?: string;
  /**
   * Controls whether and how text input is automatically capitalized
   */
  autocapitalize?: string;
  /**
   * Indicates whether the element should automatically get focus
   */
  autofocus?: boolean;
  /**
   * Assigns a class name or set of class names to the element
   */
  class?: string;
  /**
   * Indicates whether the element is editable
   */
  contenteditable?: boolean | "true" | "false";
  /**
   * Specifies the text direction for the content in the element
   */
  dir?: "ltr" | "rtl" | "auto";
  /**
   * Specifies whether the element is draggable
   */
  draggable?: boolean | "true" | "false";
  /**
   * Hints at the type of enter key to display
   */
  enterkeyhint?: string;
  /**
   * Hides the element
   */
  hidden?: boolean;
  /**
   * Specifies a unique id for the element
   */
  id?: string;
  /**
   * Provides a hint to browsers for devices with onscreen keyboards
   */
  inputmode?: string;
  /**
   * Allows custom elements to be defined
   */
  is?: string;
  /**
   * Microdata: Global attribute for microdata item id
   */
  itemid?: string;
  /**
   * Microdata: Global attribute for microdata property
   */
  itemprop?: string;
  /**
   * Microdata: Global attribute for microdata reference
   */
  itemref?: string;
  /**
   * Microdata: Global attribute for microdata scope
   */
  itemscope?: boolean;
  /**
   * Microdata: Global attribute for microdata type
   */
  itemtype?: string;
  /**
   * Language of the element's content
   */
  lang?: string;
  /**
   * Cryptographic nonce used in Content Security Policy
   */
  nonce?: string;
  /**
   * Assigns a part name to the element for styling
   */
  part?: string;
  /**
   * Indicates the element is a popover
   */
  popover?: boolean | "auto";
  /**
   * Defines a role for the element (accessibility)
   */
  role?: string;
  /**
   * Assigns a slot in a shadow DOM
   */
  slot?: string;
  /**
   * Indicates whether spell checking is allowed
   */
  spellcheck?: boolean | "true" | "false";
  /**
   * Inline CSS styles
   */
  style?: string | Record<string, string | number>;
  /**
   * Specifies the tab order of the element
   */
  tabindex?: number;
  /**
   * Text to display in a tooltip
   */
  title?: string;
  /**
   * Specifies whether the element's content is translated
   */
  translate?: "yes" | "no";
  /**
   * Any data-* attribute
   */
  [dataAttr: `data-${string}`]: string | undefined;
  /**
   * Any aria-* attribute
   */
  [ariaAttr: `aria-${string}`]: string | undefined;
  /**
   * Children nodes
   */
  children?: ChatoraNode;
}

/**
 * Attributes for div element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-div-element
 */
export interface DivChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for h1 element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/sections.html#the-h1,-h2,-h3,-h4,-h5,-and-h6-elements
 */
export interface H1ChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for p element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/paragraphs.html#the-p-element
 */
export interface PChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for ul element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-ul-element
 */
export interface UlChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for ol element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-ol-element
 */
export interface OlChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for li element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-li-element
 */
export interface LiChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  /**
   * Value attribute for li element
   */
  value?: number;
}
/**
 * Attributes for span element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-span-element
 */
export interface SpanChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for button element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-button-element
 */
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
/**
 * Attributes for canvas element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/canvas.html#the-canvas-element
 */
export interface CanvasChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  width?: number | string;
  height?: number | string;
}
/**
 * Attributes for caption element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/tables.html#the-caption-element
 */
export interface CaptionChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for cite element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-cite-element
 */
export interface CiteChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for code element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-code-element
 */
export interface CodeChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for col element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/tables.html#the-col-element
 */
export interface ColChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  span?: number;
  width?: number | string;
}
/**
 * Attributes for colgroup element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/tables.html#the-colgroup-element
 */
export interface ColgroupChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  span?: number;
}
/**
 * Attributes for data element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-data-element
 */
export interface DataChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  value?: string | number;
}
/**
 * Attributes for datalist element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-datalist-element
 */
export interface DatalistChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for dd element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-dd-element
 */
export interface DdChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for del element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/edits.html#the-del-element
 */
export interface DelChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  cite?: string;
  datetime?: string;
}
/**
 * Attributes for details element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element
 */
export interface DetailsChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  open?: boolean;
}
/**
 * Attributes for dfn element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-dfn-element
 */
export interface DfnChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for dialog element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/interactive-elements.html#the-dialog-element
 */
export interface DialogChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  open?: boolean;
  returnValue?: string;
}
/**
 * Attributes for dl element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-dl-element
 */
export interface DlChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for dt element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-dt-element
 */
export interface DtChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for em element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-em-element
 */
export interface EmChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for embed element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/embedded-content.html#the-embed-element
 */
export interface EmbedChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  src?: string;
  type?: string;
  width?: number | string;
  height?: number | string;
}
/**
 * Attributes for fieldset element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-fieldset-element
 */
export interface FieldsetChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  disabled?: boolean;
  form?: string;
  name?: string;
}
/**
 * Attributes for figcaption element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-figcaption-element
 */
export interface FigcaptionChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for figure element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-figure-element
 */
export interface FigureChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for footer element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/sections.html#the-footer-element
 */
export interface FooterChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for form element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-form-element
 */
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
/**
 * Attributes for head element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/semantics.html#the-head-element
 */
export interface HeadChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for header element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/sections.html#the-header-element
 */
export interface HeaderChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for hgroup element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/sections.html#the-hgroup-element
 */
export interface HgroupChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for hr element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-hr-element
 */
export interface HrChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for html element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/semantics.html#the-html-element
 */
export interface HtmlChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  manifest?: string;
}
/**
 * Attributes for i element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-i-element
 */
export interface IChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for iframe element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/iframe-embed-object.html#the-iframe-element
 */
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
/**
 * Attributes for img element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/embedded-content.html#the-img-element
 */
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
/**
 * Attributes for input element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/input.html#the-input-element
 */
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
/**
 * Attributes for ins element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/edits.html#the-ins-element
 */
export interface InsChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  cite?: string;
  datetime?: string;
}
/**
 * Attributes for kbd element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-kbd-element
 */
export interface KbdChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for keygen element (WHATWG HTML spec, obsolete)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-keygen-element
 */
export interface KeygenChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  autofocus?: boolean;
  challenge?: string;
  disabled?: boolean;
  form?: string;
  keytype?: string;
  name?: string;
}
/**
 * Attributes for label element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-label-element
 */
export interface LabelChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  for?: string;
  form?: string;
}
/**
 * Attributes for legend element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-legend-element
 */
export interface LegendChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for li element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-li-element
 */
export interface LiChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  value?: number;
}
/**
 * Attributes for link element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/semantics.html#the-link-element
 */
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
/**
 * Attributes for main element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/sections.html#the-main-element
 */
export interface MainChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for map element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/image-maps.html#the-map-element
 */
export interface MapChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  name?: string;
}
/**
 * Attributes for mark element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-mark-element
 */
export interface MarkChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for menu element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/interactive-elements.html#the-menu-element
 */
export interface MenuChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  type?: string;
  label?: string;
}
/**
 * Attributes for meta element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/semantics.html#the-meta-element
 */
export interface MetaChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  charset?: string;
  content?: string;
  httpEquiv?: string;
  name?: string;
}
/**
 * Attributes for meter element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-meter-element
 */
export interface MeterChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  value?: number;
  min?: number;
  max?: number;
  low?: number;
  high?: number;
  optimum?: number;
}
/**
 * Attributes for nav element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/sections.html#the-nav-element
 */
export interface NavChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for noscript element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/scripting.html#the-noscript-element
 */
export interface NoscriptChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for object element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/embedded-content.html#the-object-element
 */
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
/**
 * Attributes for ol element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-ol-element
 */
export interface OlChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  reversed?: boolean;
  start?: number;
  type?: string;
}
/**
 * Attributes for optgroup element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-optgroup-element
 */
export interface OptgroupChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  disabled?: boolean;
  label?: string;
}
/**
 * Attributes for option element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-option-element
 */
export interface OptionChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  disabled?: boolean;
  label?: string;
  selected?: boolean;
  value?: string | number;
}
/**
 * Attributes for output element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-output-element
 */
export interface OutputChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  for?: string;
  form?: string;
  name?: string;
}
/**
 * Attributes for p element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/paragraphs.html#the-p-element
 */
export interface PChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for param element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/embedded-content.html#the-param-element
 */
export interface ParamChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  name?: string;
  value?: string | number;
}
/**
 * Attributes for picture element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/embedded-content.html#the-picture-element
 */
export interface PictureChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for pre element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-pre-element
 */
export interface PreChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for progress element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-progress-element
 */
export interface ProgressChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  max?: number;
  value?: number;
}
/**
 * Attributes for q element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-q-element
 */
export interface QChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  cite?: string;
}
/**
 * Attributes for rp element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/semantics.html#the-rp-element
 */
export interface RpChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for rt element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/semantics.html#the-rt-element
 */
export interface RtChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for ruby element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/semantics.html#the-ruby-element
 */
export interface RubyChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for s element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-s-element
 */
export interface SChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for samp element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-samp-element
 */
export interface SampChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for script element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/scripting.html#the-script-element
 */
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
/**
 * Attributes for section element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/sections.html#the-section-element
 */
export interface SectionChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for select element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-select-element
 */
export interface SelectChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  autofocus?: boolean;
  disabled?: boolean;
  form?: string;
  multiple?: boolean;
  name?: string;
  required?: boolean;
  size?: number;
}
/**
 * Attributes for small element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-small-element
 */
export interface SmallChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for source element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/embedded-content.html#the-source-element
 */
export interface SourceChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  media?: string;
  sizes?: string;
  src?: string;
  srcset?: string;
  type?: string;
}
/**
 * Attributes for span element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-span-element
 */
export interface SpanChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for strong element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-strong-element
 */
export interface StrongChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for style element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/semantics.html#the-style-element
 */
export interface StyleChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  media?: string;
  nonce?: string;
  scoped?: boolean;
  type?: string;
}
/**
 * Attributes for sub element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-sub-and-sup-elements
 */
export interface SubChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for summary element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/interactive-elements.html#the-summary-element
 */
export interface SummaryChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for sup element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-sub-and-sup-elements
 */
export interface SupChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for table element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/tables.html#the-table-element
 */
export interface TableChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  border?: number | string;
}
/**
 * Attributes for tbody element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/tables.html#the-tbody-element
 */
export interface TbodyChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for td element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/tables.html#the-td-element
 */
export interface TdChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  colspan?: number;
  headers?: string;
  rowspan?: number;
}
/**
 * Attributes for template element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/scripting.html#the-template-element
 */
export interface TemplateChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for textarea element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/form-elements.html#the-textarea-element
 */
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
/**
 * Attributes for tfoot element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/tables.html#the-tfoot-element
 */
export interface TfootChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for th element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/tables.html#the-th-element
 */
export interface ThChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  abbr?: string;
  colspan?: number;
  headers?: string;
  rowspan?: number;
  scope?: string;
}
/**
 * Attributes for thead element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/tables.html#the-thead-element
 */
export interface TheadChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for time element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-time-element
 */
export interface TimeChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  datetime?: string;
}
/**
 * Attributes for title element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/semantics.html#the-title-element
 */
export interface TitleChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for tr element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/tables.html#the-tr-element
 */
export interface TrChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for track element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/media.html#the-track-element
 */
export interface TrackChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  default?: boolean;
  kind?: string;
  label?: string;
  src?: string;
  srclang?: string;
}
/**
 * Attributes for u element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-u-element
 */
export interface UChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for ul element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/grouping-content.html#the-ul-element
 */
export interface UlChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for var element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-var-element
 */
export interface VarChatoraIntrinsicElement extends ChatoraIntrinsicElements {}
/**
 * Attributes for video element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/media.html#the-video-element
 */
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
/**
 * Attributes for wbr element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-wbr-element
 */
export interface WbrChatoraIntrinsicElement extends ChatoraIntrinsicElements {}

/**
 * Attributes for a element (WHATWG HTML spec)
 * https://html.spec.whatwg.org/multipage/text-level-semantics.html#the-a-element
 */
export interface AChatoraIntrinsicElement extends ChatoraIntrinsicElements {
  /**
   * Address of the hyperlink
   */
  href?: string;
  /**
   * Name of target browsing context
   */
  target?: string;
  /**
   * Relationship of the linked URL as space-separated link types
   */
  rel?: string;
  /**
   * Hints at the language of the referenced resource
   */
  hreflang?: string;
  /**
   * Hint for the type of the referenced resource
   */
  type?: string;
  /**
   * Download attribute (filename or boolean)
   */
  download?: string | boolean;
  /**
   * Referrer policy for fetches initiated by the element
   */
  referrerpolicy?: string;
  /**
   * Coordinates for use with image maps
   */
  coords?: string;
  /**
   * The shape of the area (for image maps)
   */
  shape?: string;
}

declare global {
  namespace JSX {
    /**
     * Intrinsic elements mapping for JSX (WHATWG HTML/SVG spec)
     */
    interface IntrinsicElements {
      div: DivChatoraIntrinsicElement;
      h1: H1ChatoraIntrinsicElement;
      p: PChatoraIntrinsicElement;
      ul: UlChatoraIntrinsicElement;
      ol: OlChatoraIntrinsicElement;
      li: LiChatoraIntrinsicElement;
      span: SpanChatoraIntrinsicElement;
      button: ButtonChatoraIntrinsicElement;
      canvas: CanvasChatoraIntrinsicElement;
      caption: CaptionChatoraIntrinsicElement;
      cite: CiteChatoraIntrinsicElement;
      code: CodeChatoraIntrinsicElement;
      col: ColChatoraIntrinsicElement;
      colgroup: ColgroupChatoraIntrinsicElement;
      data: DataChatoraIntrinsicElement;
      datalist: DatalistChatoraIntrinsicElement;
      dd: DdChatoraIntrinsicElement;
      del: DelChatoraIntrinsicElement;
      details: DetailsChatoraIntrinsicElement;
      dfn: DfnChatoraIntrinsicElement;
      dialog: DialogChatoraIntrinsicElement;
      dl: DlChatoraIntrinsicElement;
      dt: DtChatoraIntrinsicElement;
      em: EmChatoraIntrinsicElement;
      embed: EmbedChatoraIntrinsicElement;
      fieldset: FieldsetChatoraIntrinsicElement;
      figcaption: FigcaptionChatoraIntrinsicElement;
      figure: FigureChatoraIntrinsicElement;
      footer: FooterChatoraIntrinsicElement;
      form: FormChatoraIntrinsicElement;
      head: HeadChatoraIntrinsicElement;
      header: HeaderChatoraIntrinsicElement;
      hgroup: HgroupChatoraIntrinsicElement;
      hr: HrChatoraIntrinsicElement;
      html: HtmlChatoraIntrinsicElement;
      i: IChatoraIntrinsicElement;
      iframe: IframeChatoraIntrinsicElement;
      img: ImgChatoraIntrinsicElement;
      input: InputChatoraIntrinsicElement;
      ins: InsChatoraIntrinsicElement;
      kbd: KbdChatoraIntrinsicElement;
      keygen: KeygenChatoraIntrinsicElement; // 廃止要素: HTML Living Standardでは非推奨
      label: LabelChatoraIntrinsicElement;
      legend: LegendChatoraIntrinsicElement;
      link: LinkChatoraIntrinsicElement;
      main: MainChatoraIntrinsicElement;
      map: MapChatoraIntrinsicElement;
      mark: MarkChatoraIntrinsicElement;
      menu: MenuChatoraIntrinsicElement;
      meta: MetaChatoraIntrinsicElement;
      meter: MeterChatoraIntrinsicElement;
      nav: NavChatoraIntrinsicElement;
      noscript: NoscriptChatoraIntrinsicElement;
      object: ObjectChatoraIntrinsicElement;
      optgroup: OptgroupChatoraIntrinsicElement;
      option: OptionChatoraIntrinsicElement;
      output: OutputChatoraIntrinsicElement;
      param: ParamChatoraIntrinsicElement;
      picture: PictureChatoraIntrinsicElement;
      pre: PreChatoraIntrinsicElement;
      progress: ProgressChatoraIntrinsicElement;
      q: QChatoraIntrinsicElement;
      rp: RpChatoraIntrinsicElement;
      rt: RtChatoraIntrinsicElement;
      ruby: RubyChatoraIntrinsicElement;
      s: SChatoraIntrinsicElement;
      samp: SampChatoraIntrinsicElement;
      script: ScriptChatoraIntrinsicElement;
      section: SectionChatoraIntrinsicElement;
      select: SelectChatoraIntrinsicElement;
      small: SmallChatoraIntrinsicElement;
      source: SourceChatoraIntrinsicElement;
      strong: StrongChatoraIntrinsicElement;
      style: StyleChatoraIntrinsicElement;
      sub: SubChatoraIntrinsicElement;
      summary: SummaryChatoraIntrinsicElement;
      sup: SupChatoraIntrinsicElement;
      table: TableChatoraIntrinsicElement;
      tbody: TbodyChatoraIntrinsicElement;
      td: TdChatoraIntrinsicElement;
      template: TemplateChatoraIntrinsicElement;
      textarea: TextareaChatoraIntrinsicElement;
      tfoot: TfootChatoraIntrinsicElement;
      th: ThChatoraIntrinsicElement;
      thead: TheadChatoraIntrinsicElement;
      time: TimeChatoraIntrinsicElement;
      title: TitleChatoraIntrinsicElement;
      tr: TrChatoraIntrinsicElement;
      track: TrackChatoraIntrinsicElement;
      u: UChatoraIntrinsicElement;
      ul: UlChatoraIntrinsicElement;
      var: VarChatoraIntrinsicElement;
      video: VideoChatoraIntrinsicElement;
      wbr: WbrChatoraIntrinsicElement;
      a: AChatoraIntrinsicElement;
      abbr: AbbrChatoraIntrinsicElement;
      address: AddressChatoraIntrinsicElement;
      area: AreaChatoraIntrinsicElement;
      article: ArticleChatoraIntrinsicElement;
      aside: AsideChatoraIntrinsicElement;
      audio: AudioChatoraIntrinsicElement;
      base: BaseChatoraIntrinsicElement;
      b: BChatoraIntrinsicElement;
      bdi: BdiChatoraIntrinsicElement;
      bdo: BdoChatoraIntrinsicElement;
      blockquote: BlockquoteChatoraIntrinsicElement;
      body: BodyChatoraIntrinsicElement;
      br: BrChatoraIntrinsicElement;
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
