import { createCustomElement, createElement, createElementToHast, resisterElement } from "@katu/runtime";
import { signal } from "alien-signals";

const Time = (props: { text: string }) => {
  const time = signal(new Date().getTime());

  setInterval(() => {
    time(new Date().getTime());
  }, 5000);

  return (
    <div>
      <h1>{props.text}</h1>
      <p>Now: {String(time())}</p>
    </div>
  );
};


resisterElement("ce-time", createCustomElement(Time));

const element = (
  <div>
    <Time text="Test" />
    {/* <Title text="Hello, world!" /> */}
    {/* <p>Goodbye, world!</p> */}
    <ce-time text="Test" />
  </div>
);

const app = document.getElementById("app");
app?.appendChild(await createElement(element));

console.log(await createElementToHast(element));
