import { describe, expect, it } from "vitest";
import { toLiteral } from "../../src/convert/toLiteral";

describe("toLiteral", () => {
  it("should handle primitive values", () => {
    expect(toLiteral(123)).toBe("123");
    expect(toLiteral("hello")).toBe("\"hello\"");
    expect(toLiteral(true)).toBe("true");
    expect(toLiteral(false)).toBe("false");
    expect(toLiteral(null)).toBe("null");
    expect(toLiteral(undefined)).toBe("undefined");
  });

  it("should handle special strings", () => {
    expect(toLiteral("hello \"world\"")).toBe("\"hello \\\"world\\\"\"");
  });

  it("should handle BigInt", () => {
    expect(toLiteral(BigInt(123))).toBe("123n");
  });

  it("should handle Symbol", () => {
    expect(toLiteral(Symbol("test"))).toBe("Symbol(\"test\")");
    expect(toLiteral(Symbol("empty"))).toBe("Symbol(\"empty\")");
  });

  it("should handle arrays", () => {
    expect(toLiteral([1, "two", true])).toBe("[1, \"two\", true]");
    expect(toLiteral([1, [2, 3], { a: 4 }])).toBe("[1, [2, 3], {a: 4}]");
  });

  it("should handle objects", () => {
    expect(toLiteral({ a: 1, b: "two" })).toBe("{a: 1, b: \"two\"}");
    expect(toLiteral({ "special-key": 1 })).toBe("{\"special-key\": 1}");
    expect(toLiteral({ nested: { a: 1 } })).toBe("{nested: {a: 1}}");
  });
});
