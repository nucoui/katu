/**
 * JSX.Fragment用のダミーシンボル
 * @description JSXのFragmentを表すためのダミー。jsx関数内で判定用。
 */
export const Fragment = Symbol.for("katu.fragment");

/**
 * JSX/TSX変換用のjsx関数実装
 * @param tag HTMLタグ名またはFragment
 * @param props 属性＋children
 * @returns HTML文字列
 *
 * JSX/TSX transpile用の仮実装。@katu/coreで本実装を提供予定。
 *
 * @example jsx("div", { id: "foo", children: "bar" }) // => '<div id="foo">bar</div>'
 */
export function jsx(tag: string | typeof Fragment, props: Record<string, any>): string {
  if (tag === Fragment) {
    // Fragmentは子要素をそのまま連結
    const c = props.children;
    if (Array.isArray(c))
      return c.map(String).join("");
    return c != null ? String(c) : "";
  }
  let attrs = "";
  for (const key in props) {
    // onXXX属性（関数）はHTML属性として出力しない
    if (key === "children" || props[key] == null || typeof props[key] === "function" || (/^on[A-Z]/.test(key) && typeof props[key] === "function"))
      continue;
    if (props[key] === true) {
      attrs += ` ${key}`;
    }
    else {
      attrs += ` ${key}='${String(props[key]).replace(/'/g, "&#39;")}'`;
    }
  }
  const children = props.children;
  let resultChildren = "";
  if (Array.isArray(children))
    resultChildren = children.map(String).join("");
  else if (children == null)
    resultChildren = "";
  else
    resultChildren = String(children);
  return `<${tag}${attrs}>${resultChildren}</${tag}>`;
}

/**
 * クライアント用: DOM要素を生成し、onXXX属性をaddEventListenerでバインドする
 * @param tag HTMLタグ名またはFragment
 * @param props 属性＋children
 * @returns HTMLElement | Node[]
 *
 * onClick, onChange等のイベントハンドラはaddEventListenerでバインドされる
 * SSR用途ではなく、クライアントでの動的生成用
 * FragmentはDOM上に存在しない: 子要素を平坦化して返す
 */
export function jsxDom(tag: string | typeof Fragment, props: Record<string, any>): HTMLElement | Node[] {
  // FragmentはDOM上に存在しない: 子要素を平坦化して返す
  if (tag === Fragment) {
    const c = props.children;
    if (Array.isArray(c))
      return c;
    if (c == null)
      return [];
    return [c];
  }
  const el = document.createElement(tag as string);
  for (const key in props) {
    if (key === "children" || props[key] == null)
      continue;
    // onXXX属性はイベントとしてバインド
    if (/^on[A-Z]/.test(key) && typeof props[key] === "function") {
      const event = key.slice(2).toLowerCase();
      el.addEventListener(event, props[key]);
      continue;
    }
    if (props[key] === true) {
      el.setAttribute(key, "");
    }
    else {
      el.setAttribute(key, String(props[key]));
    }
  }
  const children = props.children;
  if (Array.isArray(children)) {
    children.forEach((child) => {
      if (typeof child === "string") {
        el.appendChild(document.createTextNode(child));
      }
      if (typeof child === "number") {
        el.appendChild(document.createTextNode(String(child)));
      }
      else if (child instanceof Node) {
        el.appendChild(child);
      }
    });
  }
  else if (typeof children === "string") {
    el.appendChild(document.createTextNode(children));
  }
  else if (children instanceof Node) {
    el.appendChild(children);
  }
  return el;
}
