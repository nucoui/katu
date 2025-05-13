import { describe, expect, it } from "vitest";
// eslint-disable-next-line antfu/no-import-dist
import { generate, traverse } from "../dist/main.cjs";
import { parse } from "../src/parser";

describe("traverse", () => {
  it("should convert props.name to this.getAttribute('name')", () => {
    const code = `
      import { signal } from "@katu/reactivity";
      const Fuga = defineCustomElement(({ props, render }) => {
        render(() => <div>{props.name}</div>);
      }, { shadowRoot: true, shadowRootMode: 'open' });
      customElements.define("fuga-element", Fuga);
    `;
    const ast = parse(code);
    const result = traverse(ast) as any;
    const out = generate(result);
    // props.nameがthis.getAttribute('name')に変換されていることを確認
    expect(out).toMatch(/this\.getAttribute\(['"]name['"]\)/);
  });

  it("should convert signal call in ternary (ConditionalExpression) to this.#signal[0]()", () => {
    const code = `
      import { signal } from "@katu/reactivity";
      const Comp = defineCustomElement(({ render }) => {
        const [text, setText] = signal("");

        render(() => {
          return (
            <>
              <p>{text()}</p>
              <p>{text() === "" ? "--null--" : text()}</p>
            </>
          );
        });
      }, { shadowRoot: true, shadowRootMode: 'open' });
      customElements.define("ternary-element", Comp);
    `;
    const ast = parse(code);
    const result = traverse(ast);
    const out = generate(result);

    // text()がthis.#text[0]()に変換されていることを確認
    expect(out).toMatch(/this\.#text\[0\]\(\) === "" \? String\("--null--"\) : this\.#text\[0\]\(\)/);
    // test部分(this.#text[0]() === "")にString()がラップされていないことを確認
    expect(out).not.toMatch(/String\(this\.#text\[0\]\(\) === ""/);
  });

  it("should support if statement and multiple return in render callback", () => {
    const code = `
      import { signal } from "@katu/reactivity";
      const Comp = defineCustomElement(({ props, render }) => {
        render(() => {
          if (!props.name) {
            return <h1>Loading...</h1>;
          }
          return <div>{props.name}</div>;
        });
      }, { shadowRoot: true, shadowRootMode: 'open' });
      customElements.define("if-element", Comp);
    `;
    const ast = parse(code);
    const result = traverse(ast);
    const out = generate(result);
    // if分岐のreturn JSXがjsxDom関数呼び出し形式に変換されていることを確認
    expect(out).toMatch(/if \(!this\.getAttribute\(['"]name['"]\)\)/);
    expect(out).toMatch(/return jsxDom\(["']h1["'],\s*\{\s*children: ["']Loading\.\.\.["']\s*\}\)/);
    expect(out).toMatch(/return jsxDom\(["']div["'],\s*\{\s*children: String\(this\.getAttribute\(['"]name['"]\)\)\s*\}\)/);
  });
});
