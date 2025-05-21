import { describe, expect, it } from "vitest";
import { toBoolean } from "../../src/convert/toBoolean";

describe("toBoolean", () => {
  it("should convert empty string to true", () => {
    expect(toBoolean("")).toBe(true);
  });

  it("should convert 'true' string to true", () => {
    expect(toBoolean("true")).toBe(true);
  });

  it("should convert 'false' string to false", () => {
    expect(toBoolean("false")).toBe(false);
  });

  it("should convert null to false", () => {
    expect(toBoolean(null)).toBe(false);
  });

  it("should return null for other string values", () => {
    expect(toBoolean("yes")).toBe(null);
    expect(toBoolean("no")).toBe(null);
    expect(toBoolean("1")).toBe(null);
    expect(toBoolean("0")).toBe(null);
    expect(toBoolean("random text")).toBe(null);
  });
});
