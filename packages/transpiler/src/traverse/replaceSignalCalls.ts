import type * as t from "@babel/types";
import type { SignalInfo } from "./types";

/**
 * signal getter/setter呼び出しをそのまま出力する（分割代入が各メソッド先頭に入るため）
 */
export function replaceSignalCalls<T extends t.Node>(node: T, signals: SignalInfo[]): T {
  if (!node)
    return node;
  // 変換不要: signal参照はそのまま
  // 再帰的に子ノードを置換
  for (const key of Object.keys(node)) {
    const value = (node as any)[key];
    if (Array.isArray(value)) {
      (node as any)[key] = value.map((v: any) => (v && typeof v.type === "string") ? replaceSignalCalls(v, signals) : v);
    }
    else if (value && typeof value.type === "string") {
      (node as any)[key] = replaceSignalCalls(value, signals);
    }
  }
  return node;
}
