/**
 * カスケード式プロパティの処理機能
 * Cascade property processing functionality
 *
 * これにより、Custom Elements EverywhereのテストケースをパスするためのWeb Componentとフレームワーク間の
 * データ受け渡しの互換性を向上させる
 */

import { setElementProperty } from "./property";

/**
 * 要素がプロパティを定義/実装しているか確認する
 * Check if an element has a property defined/implemented
 *
 * @param element - 対象の要素
 * @param propName - 確認するプロパティ名
 * @returns プロパティが実装されているか
 */
export function hasDefinedProperty(element: HTMLElement, propName: string): boolean {
  // プロパティがプロトタイプチェーンに存在するか確認
  let proto = Object.getPrototypeOf(element);
  while (proto && proto !== Object.prototype) {
    if (Object.prototype.hasOwnProperty.call(proto, propName)) {
      return true;
    }
    proto = Object.getPrototypeOf(proto);
  }

  // インスタンスのプロパティとして存在するか確認
  return propName in element;
}

/**
 * 要素の属性とプロパティを適切に設定する
 * Set attributes and properties appropriately based on element capabilities
 *
 * @param element - 対象の要素
 * @param propName - プロパティ/属性名
 * @param value - 設定する値
 * @param forceProperty - 強制的にプロパティとして設定するかどうか
 */
export function setElementAttributeOrProperty(
  element: HTMLElement,
  propName: string,
  value: any,
  forceProperty = false,
): void {
  // 値がnullの場合は属性を削除
  if (value === null || value === undefined) {
    element.removeAttribute(propName);
    return;
  }

  // プロパティとして設定すべきケース:
  // 1. forcePropertyフラグが設定されている場合
  // 2. 複雑なデータ型(オブジェクト/配列)の場合
  // 3. 要素がそのプロパティを既に持っている場合
  const isComplexType = typeof value === "object" && value !== null;
  const shouldUseProperty = forceProperty
    || isComplexType
    || hasDefinedProperty(element, propName);

  if (shouldUseProperty) {
    setElementProperty(element, propName, value);
  }
  else if (typeof value === "boolean") {
    // boolean属性の場合: trueなら空属性を設定、falseなら削除
    value ? element.setAttribute(propName, "") : element.removeAttribute(propName);
  }
  else {
    // その他の場合は文字列に変換して属性として設定
    element.setAttribute(propName, String(value));
  }
}

/**
 * 大文字小文字を維持した属性名からイベント名を取得する
 * Get event name from attribute name while preserving case sensitivity
 *
 * @param attributeName - 属性名(例: onMyCustomEvent)
 * @returns イベント名(例: myCustomEvent)
 */
export function getEventNameFromAttribute(attributeName: string): string {
  if (!attributeName.startsWith("on"))
    return attributeName;

  // onから始まる属性名から先頭の'on'を削除して先頭を小文字に
  const withoutPrefix = attributeName.substring(2);
  return withoutPrefix.charAt(0).toLowerCase() + withoutPrefix.substring(1);
}

/**
 * プロパティからイベントハンドラを抽出する
 * Extract event handlers from properties
 *
 * @param props - プロパティオブジェクト
 * @returns イベント名とハンドラ関数のマップ
 */
export function extractEventHandlers(props: Record<string, any>): Map<string, EventListenerOrEventListenerObject> {
  const eventRegex = /^on[A-Z]/;
  const handlers = new Map<string, EventListenerOrEventListenerObject>();

  for (const [key, value] of Object.entries(props)) {
    if (eventRegex.test(key) && typeof value === "function") {
      // onClickなどの名前から'onClick' -> 'click' への変換
      const eventName = getEventNameFromAttribute(key);
      handlers.set(eventName, value as EventListenerOrEventListenerObject);
    }
  }

  return handlers;
}

/**
 * 異なる命名規則のイベント名に対応する
 * Handle event names with different naming conventions
 *
 * @param eventName - 元のイベント名
 * @returns 異なる命名規則で表されたイベント名の配列
 */
export function getEventNameVariations(eventName: string): string[] {
  // 既に小文字の場合はそのまま
  if (eventName === eventName.toLowerCase()) {
    return [eventName];
  }

  // kebab-caseへの変換 (myEvent -> my-event)
  const kebabCase = eventName.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();

  // 小文字への変換
  const lowerCase = eventName.toLowerCase();

  // イベント名のバリエーション (元のケースも含む)
  return [eventName, kebabCase, lowerCase];
}
