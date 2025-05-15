import { functionalCustomElement } from "@katu/runtime";

const Mini = functionalCustomElement(
  ({ reactivity: { signal }, render }) => {
    const [count, setCount] = signal(0);

    render(() => {
      return (
        <div>
          <h1>Mini</h1>
          <p>Count: {count()}</p>
          <button onClick={() => setCount((c) => c + 1)}>Increment</button>
          <button onClick={() => setCount((c) => c - 1)}>Decrement</button>
        </div>
      );
    });
  },
  {
    shadowRoot: true,
  },
);

customElements.define("mini-element", Mini);

const mini = document.createElement("mini-element");
document.querySelector("#app")?.appendChild(mini);