export type toReactEmits<T extends Record<string, any>> = {
  [K in keyof T as K extends `on-${infer K2}` ? `on${Capitalize<K2>}` : never]: (payload: CustomEvent<T[K]>) => void;
};
