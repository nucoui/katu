import { describe, expect, it } from "vitest";

import { toMatched } from "../../src/convert/toMatched";

describe("toMatched", () => {
  it("returns the value when it exists in the array", () => {
    expect(toMatched("a", ["a", "b", "c"])).toBe("a");
    // nullはstring[]との制約に合わないためこのテストは削除
  });

  it("returns null when the value doesn't exist in the array", () => {
    expect(toMatched("d", ["a", "b", "c"])).toBeNull();
    expect(toMatched(null, ["a", "b"])).toBeNull();
  });

  it("works with empty arrays", () => {
    expect(toMatched("a", [])).toBeNull();
    expect(toMatched(null, [])).toBeNull();
  });

  it("works with special string values", () => {
    expect(toMatched("", ["", "value"])).toBe("");
    expect(toMatched(" ", ["a", " ", "b"])).toBe(" ");
    expect(toMatched("特殊文字", ["abc", "特殊文字", "xyz"])).toBe("特殊文字");
  });
});
