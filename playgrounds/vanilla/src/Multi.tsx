import { functionalCustomElement } from "chatora";

const MultiA = functionalCustomElement(
  ({ reactivity: { signal }, render }) => {
    const [count, setCount] = signal(0);

    render(() => {
      return (
        <div>
          <h1>Multi A</h1>
          <p>Count: {count()}</p>
          <button onClick={() => setCount((c) => c + 1)}>Increment</button>
          <button onClick={() => setCount((c) => c - 1)}>Decrement</button>
        </div>
    )})
}, {})

const MultiB = functionalCustomElement(
  ({ reactivity: { signal }, render, onConnected }) => {
    const [count, setCount] = signal(0);

    onConnected(() => {
      customElements.define("multi-a", MultiA);
    });

    render(() => {
      return (
        <div>
          <h1>Multi B</h1>
          <p>Count: {count()}</p>
          <button onClick={() => setCount((c) => c + 1)}>Increment</button>
          <button onClick={() => setCount((c) => c - 1)}>Decrement</button>
          <multi-a />
        </div>
    )})
}, {})

customElements.define("multi-b", MultiB);

document.querySelector("#app")?.appendChild(document.createElement("multi-b"));
