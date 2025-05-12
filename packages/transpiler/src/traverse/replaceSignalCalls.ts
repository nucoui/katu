import type * as t from "@babel/types";
import type { SignalInfo } from "./types";
import * as babelTypes from "@babel/types";

/**
 * signal getter/setter呼び出しをthis.#signal[0/1]に置換する純粋再帰関数
 */
export function replaceSignalCalls<T extends t.Node>(node: T, signals: SignalInfo[]): T {
  if (!node)
    return node;
  // getter: time()
  if (
    node.type === "CallExpression"
    && node.callee.type === "Identifier"
    && signals.some(s => s.name === (node.callee as t.Identifier).name)
  ) {
    const sig = signals.find(s => s.name === (node.callee as t.Identifier).name)!;
    return babelTypes.callExpression(
      babelTypes.memberExpression(
        babelTypes.memberExpression(
          babelTypes.thisExpression(),
          babelTypes.privateName(babelTypes.identifier(sig.name)),
        ),
        babelTypes.numericLiteral(0),
        true,
      ),
      node.arguments.map(arg => replaceSignalCalls(arg, signals)),
    ) as T;
  }
  // setter: setTime(...)
  if (
    node.type === "CallExpression"
    && node.callee.type === "Identifier"
    && signals.some(s => s.setter === (node.callee as t.Identifier).name)
  ) {
    const sig = signals.find(s => s.setter === (node.callee as t.Identifier).name)!;
    return babelTypes.callExpression(
      babelTypes.memberExpression(
        babelTypes.memberExpression(
          babelTypes.thisExpression(),
          babelTypes.privateName(babelTypes.identifier(sig.name)),
        ),
        babelTypes.numericLiteral(1),
        true,
      ),
      node.arguments.map(arg => replaceSignalCalls(arg, signals)),
    ) as T;
  }
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
