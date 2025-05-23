/**
 * プロパティと属性のリフレクションを実装する
 * Implement property-attribute reflection for custom elements
 *
 * Custom Elements Everywhereのテストに対応するために、
 * プロパティの変更を属性に、属性の変更をプロパティに反映させる機能を提供
 */

import type { Signal } from "@chatora/reactivity";
import { getElementProperty, setElementProperty } from "./property";

/**
 * プロパティと属性をリフレクションする設定
 * Configuration for property-attribute reflection
 */
export interface PropReflectionConfig {
  /**
   * 属性名 (キャメルケースのプロパティ名からケバブケースに変換されます)
   */
  attr?: string;

  /**
   * プロパティの型
   */
  type?: BooleanConstructor | StringConstructor | NumberConstructor | ObjectConstructor | ArrayConstructor;

  /**
   * 属性からプロパティに変換する関数
   */
  fromAttr?: (value: string | null) => any;

  /**
   * プロパティから属性に変換する関数
   */
  toAttr?: (value: any) => string | null;

  /**
   * 属性の変更を監視するかどうか
   */
  reflect?: boolean;
}

/**
 * プロパティと属性のリフレクション定義
 */
export type PropReflections = Record<string, PropReflectionConfig>;

/**
 * キャメルケースをケバブケースに変換する
 */
function camelToKebab(str: string): string {
  return str.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
}

/**
 * 属性値をプロパティの型に変換する
 */
function convertAttributeValue(value: string | null, config: PropReflectionConfig): any {
  if (value === null) {
    return null;
  }

  // カスタム変換関数がある場合はそれを使用
  if (config.fromAttr) {
    return config.fromAttr(value);
  }

  // 型に応じて変換
  if (config.type === Boolean) {
    return value !== "false" && value !== null;
  }
  else if (config.type === Number) {
    return Number(value);
  }
  else if (config.type === Object || config.type === Array) {
    try {
      return JSON.parse(value);
    }
    catch {
      console.warn("Failed to parse attribute as JSON:", value);
      return null;
    }
  }

  // デフォルトは文字列
  return value;
}

/**
 * プロパティ値を属性値に変換する
 */
function convertPropertyValue(value: any, config: PropReflectionConfig): string | null {
  if (value === null || value === undefined) {
    return null;
  }

  // カスタム変換関数がある場合はそれを使用
  if (config.toAttr) {
    return config.toAttr(value);
  }

  // 型に応じて変換
  if (config.type === Boolean) {
    return value ? "" : null;
  }
  else if (config.type === Object || config.type === Array) {
    try {
      return JSON.stringify(value);
    }
    catch {
      console.warn("Failed to stringify property as JSON:", value);
      return null;
    }
  }

  // デフォルトは文字列化
  return String(value);
}

/**
 * プロパティと属性のリフレクションを設定する
 *
 * @param element - カスタム要素
 * @param propName - プロパティ名
 * @param config - リフレクション設定
 * @param initialValue - 初期値
 * @returns プロパティのgetter/setter
 */
export function reflectProperty(
  element: HTMLElement,
  propName: string,
  config: PropReflectionConfig = {},
  initialValue?: any,
): [() => any, (value: any) => void] {
  // 属性名の決定（指定されていない場合はキャメルケースからケバブケースに変換）
  const attrName = config.attr || camelToKebab(propName);

  // 既存の値を取得または初期値を設定
  let value = getElementProperty(element, propName, initialValue);

  // プロパティのgetter
  const getValue = () => value;

  // プロパティのsetter
  const setValue = (newValue: any) => {
    // 値が変わらない場合は何もしない
    if (value === newValue)
      return;

    // 値を更新
    value = newValue;
    setElementProperty(element, propName, newValue);

    // リフレクションが有効な場合、属性も更新
    if (config.reflect !== false) {
      const attrValue = convertPropertyValue(newValue, config);

      if (attrValue === null) {
        element.removeAttribute(attrName);
      }
      else {
        element.setAttribute(attrName, attrValue);
      }
    }
  };

  // 属性の変更を監視
  const observeAttribute = (mutations: MutationRecord[]) => {
    for (const mutation of mutations) {
      if (mutation.type === "attributes" && mutation.attributeName === attrName) {
        const newAttrValue = element.getAttribute(attrName);
        const newPropValue = convertAttributeValue(newAttrValue, config);

        // 値が変わった場合のみ更新（無限ループを防止）
        if (value !== newPropValue) {
          value = newPropValue;
          setElementProperty(element, propName, newPropValue);
        }
      }
    }
  };

  // MutationObserverを設定
  const observer = new MutationObserver(observeAttribute);
  observer.observe(element, {
    attributes: true,
    attributeFilter: [attrName],
  });

  return [getValue, setValue];
}

