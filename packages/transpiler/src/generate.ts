import type * as t from "@babel/types";
import _generator from "@babel/generator";

const babelGenerate = _generator.default;

/**
 * JSX要素を再帰的に処理してWeb Componentsのコードを生成します。
 * @param jsxElement - 処理するJSX要素
 * @param parentVar - 親要素の変数名
 * @param elementCounter - 要素のカウンターオブジェクト
 * @param elementCounter.count - 現在の要素のカウント値
 * @returns 生成されたコードのASTノード
 */
function processJSXElement(jsxElement: t.JSXElement, parentVar: string, elementCounter: { count: number }): t.Statement[] {
  const statements: t.Statement[] = [];
  const elementVar = `el${elementCounter.count++}`;

  // 要素の作成
  statements.push({
    type: "VariableDeclaration",
    kind: "const",
    declarations: [
      {
        type: "VariableDeclarator",
        id: { type: "Identifier", name: elementVar },
        init: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            object: { type: "Identifier", name: "document" },
            property: { type: "Identifier", name: "createElement" },
            computed: false,
          },
          arguments: [
            { type: "StringLiteral", value: (jsxElement.openingElement.name as t.JSXIdentifier).name },
          ],
        },
      },
    ],
  });

  // 属性の設定
  jsxElement.openingElement.attributes.forEach((attr) => {
    if (attr.type === "JSXAttribute" && attr.name.type === "JSXIdentifier") {
      statements.push({
        type: "ExpressionStatement",
        expression: {
          type: "CallExpression",
          callee: {
            type: "MemberExpression",
            object: { type: "Identifier", name: elementVar },
            property: { type: "Identifier", name: "setAttribute" },
            computed: false,
          },
          arguments: [
            { type: "StringLiteral", value: attr.name.name },
            { type: "StringLiteral", value: attr.value?.type === "StringLiteral" ? attr.value.value : "" },
          ],
        },
      });
    }
  });

  // 子要素の処理
  jsxElement.children.forEach((child) => {
    if (child.type === "JSXText") {
      const textVar = `text${elementCounter.count++}`;
      statements.push(
        {
          type: "VariableDeclaration",
          kind: "const",
          declarations: [
            {
              type: "VariableDeclarator",
              id: { type: "Identifier", name: textVar },
              init: {
                type: "CallExpression",
                callee: {
                  type: "MemberExpression",
                  object: { type: "Identifier", name: "document" },
                  property: { type: "Identifier", name: "createTextNode" },
                  computed: false,
                },
                arguments: [
                  { type: "StringLiteral", value: child.value.trim() },
                ],
              },
            },
          ],
        },
        {
          type: "ExpressionStatement",
          expression: {
            type: "CallExpression",
            callee: {
              type: "MemberExpression",
              object: { type: "Identifier", name: elementVar },
              property: { type: "Identifier", name: "appendChild" },
              computed: false,
            },
            arguments: [
              { type: "Identifier", name: textVar },
            ],
          },
        },
      );
    }
    else if (child.type === "JSXElement") {
      statements.push(...processJSXElement(child, elementVar, elementCounter));
    }
  });

  // 親要素に追加
  statements.push({
    type: "ExpressionStatement",
    expression: {
      type: "CallExpression",
      callee: {
        type: "MemberExpression",
        object: { type: "Identifier", name: parentVar },
        property: { type: "Identifier", name: "appendChild" },
        computed: false,
      },
      arguments: [
        { type: "Identifier", name: elementVar },
      ],
    },
  });

  return statements;
}

/**
 * JSXのASTを基にWeb Componentsのコードを生成します。
 * @param traverseResult - traverseASTで収集した情報
 * @param traverseResult.className - 生成するクラスの名前
 * @param traverseResult.elements - JSX要素のリスト
 * @param traverseResult.options - defineCustomElementのオプション
 * @param traverseResult.orderedNodes - コードの順序を保持するためのノードのリスト
 * @returns 生成されたWeb Componentsのコード
 */
const generate = (
  traverseResult: { className: string; elements: t.JSXElement[]; options: Record<string, any>; orderedNodes: { type: "defineCustomElement" | "customElementsDefine" | "other"; node: t.Statement }[] },
): string => {
  const elementCounter = { count: 0 };
  const generatedCode: string[] = [];

  traverseResult.orderedNodes.forEach(({ type, node }) => {
    if (type === "defineCustomElement") {
      if (traverseResult.className && traverseResult.elements.length > 0) {
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
                  ...traverseResult.elements.flatMap(element => processJSXElement(element, "shadow", elementCounter)),
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
    }
    else {
      const { code } = babelGenerate(node, { retainLines: true });
      generatedCode.push(code);
    }
  });

  return generatedCode.join("\n");
};

export { generate };
