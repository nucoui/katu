import { HTMLElementEvent } from "@katu/transpiler/JSX";
import { signal } from "@katu/reactivity";

import "./main.css"

const App = defineCustomElement<{name: string}>(({ props, constructor, render }) => {
  const [time, setTime] = signal(0);
  const [clickCount, setClickCount] = signal(0);
  const [text, setText] = signal("");

  const handleClick = () => { setClickCount((count) => count + 1); };
  const handleClick2 = () => { setClickCount((count) => count + 2); };
  const handleClick3 = () => { setClickCount((count) => count + 3); };
  const handleChange = (e: HTMLElementEvent<HTMLInputElement>) => { setText(e.target.value); };

  const a = "katu"

  constructor(() => {
    setInterval(() => { setTime((t) => t + 1); }, 1000);
    setClickCount(0);
  });

  render(() => {
    if (!props.name) {
      return <h1>Loading...</h1>;
    }

    return (
      <>
        <h1>Hello World, {a}</h1>
        <hr />
        <ul>{["foo","bar","baz"].map(i => (<li>{i}</li>))}</ul>
        <hr />
        <p>Count: {time()}</p>
        <hr />
        <p>{props.name}</p>
        <hr />
        <input name="text" onChange={handleChange} type="text" />
        <p>{text() || "--null--"}</p>
        <hr />
        <button onClick={handleClick}>Click : {clickCount()}</button>
        <button onClick={handleClick2}>Click +2 : {clickCount()}</button>
        <button onClick={handleClick3}>Click +3 : {clickCount()}</button>
      </>
    );
  });
}, {
  shadowRoot: true,
  shadowRootMode: 'open'
});

customElements.define("katu-app", App);

const app = document.getElementById("app");
const element = document.createElement("katu-app");
// element.setAttribute("name", "name1");
app!.appendChild(element);
setTimeout(() => {
  element.setAttribute("name", "name2");
}, 2000);
// import { effect, signal } from "@katu/reactivity";
// import "/src/main.css";
// class App extends HTMLElement {
//   #time = signal(0);
//   #clickCount = signal(0);
//   #text = signal("");
//   a = "katu";
//   handleClick = () => {
//     this.#clickCount[1](count => count + 1);
//   };
//   handleClick2 = () => {
//     this.#clickCount[1](count => count + 2);
//   };
//   handleClick3 = () => {
//     this.#clickCount[1](count => count + 3);
//   };
//   handleChange = e => {
//     this.#text[1](e.target.value);
//   };
//   static observedAttributes = ["name"];
//   constructor() {
//     super();
//     setInterval(() => {
//       this.#time[1](t => t + 1);
//     }, 1e3);
//     this.#clickCount[1](0);
//   }
//   connectedCallback() {
//     if (!this.shadowRoot) {
//       this.attachShadow({
//         mode: "open"
//       });
//     }
//     this._patchDom(this._renderHtml());
//     effect(() => {
//       this.#time[0]();
//       this.#text[0]();
//       this.#clickCount[0]();
//       this._patchDom(this._renderHtml());
//     });
//   }
//   attributeChangedCallback() {
//     this._patchDom(this._renderHtml());
//   }
//   _patchDom(newDom) {
//     console.log("newDom", newDom);
//     if (!this.shadowRoot) {
//       return;
//     }
//     const nodes = newDom.map(n => typeof n === "string" ? document.createTextNode(n) : n);
//     const current = Array.from(this.shadowRoot.childNodes).slice();
//     if (current.length !== nodes.length) {
//       this.shadowRoot.replaceChildren(...nodes);
//       return;
//     }
//     for (let i = 0; i < nodes.length; i++) {
//       if (!current[i].isEqualNode(nodes[i])) {
//         this.shadowRoot.replaceChild(nodes[i], current[i]);
//       }
//     }
//   }
//   _renderHtml() {
//     if (!this.getAttribute("name")) {
//       return jsxDom("h1", {
//         children: "Loading..."
//       });
//     }
//     return jsxDom(Fragment, {
//       children: ["\n        ", jsxDom("h1", {
//         children: ["Hello World, ", String(this.a)]
//       }), "\n        ", jsxDom("hr", {}), "\n        ", jsxDom("ul", {
//         children: ["foo", "bar", "baz"].map(i => jsxDom("li", {
//           children: String(i)
//         }))
//       }), "\n        ", jsxDom("hr", {}), "\n        ", jsxDom("p", {
//         children: ["Count: ", this.#time[0]()]
//       }), "\n        ", jsxDom("hr", {}), "\n        ", jsxDom("p", {
//         children: String(this.getAttribute("name"))
//       }), "\n        ", jsxDom("hr", {}), "\n        ", jsxDom("input", {
//         name: "text",
//         onChange: this.handleChange,
//         type: "text"
//       }), "\n        ", jsxDom("p", {
//         children: String(this.#text[0]() || "--null--")
//       }), "\n        ", jsxDom("hr", {}), "\n        ", jsxDom("button", {
//         onClick: this.handleClick,
//         children: ["Click : ", this.#clickCount[0]()]
//       }), "\n        ", jsxDom("button", {
//         onClick: this.handleClick2,
//         children: ["Click +2 : ", this.#clickCount[0]()]
//       }), "\n        ", jsxDom("button", {
//         onClick: this.handleClick3,
//         children: ["Click +3 : ", this.#clickCount[0]()]
//       }), "\n      "]
//     });
//   }
// }
// customElements.define("katu-app", App);
// const app = document.getElementById("app");
// const element = document.createElement("katu-app");
// app.appendChild(element);
// setTimeout(() => {
//   element.setAttribute("name", "name2");
// }, 2e3);