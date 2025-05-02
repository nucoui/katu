import type * as t from "@babel/types";
import _generator from "@babel/generator";
import { processJSXElement } from "./traverse"; // JSX要素の処理関数をインポート

const babelGenerate = _generator.default;

/**
 * JSXのASTを基にWeb Componentsのコードを生成します。
 * @param traverseResult - traverseASTで収集した情報
 * @param traverseResult.className - 生成するクラスの名前
 * @param traverseResult.elements - JSX要素のリスト
 * @param traverseResult.options - defineCustomElementのオプション
 * @param traverseResult.orderedNodes - コードの順序を保持するためのノードのリスト
 * @returns 生成されたWeb Componentsのコード
 */
// 修正: traverseResult.elementsの型に合わせて処理を変更
const generate = (
  traverseResult: { className: string; elements: { statements: t.Statement[]; elements: t.JSXElement[] }[]; options: Record<string, any>; orderedNodes: { type: "defineCustomElement" | "customElementsDefine" | "other"; node: t.Statement }[] },
): string => {
  const generatedCode: string[] = [];

  traverseResult.orderedNodes.forEach(({ type, node }) => {
    if (type === "defineCustomElement") {
      if (traverseResult.className) {
        const classBody: t.ClassBody = {
          type: "ClassBody",
          body: [
            {
              type: "ClassMethod",
              key: { type: "Identifier", name: "constructor" },
              kind: "constructor",
              static: false,
              computed: false,
              generator: false,
              async: false,
              params: [],
              body: {
                type: "BlockStatement",
                body: [
                  {
                    type: "ExpressionStatement",
                    expression: {
                      type: "CallExpression",
                      callee: { type: "Super" },
                      arguments: [],
                    },
                  },
                ],
                directives: [],
              },
            },
            {
              type: "ClassMethod",
              key: { type: "Identifier", name: "connectedCallback" },
              kind: "method",
              static: false,
              computed: false,
              generator: false,
              async: false,
              params: [],
              body: {
                type: "BlockStatement",
                body: [
                  {
                    type: "ExpressionStatement",
                    expression: {
                      type: "CallExpression",
                      callee: {
                        type: "MemberExpression",
                        object: { type: "ThisExpression" },
                        property: { type: "Identifier", name: "render" },
                        computed: false,
                      },
                      arguments: [],
                    },
                  },
                ],
                directives: [],
              },
            },
            {
              type: "ClassMethod",
              key: { type: "Identifier", name: "render" },
              kind: "method",
              static: false,
              computed: false,
              generator: false,
              async: false,
              params: [],
              body: {
                type: "BlockStatement",
                body: [
                  {
                    type: "VariableDeclaration",
                    kind: "const",
                    declarations: [
                      {
                        type: "VariableDeclarator",
                        id: { type: "Identifier", name: "shadow" },
                        init: {
                          type: "CallExpression",
                          callee: {
                            type: "MemberExpression",
                            object: { type: "ThisExpression" },
                            property: { type: "Identifier", name: "attachShadow" },
                            computed: false,
                          },
                          arguments: [
                            {
                              type: "ObjectExpression",
                              properties: [
                                {
                                  type: "ObjectProperty",
                                  key: { type: "Identifier", name: "mode" },
                                  value: { type: "StringLiteral", value: traverseResult.options.shadowRootMode || "open" },
                                  computed: false,
                                  shorthand: false,
                                },
                              ],
                            },
                          ],
                        },
                      },
                    ],
                  },
                  ...traverseResult.elements.flatMap((element) => element.statements),
                ],
                directives: [],
              },
            },
          ],
        };

        const classDeclaration: t.ClassDeclaration = {
          type: "ClassDeclaration",
          id: { type: "Identifier", name: traverseResult.className },
          superClass: { type: "Identifier", name: "HTMLElement" },
          body: classBody,
        };

        const program: t.Program = {
          type: "Program",
          sourceType: "module",
          body: [classDeclaration],
          directives: [],
        };

        generatedCode.push(babelGenerate(program).code);
      }
    } else {
      const { code } = babelGenerate(node, { retainLines: true });
      generatedCode.push(code);
    }
  });

  return generatedCode.join("\n");
};

export { generate };
