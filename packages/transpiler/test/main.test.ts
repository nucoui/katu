/* eslint-disable antfu/no-import-dist */

import { describe, expect, it } from "vitest";
import { transpile } from "../dist/main.cjs";

describe("traverseAndGenerate", () => {
  it("should generate a Web Component class from a simple JSX AST", () => {
    const code = `
    const Hoge = defineCustomElement(() => {
      return (
        <div class="hoge">
          Hoge
        </div>
      );
    }, {
      shadowRoot: true,
      shadowRootMode: "open",
    });
    customElements.define("hoge-element", Hoge);
    `;
    const result = transpile(code);

    console.log(result);

    expect(result).toContain("class Hoge extends HTMLElement {");
    expect(result).toContain(`const shadow = this.attachShadow({
      mode: "open"
    });`);
    expect(result).toContain("const el0 = document.createElement(\"div\");");
    expect(result).toContain("el0.setAttribute(\"class\", \"hoge\");");
    expect(result).toContain("const text1 = document.createTextNode(\"Hoge\");");
    expect(result).toContain("el0.appendChild(text1);");
  });

  // it("should handle nested elements", () => {
  //   const code = `
  //   const Nested = defineCustomElement(() => {
  //   return (<div class="parent"><span class="child">Child</span></div>);
  //   }, { shadowRoot: true, shadowRootMode: "open" });
  //   `;
  //   const result = transpile(code);

  //   // console.log(result);

  //   expect(result).toContain("class Nested extends HTMLElement {");
  //   expect(result).toContain("const el0 = document.createElement(\"div\");");
  //   expect(result).toContain("el0.setAttribute(\"class\", \"parent\");");
  //   expect(result).toContain("const el1 = document.createElement(\"span\");");
  //   expect(result).toContain("el1.setAttribute(\"class\", \"child\");");
  //   expect(result).toContain("const text2 = document.createTextNode(\"Child\");");
  //   expect(result).toContain("el1.appendChild(text2);");
  //   expect(result).toContain("el0.appendChild(el1);");
  //   expect(result).toContain("shadow.appendChild(el0);");
  // });

  // it("should handle multiple attributes", () => {
  //   const code = `const MultiAttr = defineCustomElement(() => { return (<input type=\"text\" placeholder=\"Enter text\" disabled />); }, { shadowRoot: true, shadowRootMode: "open" });`;
  //   const result = transpile(code);

  //   // console.log(result);

  //   expect(result).toContain("class MultiAttr extends HTMLElement {");
  //   expect(result).toContain("const el0 = document.createElement(\"input\");");
  //   expect(result).toContain("el0.setAttribute(\"type\", \"text\");");
  //   expect(result).toContain("el0.setAttribute(\"placeholder\", \"Enter text\");");
  //   expect(result).toContain("el0.setAttribute(\"disabled\", \"\");");
  // });

  // it("should handle multiple children", () => {
  //   const code = `const MultiChild = defineCustomElement(() => { return (<ul><li>Item 1</li><li>Item 2</li><li>Item 3</li></ul>); }, { shadowRoot: true, shadowRootMode: "open" });`;
  //   const result = transpile(code);

  //   // console.log(result);

  //   expect(result).toContain("class MultiChild extends HTMLElement {");
  //   expect(result).toContain("const el0 = document.createElement(\"ul\");");
  //   expect(result).toContain("const el1 = document.createElement(\"li\");");
  //   expect(result).toContain("const text2 = document.createTextNode(\"Item 1\");");
  //   expect(result).toContain("el1.appendChild(text2);");
  //   expect(result).toContain("el0.appendChild(el1);");
  //   expect(result).toContain("const el3 = document.createElement(\"li\");");
  //   expect(result).toContain("const text4 = document.createTextNode(\"Item 2\");");
  //   expect(result).toContain("el3.appendChild(text4);");
  //   expect(result).toContain("el0.appendChild(el3);");
  //   expect(result).toContain("const el5 = document.createElement(\"li\");");
  //   expect(result).toContain("const text6 = document.createTextNode(\"Item 3\");");
  //   expect(result).toContain("el5.appendChild(text6);");
  //   expect(result).toContain("el0.appendChild(el5);");
  //   expect(result).toContain("shadow.appendChild(el0);");
  // });
});

// describe("transpile function", () => {
//   it("should preserve non defineCustomElement code when preserveNonCustomElementCode is true", () => {
//     const inputCode = `
//       const nonCustomElementCode = () => console.log('This should remain');

//       const Hoge = defineCustomElement(() => {
//         return <div>Hello World</div>;
//       }, { shadowRootMode: 'open' });

//       customElements.define("hoge-element", Hoge);
//       console.log('This should also remain');
//     `;

//     const outputCode = transpile(inputCode);

//     // console.log(outputCode);

//     expect(outputCode).toContain("console.log('This should remain');");
//     expect(outputCode).toContain("class");
//     expect(outputCode).toContain("Hello World");
//     expect(outputCode).toContain("customElements.define(\"hoge-element\", Hoge);");
//     expect(outputCode).toContain("console.log('This should also remain');");
//   });
// });
