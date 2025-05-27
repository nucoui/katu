export type DefineProps<T> = {
  [K in keyof T]: T[K] extends string | number | boolean
    ? (v: string | null) => T[K]
    : T[K];
};
