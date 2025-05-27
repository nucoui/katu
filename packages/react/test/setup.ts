import { cleanup } from "@testing-library/react";
import React from "react";
import { afterEach } from "vitest";
import "@testing-library/jest-dom/vitest";

// グローバルにReactを設定
globalThis.React = React;

// テスト毎に自動クリーンアップ
afterEach(() => {
  cleanup();
});
