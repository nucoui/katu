import { functionalCustomElement, CC, IC, functionalDeclarativeCustomElement } from "chatora";

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
  });

  return (() => {
    return (
      <>
        <h1>Mini</h1>
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
      </>
    );
  });
}

const MiniElement = functionalCustomElement(Mini,{
  shadowRoot: true,
  styles: [
    `
      button {
        margin: 0 5px;
        padding: 5px 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    `,
  ],
});

console.log(functionalDeclarativeCustomElement(Mini, {
  shadowRoot: true,
  styles: [
    `
      button {
        margin: 0 5px;
        padding: 5px 10px;
        background-color: #007bff;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }
    `,
  ],
}));

customElements.define("mini-element", MiniElement);

const mini = document.createElement("mini-element");
document.querySelector("#app")?.appendChild(mini);