/**
 * Converts an object type with `on-xxx` keys and payload types
 * to a Vue-style emits type with event names and tuple payloads.
 *
 * Example:
 *   type Emits = {
 *     "on-click": { count: number };
 *     "on-event": { type: string; detail: { count: number } };
 *   }
 *   type VueEmits = ToVueEmits<Emits>;
 *   // VueEmits is:
 *   // {
 *   //   click: [{ count: number }];
 *   //   event: [{ type: string; detail: { count: number } }];
 *   // }
 *
 * @template T - The original emits type with `on-xxx` keys.
 */
export type ToVueEmits<T> = {
  [K in keyof T]: [T[K]]
};
