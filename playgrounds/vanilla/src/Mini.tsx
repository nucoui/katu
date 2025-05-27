import { functionalCustomElement, ChatoraComponent } from "chatora";

const Mini: ChatoraComponent = ({ reactivity: { signal }, render }) => {
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
}

const MiniElement = functionalCustomElement(Mini,{
  shadowRoot: true,
});

customElements.define("mini-element", MiniElement);

const mini = document.createElement("mini-element");
document.querySelector("#app")?.appendChild(mini);