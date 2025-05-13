/**
 * jsx関数の単体テスト
 * @package
 */
import { describe, expect, it } from "vitest";
import { Fragment, jsx } from "../src/jsx";

describe("jsx", () => {
  it("should render simple tag", () => {
    expect(jsx("div", { children: "foo" })).toBe("<div>foo</div>");
  });
  it("should render with attributes", () => {
    expect(jsx("input", { type: "text", value: "bar" })).toBe("<input type='text' value='bar'></input>");
  });
  it("should escape attribute values", () => {
    expect(jsx("div", { title: "a'b" })).toBe("<div title='a&#39;b'></div>");
  });
  it("should render boolean attributes", () => {
    expect(jsx("input", { disabled: true })).toBe("<input disabled></input>");
  });
  it("should render children array", () => {
    expect(jsx("ul", { children: [jsx("li", { children: "a" }), jsx("li", { children: "b" })] })).toBe("<ul><li>a</li><li>b</li></ul>");
  });
  it("should render Fragment", () => {
    expect(jsx(Fragment, { children: ["a", "b"] })).toBe("ab");
  });
  it("should ignore function props", () => {
    expect(jsx("button", { onClick: () => {}, children: "x" })).toBe("<button>x</button>");
  });
});
