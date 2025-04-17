import { describe, expect, it } from "vitest";
import { computed, effect, signal } from "../src/main";

describe("custom Reactive API", () => {
  it("signal should hold and update values", () => {
    const [count, setCount] = signal(1);
    expect(count()).toBe(1);

    setCount(2);
    expect(count()).toBe(2);
  });

  it("computed should derive values reactively", () => {
    const [count, setCount] = signal(1);
    const doubleCount = computed(() => count() * 2);

    expect(doubleCount()).toBe(2);

    setCount(3);
    expect(doubleCount()).toBe(6);
  });

  it("effect should react to signal changes", () => {
    const [count, setCount] = signal(1);
    let log = 0;

    effect(() => {
      log = count();
    });

    expect(log).toBe(1);

    setCount(5);
    expect(log).toBe(5);
  });
});
