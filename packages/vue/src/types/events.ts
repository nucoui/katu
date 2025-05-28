/**
 * `on-` プレフィックスを取り除いたイベント名の型を生成するユーティリティ型
 *
 * @example
 * ```ts
 * type Emits = "on-click" | "on-hover";
 * type NormalizedEmits = StripOnPrefix<Emits>; // "click" | "hover"
 * ```
 */
export type StripOnPrefix<T extends string> = T extends `on-${infer R}` ? R : never;

/**
 * `on-` プレフィックスを取り除いたイベントハンドラーの型を生成するユーティリティ型
 *
 * @example
 * ```ts
 * type Handlers = {
 *   "on-click": (event: Event) => void;
 *   "on-hover": (event: Event) => void;
 * };
 * type NormalizedHandlers = StripOnPrefixHandlers<Handlers>;
 * // {
 * //   click: (event: Event) => void;
 * //   hover: (event: Event) => void;
 * // }
 * ```
 */
export type StripOnPrefixHandlers<T extends string> = {
  [K in T as StripOnPrefix<K>]: [value: Event];
};
