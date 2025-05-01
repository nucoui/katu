import { generate } from "@/generate";
import { parse } from "@/parser";
import { traverse } from "@/traverse.js";

const transpile = async (code: string): Promise<string> => {
  const ast = parse(code);
  const traversed = await traverse(ast);

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
