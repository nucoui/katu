import { effect, signal } from "@katu/reactivity";
import "./main.css"
import { functionalCustomElement } from "@katu/runtime";

const Hoge = functionalCustomElement(({ onConnected, render }) => {
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

}, {shadowRoot: true, shadowRootMode: "open"});

customElements.define("hoge-element", Hoge);

const app = document.getElementById("app");
const element = document.createElement("hoge-element");
app!.appendChild(element);