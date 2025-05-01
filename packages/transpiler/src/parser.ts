import { parse as babelParse } from "@babel/parser";

const parse = (code: string) => {
  return babelParse(code, {
    sourceType: "module",
    plugins: [
      "jsx",
      "typescript",
      "decorators-legacy",
      "classProperties",
      "classPrivateProperties",
      "classPrivateMethods",
      "optionalChaining",
      "nullishCoalescingOperator",
    ],
  });
};

export { parse };
