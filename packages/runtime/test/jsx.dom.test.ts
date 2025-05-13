import { describe, expect, it, vi } from "vitest";
import { Fragment, jsxDom } from "../src/jsx";
import "vitest/browser";
/**
 * jsxDom関数の単体テスト
 * @package
 */

describe("jsxDom", () => {
  it("should create simple element", () => {
    const el = jsxDom("div", { children: "foo" });
    expect(el instanceof HTMLElement).toBe(true);
    expect((el as HTMLElement).tagName.toLowerCase()).toBe("div");
    expect((el as HTMLElement).textContent).toBe("foo");
  });
  it("should set attributes", () => {
    const el = jsxDom("input", { type: "text", value: "bar" });
    expect(el instanceof HTMLElement).toBe(true);
    expect((el as HTMLElement).getAttribute("type")).toBe("text");
    expect((el as HTMLElement).getAttribute("value")).toBe("bar");
  });
  it("should add event listener for onClick", () => {
    const handler = vi.fn();
    const el = jsxDom("button", { onClick: handler, children: "x" });
    expect(el instanceof HTMLElement).toBe(true);
    (el as HTMLElement).dispatchEvent(new MouseEvent("click"));
    expect(handler).toHaveBeenCalled();
  });
  it("should add event listener for onChange", () => {
    const handler = vi.fn();
    const el = jsxDom("input", { onChange: handler });
    expect(el instanceof HTMLElement).toBe(true);
    (el as HTMLElement).dispatchEvent(new Event("change"));
    expect(handler).toHaveBeenCalled();
  });
  it("should support Fragment", () => {
    const frag = jsxDom(Fragment, { children: [document.createTextNode("a"), document.createTextNode("b")] });
    expect(Array.isArray(frag)).toBe(true);
    expect((frag as Node[]).length).toBe(2);
    expect((frag as Node[])[0].textContent).toBe("a");
    expect((frag as Node[])[1].textContent).toBe("b");
  });
});
