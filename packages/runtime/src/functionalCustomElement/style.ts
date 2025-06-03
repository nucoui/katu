/**
 * スタイルをシャドウルートに適用する関数
 * Function to apply CSS styles to a shadow root
 *
 * @param shadowRoot スタイルを適用するシャドウルート
 * @param css CSSスタイリングを含む文字列、または文字列の配列
 * @returns 挿入されたスタイル要素
 */
export function applyStyles(shadowRoot: ShadowRoot, css: string | string[]): HTMLStyleElement {
  // 配列を単一の文字列に結合（最適化：配列の場合のみjoinを実行）
  const cssText = Array.isArray(css) ? css.join("\n") : css;

  // 既存のスタイル要素を確認（最適化：querySelectors()より効率的に直接children検索）
  const children = shadowRoot.children;
  for (let i = 0; i < children.length; i++) {
    const child = children[i];
    if (child.tagName === "STYLE") {
      // 既存のスタイル要素があれば内容を更新（内容が変わった場合のみ）
      const styleEl = child as HTMLStyleElement;
      if (styleEl.textContent !== cssText) {
        styleEl.textContent = cssText;
      }
      return styleEl;
    }
  }

  // 新しいスタイル要素を作成
  const styleEl = document.createElement("style");
  styleEl.textContent = cssText;
  shadowRoot.appendChild(styleEl);
  return styleEl;
}
