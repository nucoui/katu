/**
 * @file jsx-runtimeのイベントバインド検証用テスト
 * イベントハンドラがaddEventListenerでバインドされているか確認する
 */
import { describe, expect, it, vi } from "vitest";
import { jsxDom } from "../src/jsx-runtime";

describe("jsx-runtime event binding", () => {
  it("should bind event handler via addEventListener", () => {
    const onClick = vi.fn();
    const el = jsxDom("button", { onClick, children: "click" }) as HTMLButtonElement;
    document.body.appendChild(el);
    el.click();
    expect(onClick).toHaveBeenCalled();
    document.body.removeChild(el);
  });

  it("should show event in devtool via onxxx property", () => {
    const onClick = vi.fn();
    const el = jsxDom("button", { onClick, children: "click" }) as HTMLButtonElement;
    expect(typeof (el as any).onclick).toBe("function");
  });
});
