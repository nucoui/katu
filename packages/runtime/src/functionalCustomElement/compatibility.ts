/**
 * Custom Elements Everywhereとの互換性を確保するためのテスト用アダプタファイル
 * Test adapter file to ensure compatibility with Custom Elements Everywhere
 */

import type { CustomElementsTestHelper } from "./test-helpers";
import {
  extractEventHandlers,
  getEventNameFromAttribute,
  getEventNameVariations,
  hasDefinedProperty,
  setElementAttributeOrProperty,
} from "./cascade-props";

import {
  createReactiveProperty,
  type PropReflectionConfig,
  type PropReflections,
  reflectProperties,
  reflectProperty,
} from "./prop-reflection";

import { createCustomElementsTestHelper } from "./test-helpers";

/**
 * カスタム要素の互換性テストのためのセットアップ関数
 * Setup function for custom element compatibility testing
 */
export function setupCustomElementsTest(): CustomElementsTestHelper {
  return createCustomElementsTestHelper();
}

// 型をエクスポート
export type {
  CustomElementsTestHelper,
  PropReflectionConfig,
  PropReflections,
};

// ユーティリティ関数をエクスポート
export {
  // プロパティリフレクション関連
  createReactiveProperty,
  // カスケードプロパティ関連
  extractEventHandlers,
  getEventNameFromAttribute,
  getEventNameVariations,
  hasDefinedProperty,

  reflectProperties,
  reflectProperty,
  setElementAttributeOrProperty,
};
