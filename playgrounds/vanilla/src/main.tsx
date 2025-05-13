import { HTMLElementEvent } from "@katu/transpiler/JSX";
import { signal } from "@katu/reactivity";

import "./main.css"

const App = defineCustomElement<{name: string}>(({ props, onAttributeChanged, constructor }) => {
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
      <input onChange={handleChange} type="text" />
      <p>{text() || "--nul--"}</p>
      <hr />
      <button onClick={handleClick}>Click : {clickCount()}</button>
      <button onClick={handleClick2}>Click +2 : {clickCount()}</button>
      <button onClick={handleClick3}>Click +3 : {clickCount()}</button>
    </>
  );
}, {
  shadowRoot: true,
  shadowRootMode: 'open'
});

customElements.define("katu-app", App);

const app = document.getElementById("app");
const element = document.createElement("katu-app");
element.setAttribute("name", "name1");
app!.appendChild(element);
setTimeout(() => {
  element.setAttribute("name", "name2");
}, 2000);