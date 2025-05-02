import { generate } from "@/generate";
import { parse } from "@/parser";
import { traverse } from "@/traverse";

const transpile = (code: string): string => {
  const ast = parse(code);
  const traversed = traverse(ast);

  // defineCustomElement のみを変換し、それ以外のコードを保持
  const transformedCode = generate(traversed);

  return transformedCode;
};

export {
  generate,
  parse,
  transpile,
  traverse,
};
