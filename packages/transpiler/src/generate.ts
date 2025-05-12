import type { traverse } from "@/traverse";
import _generator from "@babel/generator";

const babelGenerate = _generator.default;

const generate = (traverseResult: ReturnType<typeof traverse>): string => {
  return babelGenerate(traverseResult).code;
};

export { generate };
