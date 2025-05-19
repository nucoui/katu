/**
 * スタイルサポート機能のテスト
 * Tests for style support functionality
 */
import { describe, expect, it } from "vitest";
import { functionalCustomElement } from "../src/functionalCustomElement";
import { applyStyles } from "../src/functionalCustomElement/style";

// ダミーのToraJSXElementを返す
const DummyJSX = (): import("../types/JSX.namespace").ToraJSXElement => ({
  tag: "div",
  props: {},
});

describe("style Support", () => {
  it("applyStylesがスタイル要素を適用できる", () => {
    const root = document.createElement("div");
    const shadow = root.attachShadow({ mode: "open" });
    const styleEl = applyStyles(shadow, "div { color: red; }");

    expect(styleEl).toBeInstanceOf(HTMLStyleElement);
    expect(styleEl.textContent).toBe("div { color: red; }");
    expect(shadow.childNodes[0]).toBe(styleEl);
  });

  it("functionalCustomElementにスタイルプロパティを渡せる", () => {
    const tagName = "x-styled-element";
    const css = "div { color: blue; }";

    const CustomElement = functionalCustomElement(({ render, onConnected }) => {
      onConnected(() => {
        // 接続時の処理
      });
      render(() => DummyJSX());
    }, { shadowRoot: true, style: css });

    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);

    const el = document.createElement(tagName) as HTMLElement;
    document.body.appendChild(el); // connectedCallbackを発火させる

    expect(el.shadowRoot).not.toBeNull();

    // スタイルが適用されているか確認（style要素）
    const hasStyle = el.shadowRoot!.querySelector("style") !== null;
    expect(hasStyle).toBe(true);

    // レンダリングコンテナが作成されていることを確認 (DIV要素がある)
    const renderContainer = el.shadowRoot!.querySelector("div");
    expect(renderContainer).not.toBeNull();

    document.body.removeChild(el);
  });
});
