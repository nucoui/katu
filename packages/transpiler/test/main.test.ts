import { describe, it } from "vitest";
// eslint-disable-next-line antfu/no-import-dist
import { generate, traverse } from "../dist/main.cjs";
import { parse } from "../src/parser";

/**
 * smapla.tsx相当のコードをAST化し、traverseでCustomElement情報が正しく抽出できるかテスト
 */
describe("traverse", () => {
  it("should extract CustomElement info from defineCustomElement call", () => {
    const code = `
      import { signal } from "@katu/reactivity";

      const Hoge = defineCustomElement(({ props, onAttributeChanged, constructor }) => {
        const [time, setTime] = signal(0);
        const [clickCount, setClickCount] = signal(0);
        const handleClick = () => { setClickCount((count) => count + 1); };
        const hogeConst = "hoge";

        constructor(() => {
          setInterval(() => { setTime((t) => t + 1); }, 1000);
          setClickCount(0);
        });

        return (
          <>
            <h1>Hello World</h1>
            <p>{hogeConst}</p>
            <p>{[1,2,3,4].map(i => <span>{i}</span>)}</p>
            <p>{time()}</p>
            <ul>
              <li>hoge</li>
              <li>fuga</li>
              <li>100</li>
            </ul>
            {/* <p>{props.name}</p> */}
            <button onClick={handleClick}>Click : {clickCount()}</button>
          </>
        );
      }, { shadowRoot: true, shadowRootMode: 'open' });

      customElements.define("hoge-element", Hoge);
    `;
    const ast = parse(code);
    const result = traverse(ast) as any;

    console.log(generate(result));
  });
});
