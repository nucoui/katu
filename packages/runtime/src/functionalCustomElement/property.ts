/**
 * カスタム要素のプロパティ管理機能
 * Property management functionality for custom elements
 */

/**
 * プロパティ値を保持するためのWeakMapオブジェクト
 * WeakMap to hold property values per element instance
 */
const elementProperties = new WeakMap<HTMLElement, Map<string, any>>();

/**
 * 要素にプロパティを設定する
 * Set a property on an element
 *
 * @param element - ターゲット要素
 * @param key - プロパティ名
 * @param value - プロパティ値
 */
export function setElementProperty(element: HTMLElement, key: string, value: any): void {
  if (!elementProperties.has(element)) {
    elementProperties.set(element, new Map());
  }

  // 要素のプロパティマップを取得
  const properties = elementProperties.get(element)!;

  // プロパティを設定
  // プリミティブ値以外の場合（オブジェクトや配列）は、直接参照を保存
  properties.set(key, value);

  // 要素自身にもプロパティを設定（可能であれば）
  try {
    // 既存のプロパティやメソッドの上書きを避けるため、使用前にチェック
    const descriptor = Object.getOwnPropertyDescriptor(element, key);
    if (!descriptor || descriptor.configurable) {
      Object.defineProperty(element, key, {
        configurable: true,
        get() {
          return properties.get(key);
        },
        set(newValue) {
          setElementProperty(element, key, newValue);
        },
      });
    }
  }
  catch (e) {
    // プロパティ設定に失敗した場合は、内部マップに保存するだけにする
    console.warn(`Failed to define property ${key} on element:`, e);
  }
}

/**
 * 要素からプロパティ値を取得する
 * Get a property value from an element
 *
 * @param element - ターゲット要素
 * @param key - プロパティ名
 * @param defaultValue - プロパティが存在しない場合のデフォルト値
 * @returns プロパティ値
 */
export function getElementProperty(element: HTMLElement, key: string, defaultValue?: any): any {
  const properties = elementProperties.get(element);
  if (!properties || !properties.has(key)) {
    return defaultValue;
  }
  return properties.get(key);
}

/**
 * 要素がプロパティを持っているかチェックする
 * Check if an element has a property
 *
 * @param element - ターゲット要素
 * @param key - プロパティ名
 * @returns プロパティが存在する場合はtrue
 */
export function hasElementProperty(element: HTMLElement, key: string): boolean {
  const properties = elementProperties.get(element);
  return !!properties && properties.has(key);
}

/**
 * 要素からプロパティを削除する
 * Remove a property from an element
 *
 * @param element - ターゲット要素
 * @param key - プロパティ名
 */
export function removeElementProperty(element: HTMLElement, key: string): void {
  const properties = elementProperties.get(element);
  if (properties) {
    properties.delete(key);

    // 要素自身からもプロパティを削除（可能であれば）
    try {
      delete (element as any)[key];
    }
    catch {
      // プロパティ削除に失敗した場合は、内部マップからの削除のみ実施
    }
  }
}

/**
 * プロパティが値と一致するかチェックする
 * Check if a property matches a value
 *
 * @param element - ターゲット要素
 * @param key - プロパティ名
 * @param value - チェックする値
 * @returns 値が一致する場合はtrue
 */
export function propertyEquals(element: HTMLElement, key: string, value: any): boolean {
  return getElementProperty(element, key) === value;
}
