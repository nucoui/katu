/**
 * カスタム要素をテストするためのユーティリティ
 * Utilities for testing custom elements
 *
 * Custom Elements Everywhereのテストをパスするための追加機能を提供
 */

import {
  getEventNameVariations,
  setElementAttributeOrProperty,
} from "./cascade-props";

/**
 * Custom Elements Everywhere テストの互換性のためのインターフェース
 * Interface for Custom Elements Everywhere test compatibility
 */
export interface CustomElementsTestHelper {
  /**
   * カスタム要素をマウントし、テスト用のクリーンアップ関数を返す
   * Mount a custom element and return a cleanup function for testing
   *
   * @param tagName - カスタム要素のタグ名
   * @param attributes - 設定する属性とプロパティ
   * @returns クリーンアップ関数
   */
  mountCustomElement: (
    tagName: string,
    attributes?: Record<string, any>
  ) => { element: HTMLElement; cleanup: () => void };

  /**
   * プロパティを使用して値をカスタム要素に設定する
   * Set a value to a custom element using properties
   *
   * @param element - カスタム要素
   * @param propName - プロパティ名
   * @param value - 設定する値
   */
  setProp: (element: HTMLElement, propName: string, value: any) => void;

  /**
   * カスタム要素にイベントリスナーを追加する
   * Add event listener to custom element
   *
   * @param element - カスタム要素
   * @param eventName - イベント名
   * @param handler - イベントハンドラ関数
   * @returns クリーンアップ関数
   */
  listenToEvent: (
    element: HTMLElement,
    eventName: string,
    handler: EventListenerOrEventListenerObject
  ) => () => void;
}

/**
 * Custom Elements Everywhereのテストをパスするためのテストヘルパーを作成
 * Create a test helper for passing Custom Elements Everywhere tests
 *
 * @returns Custom Elements Everywhereテスト用ヘルパー
 */
export function createCustomElementsTestHelper(): CustomElementsTestHelper {
  const eventCleanups = new WeakMap<HTMLElement, Array<() => void>>();

  return {
    mountCustomElement(tagName, attributes = {}) {
      const element = document.createElement(tagName);

      // 属性とプロパティを設定
      for (const [key, value] of Object.entries(attributes)) {
        setElementAttributeOrProperty(element, key, value);
      }

      const cleanup = () => {
        // イベントリスナーをクリーンアップ
        const cleanupFns = eventCleanups.get(element);
        if (cleanupFns) {
          for (const fn of cleanupFns) {
            fn();
          }
          eventCleanups.delete(element);
        }

        // 要素を削除
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
      };

      return { element, cleanup };
    },

    setProp(element, propName, value) {
      setElementAttributeOrProperty(element, propName, value, true);
    },

    listenToEvent(element, eventName, handler) {
      // 様々な命名規則のイベント名に対応
      const eventVariants = getEventNameVariations(eventName);

      // 全てのイベント名バリアントにリスナーを追加
      for (const variant of eventVariants) {
        element.addEventListener(variant, handler);
      }

      // クリーンアップ関数
      const cleanup = () => {
        for (const variant of eventVariants) {
          element.removeEventListener(variant, handler);
        }
      };

      // クリーンアップ関数を保存
      if (!eventCleanups.has(element)) {
        eventCleanups.set(element, []);
      }
      eventCleanups.get(element)!.push(cleanup);

      return cleanup;
    },
  };
}
