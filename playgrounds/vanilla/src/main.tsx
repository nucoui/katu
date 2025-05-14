// import { effect, signal } from "@katu/reactivity";
// import "./main.css"
// import { KatuJSXElement } from "@katu/transpiler/JSX";

// // const getThis = () => {
// //   return this;
// // }

// const onConnectedBase = (callback: () => void, constructor: any) => {
//   constructor.prototype.handleConnected = callback;
// }

// /**
//  * 仮想DOMノード型（最小構成）
//  * Virtual DOM node type (minimal)
//  */
// type VNode = {
//   tag: string;
//   props: Record<string, string>;
//   children: Array<VNode | string>;
// };

// /**
//  * NodeまたはKatuJSXElementからVNodeへ変換する関数
//  * Convert a real DOM Node or KatuJSXElement to a VNode
//  * @param node DOMノードまたはKatuJSXElement
//  * @returns VNodeまたはstring
//  */
// function nodeToVNode(node: Node): VNode | string;
// function nodeToVNode(node: KatuJSXElement): VNode | string;
// function nodeToVNode(node: any): VNode | string {
//   // KatuJSXElementの場合
//   if (node && typeof node === "object" && "tag" in node && "props" in node && "children" in node) {
//     // KatuJSXElementの型定義に合わせて変換
//     return {
//       tag: node.tag,
//       props: node.props ?? {},
//       children: (node.children ?? []).map(nodeToVNode),
//     };
//   }
//   // Nodeの場合
//   if (node instanceof Node) {
//     if (node.nodeType === Node.TEXT_NODE) {
//       return node.textContent || "";
//     }
//     if (node.nodeType === Node.ELEMENT_NODE) {
//       const el = node as Element;
//       const props: Record<string, string> = {};
//       for (const attr of Array.from(el.attributes)) {
//         props[attr.name] = attr.value;
//       }
//       const children = Array.from(node.childNodes).map(nodeToVNode);
//       return { tag: el.tagName.toLowerCase(), props, children };
//     }
//   }
//   return "";
// }

// /**
//  * VNodeからNodeを生成する関数
//  * Create a real DOM Node from a VNode
//  */
// function createNode(vnode: VNode | string): Node {
//   if (typeof vnode === "string") {
//     return document.createTextNode(vnode);
//   }
//   const el = document.createElement(vnode.tag);
//   for (const [k, v] of Object.entries(vnode.props)) {
//     el.setAttribute(k, v);
//   }
//   vnode.children.forEach(child => {
//     el.appendChild(createNode(child));
//   });
//   return el;
// }

// /**
//  * 2つのVNodeを比較し、差分だけを実DOMに反映するpatch関数
//  * Patch the real DOM based on the diff between two VNodes
//  */
// function patch(parent: Node, oldVNode: VNode | string | null, newVNode: VNode | string, index = 0) {
//   const child = parent.childNodes[index];
//   if (!oldVNode) {
//     parent.appendChild(createNode(newVNode));
//     return;
//   }
//   if (!newVNode) {
//     if (child) parent.removeChild(child);
//     return;
//   }
//   if (typeof oldVNode === "string" || typeof newVNode === "string") {
//     if (oldVNode !== newVNode) {
//       parent.replaceChild(createNode(newVNode), child);
//     }
//     return;
//   }
//   if (oldVNode.tag !== newVNode.tag) {
//     parent.replaceChild(createNode(newVNode), child);
//     return;
//   }
//   // 属性の差分反映
//   const el = child as Element;
//   for (const [k, v] of Object.entries(newVNode.props)) {
//     if (el.getAttribute(k) !== v) {
//       el.setAttribute(k, v);
//     }
//   }
//   for (const k of Object.keys(oldVNode.props)) {
//     if (!(k in newVNode.props)) {
//       el.removeAttribute(k);
//     }
//   }
//   // 子要素の差分反映
//   const max = Math.max(oldVNode.children.length, newVNode.children.length);
//   for (let i = 0; i < max; i++) {
//     patch(child, oldVNode.children[i], newVNode.children[i], i);
//   }
// }

// const customElementFunction = (callback: ({
//   onConnected,
//   render
// }: {
//   onConnected: (callback: () => void) => void;
//   render: (callback: () => KatuJSXElement) => void;
// }) => void) => {
//   return class extends HTMLElement {
//     private _vnode: VNode | string | null = null;
//     constructor() {
//       super();
//       this.attachShadow({ mode: "open" });
//       callback({
//         onConnected: (cb) => {
//           onConnectedBase(cb, this.constructor);
//         },
//         render: (cb) => {
//           const renderCallback = () => {
//             const node = cb();
//             const newVNode = nodeToVNode(node);
//             if (this._vnode == null) {
//               this.shadowRoot!.innerHTML = "";
//               this.shadowRoot!.appendChild(createNode(newVNode));
//             } else {
//               patch(this.shadowRoot!, this._vnode, newVNode, 0);
//             }
//             this._vnode = newVNode;
//           };
//           effect(renderCallback);
//         }
//       });
//     }

//     handleConnected () {}

//     // connectedCallbackはconstructorで上書きされるため、ここは空実装
//     connectedCallback() {
//       this.handleConnected();
//     }
//   }
// }

// const Hoge = customElementFunction(({ onConnected, render }) => {
//   console.log("constructor");

//   const [time, setTime] = signal(0);

//   setInterval(() => {
//     setTime(t => t + 1);
//   }, 1000);

//   effect(() => {
//     console.log(time());
//   });

//   onConnected(() => {
//     console.log("connected");
//   });

//   render(() => {
//     return (
//       <div>
//         <h1>Hoge</h1>
//         <p>Time: {time()}</p>
//         <button onClick={() => setTime(0)}>Reset</button>
//       </div>
//     );
//   });

// });

// customElements.define("hoge-element", Hoge);

// const app = document.getElementById("app");
// const element = document.createElement("hoge-element");
// app!.appendChild(element);

// == new ===

import "./main.css"
import { functionalCustomElement } from "@katu/runtime";

const Hoge = functionalCustomElement(({ 
  reactivity: { signal, effect },
  onConnected, render }) => {
  console.log("constructor");

  const [time, setTime] = signal(0);

  setInterval(() => {
    setTime(t => t + 1);
  }, 1000);

  effect(() => {
    console.log(time());
  });

  onConnected(() => {
    console.log("connected");
  });

  render(() => {
    return (
      <div>
        <h1>Hoge</h1>
        <p>Time: {time()}</p>
        <button onClick={() => setTime(0)}>Reset</button>
      </div>
    );
  });

}, {
  shadowRoot: true,
  shadowRootMode: "open",
});

customElements.define("hoge-element", Hoge);

const app = document.getElementById("app");
const element = document.createElement("hoge-element");
app!.appendChild(element);