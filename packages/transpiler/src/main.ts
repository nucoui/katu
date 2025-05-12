import { generate } from "@/generate";
import { parse } from "@/parser";
import { traverse } from "@/traverse";

const transpile = (code: string): string => {
  const ast = parse(code);
  const traversed = traverse(ast);
  const transformedCode = generate(traversed);

  return transformedCode;
};

export {
  generate,
  parse,
  transpile,
  traverse,
};
