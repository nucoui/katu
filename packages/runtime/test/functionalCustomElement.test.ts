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
    const CustomElement = functionalCustomElement(({ onConnected, render }) => {
      onConnected(() => {
        /* connected callback */
      });
      render(() => DummyJSX());
    }, {});
    const el = new CustomElement();
    expect(el).toBeInstanceOf(HTMLElement);
    expect(typeof el.handleConnected).toBe("function");
    expect("_vnode" in el).toBe(true);
  });

  it("shadowRootオプションが有効でshadowRootが存在する", () => {
    const CustomElement = functionalCustomElement(({ render }) => {
      render(() => DummyJSX());
    }, { shadowRoot: true });
    const el = new CustomElement();
    expect(el.shadowRoot).not.toBeNull();
  });

  it("shadowRootオプションが無効でshadowRootが存在しない", () => {
    const CustomElement = functionalCustomElement(({ render }) => {
      render(() => DummyJSX());
    }, { shadowRoot: false });
    const el = new CustomElement();
    expect(el.shadowRoot).toBeNull();
  });
});
