import { functionalCustomElement, CC, IC, functionalDeclarativeCustomElement } from "chatora";
import { Host } from "chatora/jsx-runtime";

const Test: IC<{ count: number }> = ({ count }) => {
  return () => {
    return (
      <div>
        <h1>Test Component</h1>
        <p>This is a test component.</p>
        <p>Count: {count}</p>
      </div>
    );
  }
}

const Mini: CC = ({ reactivity: { signal, effect } }) => {
  const [count, setCount] = signal(0);

  effect(() => {
    console.log("Count changed:", count());
  }, {
    immediate: true
  });

  return () => (
    <Host shadowRoot shadowRootMode="open" style={[`
      button {
        margin: 0 5px;
        padding: 5px 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    `]}>
      <h1>Mini</h1>
      <svg xmlns="http://www.w3.org/2000/svg" width="1.5rem" height="1.5rem" viewBox="0 0 24 24">
        <path fill="currentColor" d="M11.475 14.475L7.85 10.85q-.075-.075-.112-.162T7.7 10.5q0-.2.138-.35T8.2 10h7.6q.225 0 .363.15t.137.35q0 .05-.15.35l-3.625 3.625q-.125.125-.25.175T12 14.7t-.275-.05t-.25-.175" />
      </svg>
      <p>Count: {count()}</p>
      <>
        <button onClick={() => setCount((c) => c + 1)}>Increment (next value: {count() + 1})</button>
        <button onClick={() => setCount((c) => c - 1)}>Decrement (next value: {count() - 1})</button>
      </>
      <>
        <p>in fragment</p>
      </>
      {
        count() % 2 === 0
        ? <Test count={count()} />
        : <>
            <h2>Odd Count</h2>
            <p>The count is currently odd.</p>
          </>
      }
    </Host>
  )
}

const MiniElement = functionalCustomElement(Mini);

console.log(functionalDeclarativeCustomElement(Mini));

customElements.define("mini-element", MiniElement);

const mini = document.createElement("mini-element");
document.querySelector("#app")?.appendChild(mini);
