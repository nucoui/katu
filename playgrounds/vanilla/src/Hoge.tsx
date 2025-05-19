import { functionalCustomElement } from "tora";

export const Hoge = functionalCustomElement(({
  reactivity: { signal, effect },
  defineProps,
  onConnected,
  onDisconnected,
  onAttributeChanged,
  render
}) => {
  console.log("constructor");

  const props = defineProps(["foo", "bar"]);

  const [time, setTime] = signal(0);
  const [name, setName] = signal("");
  const [count, setCount] = signal(0);

  setInterval(() => {
    setTime(t => t + 1);
  }, 1000);

  // effect(() => {
  //   console.log(time());
  // });

  onConnected(() => {
    console.log("connected");
  });

  onDisconnected(() => {
    console.log("disconnected");
  });

  onAttributeChanged((name, oldValue, newValue) => {
    console.log("attribute changed", name, oldValue, newValue);
  });

  const handleReset = () => {
    setTime(0);
  };

  const handleNameChange = (e: Event) => {
    const target = e.target as HTMLInputElement;
    console.log(target.value);
    setName(target.value);
  };

  effect(() => {
    console.log("effect", name());
  });

  const handleIncrement = () => {
    setCount(c => c + 1);
  };

  const handleDecrement = () => {
    setCount(c => c - 1);
  };

  render(() => {
    if (props().foo === "bar") {
      return <div>foo attribute is bar. Cannot render.</div>;
    }

    if (count() > 10) {
      return (
        <div>
          <p>Count: {count()}</p>
          <button onClick={handleIncrement}>Increment</button>
          <button onClick={handleDecrement}>Decrement</button>
        </div>
      );
    }

    return (
      <div>
        <h1>Hoge</h1>
        <p>Time: {time()}</p>
        <p>Foo: {props().foo}</p>
        <input onChange={handleNameChange} type="text" name="name" id="name" />
        <p>Name: {name()}</p>
        <hr />
        <button onClick={handleReset}>Reset</button>
        <hr />
        <p>Count: {count()}</p>
        <button onClick={handleIncrement}>Increment</button>
        <button onClick={handleDecrement}>Decrement</button>
      </div>
    );
  });

}, {
  shadowRoot: true,
  shadowRootMode: "open",
  style: `
    button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `
});

customElements.define("hoge-element", Hoge);
const hogeElement = document.createElement("hoge-element") as InstanceType<typeof Hoge>;
hogeElement.setAttribute("foo", "bar");
setTimeout(() => {
  hogeElement.setAttribute("foo", "baz");
}, 1000);

const app = document.getElementById("app");
if (app) {
  app.appendChild(hogeElement);
}