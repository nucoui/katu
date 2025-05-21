import { describe, expect, it } from "vitest";
import { toString } from "../../src/convert/toString";

describe("toString", () => {
  it("should return null for null input", () => {
    expect(toString(null)).toBe(null);
  });

  it("should return null for empty string", () => {
    expect(toString("")).toBe(null);
  });

  it("should convert non-empty strings to string value", () => {
    expect(toString("hello")).toBe("hello");
    expect(toString("123")).toBe("123");
    expect(toString(" ")).toBe(" ");
  });

  it("should handle special characters", () => {
    expect(toString("hello\nworld")).toBe("hello\nworld");
    expect(toString("special chars: !@#$%^&*()")).toBe("special chars: !@#$%^&*()");
  });
});