/**
 * 複数のプロパティのリフレクションを設定する
 *
 * @param element - カスタム要素
 * @param reflections - リフレクション設定オブジェクト
 * @param initialValues - 初期値オブジェクト
 * @returns プロパティのgetter/setterオブジェクト
 */
export function reflectProperties(
  element: HTMLElement,
  reflections: PropReflections,
  initialValues: Record<string, any> = {},
): Record<string, [() => any, (value: any) => void]> {
  const result: Record<string, [() => any, (value: any) => void]> = {};

  for (const [propName, config] of Object.entries(reflections)) {
    result[propName] = reflectProperty(
      element,
      propName,
      config,
      initialValues[propName],
    );
  }

  return result;
}

/**
 * リアクティブなプロパティを作成する
 *
 * @param element - カスタム要素
 * @param signal - シグナル関数
 * @param propName - プロパティ名
 * @param config - リフレクション設定
 * @param initialValue - 初期値
 * @returns プロパティのシグナル
 */
export function createReactiveProperty<T>(
  element: HTMLElement,
  signal: <V>(initialValue: V) => Signal<V>,
  propName: string,
  config: PropReflectionConfig = {},
  initialValue?: T,
): Signal<T> {
  // 属性名の決定（指定されていない場合はキャメルケースからケバブケースに変換）
  const attrName = config.attr || camelToKebab(propName);

  // 属性値から初期値を取得
  const attrValue = element.getAttribute(attrName);
  if (attrValue !== null && initialValue === undefined) {
    initialValue = convertAttributeValue(attrValue, config) as T;
  }

  // シグナルを作成
  const [getValue, setValue] = signal<T>(initialValue as T);

  // プロパティを要素に設定
  Object.defineProperty(element, propName, {
    get: getValue,
    set(newValue: T) {
      setValue(newValue);
    },
    configurable: true,
    enumerable: true,
  });

  // リフレクションが有効な場合、属性の変更を監視
  if (config.reflect !== false) {
    // 値の変更を属性に反映
    const updateAttribute = () => {
      const value = getValue();
      const attrValue = convertPropertyValue(value, config);

      if (attrValue === null) {
        element.removeAttribute(attrName);
      }
      else {
        element.setAttribute(attrName, attrValue);
      }
    };

    // 属性の変更をプロパティに反映
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.type === "attributes" && mutation.attributeName === attrName) {
          const newAttrValue = element.getAttribute(attrName);
          const newPropValue = convertAttributeValue(newAttrValue, config) as T;

          // 現在の値と異なる場合のみ更新（無限ループを防止）
          if (getValue() !== newPropValue) {
            setValue(newPropValue);
          }
        }
      }
    });

    // 初期属性値の設定
    updateAttribute();

    // 属性の監視を開始
    observer.observe(element, {
      attributes: true,
      attributeFilter: [attrName],
    });

    // 値の変更時に属性も更新
    const originalSetValue = setValue;
    const newSetValue = ((newValue: T | ((prev: T) => T)) => {
      const result = originalSetValue(newValue);
      updateAttribute();
      return result;
    }) as typeof setValue;

    return [getValue, newSetValue];
  }

  return [getValue, setValue];
}
