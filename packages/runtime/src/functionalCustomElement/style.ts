/**
 * スタイルをシャドウルートに適用する関数
 * Function to apply CSS styles to a shadow root
 *
 * @param shadowRoot スタイルを適用するシャドウルート
 * @param css CSSスタイリングを含む文字列
 * @returns 挿入されたスタイル要素
 */
export function applyStyles(shadowRoot: ShadowRoot, css: string): HTMLStyleElement {
  // 既存のスタイル要素を確認
  const existingStyle = shadowRoot.querySelector("style");
  if (existingStyle) {
    // 既存のスタイル要素があれば内容を更新
    existingStyle.textContent = css;
    return existingStyle as HTMLStyleElement;
  }

  // 新しいスタイル要素を作成
  const styleEl = document.createElement("style");
  styleEl.textContent = css;
  shadowRoot.appendChild(styleEl);
  return styleEl;
}
