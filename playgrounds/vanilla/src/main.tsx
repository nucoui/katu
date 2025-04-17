import { signal } from "@katu/reactivity"

const Count = () => {
  const [count, setCount] = signal(1)

  setInterval(() => {
    setCount((prev) => prev + 1)
  }, 1000)

  return defineRenderer(() => (
    <div>
      <h1>Count: {String(count())}</h1>
    </div>
  ))
}

const element = (
  <div>
    <Count />
  </div>
)

const app = document.getElementById("app");
app?.appendChild(await createElement(element));
