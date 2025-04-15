import { render } from "@katu/runtime";

const Title = (props: { text: string }) => {
  console.log("Title", props);
  return <h1>{props.text}</h1>;
};

const element = (
  <div repeat={3}>
    <Title text="Hello, world!" />
    <p>Goodbye, world!</p>
  </div>
);

console.log(await render(element));