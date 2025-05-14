/**
 * functionalCustomElement のテスト
 *
 * JSX/TSXでWeb ComponentsのCustom Element Classを生成するファクトリ関数のテストです。
 * Test for functionalCustomElement factory function for Web Components Custom Element Class using JSX/TSX.
 */
import { describe, expect, it } from "vitest";
import { functionalCustomElement } from "../src/functionalCustomElement";

// ダミーのKatuJSXElementを返す
const DummyJSX = (): import("../types/JSX.namespace").KatuJSXElement => ({
  tag: "div",
  props: {},
});

describe("functionalCustomElement", () => {
  it("customElementクラスを生成できる", () => {
    const tagName = "x-test-el1";
    const CustomElement = functionalCustomElement(({ onConnected, render }) => {
      onConnected(() => {
        /* connected callback */
      });
      render(() => DummyJSX());
    }, {});
    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);
    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    expect(el).toBeInstanceOf(HTMLElement);
    expect(typeof el.handleConnected).toBe("function");
    expect("_vnode" in el).toBe(true);
  });

  it("shadowRootオプションが有効でshadowRootが存在する", () => {
    const tagName = "x-test-el2";
    const CustomElement = functionalCustomElement(({ render }) => {
      render(() => DummyJSX());
    }, { shadowRoot: true });
    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);
    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    document.body.appendChild(el); // connectedCallbackを発火させる
    expect(el.shadowRoot).not.toBeNull();
  });

  it("shadowRootオプションが無効でshadowRootが存在しない", () => {
    const tagName = "x-test-el3";
    const CustomElement = functionalCustomElement(({ render }) => {
      render(() => DummyJSX());
    }, { shadowRoot: false });
    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);
    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    expect(el.shadowRoot).toBeNull();
  });

  it("propsに全ての属性が含まれる", () => {
    const tagName = "x-test-el4";
    const CustomElement = functionalCustomElement(() => {
      // テスト用にpropsを返すだけのダミー
      return {};
    }, {});
    if (!customElements.get(tagName))
      customElements.define(tagName, CustomElement);
    const el = document.createElement(tagName) as InstanceType<typeof CustomElement>;
    el.setAttribute("foo", "bar");
    el.setAttribute("baz", "qux");
    // propsが属性を正しく含むか確認
    const props = Object.fromEntries(
      Array.from(el.getAttributeNames()).map(attr => [attr, el.getAttribute(attr)]),
    );
    expect(props).toEqual({ foo: "bar", baz: "qux" });
  });
});
