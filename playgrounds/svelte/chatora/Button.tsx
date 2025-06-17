import { toMatched } from "@chatora/util";
import { type CC } from "chatora";

export type Props = {
  type: "button" | "submit" | "reset";
}

export type Emits = {
  "on-click": { count: number, msg: string };
  "on-event": { type: string; detail: { count: number } };
}

export const Button: CC<Props, Emits> = ({ reactivity: { signal, effect }, defineProps, defineEmits }) => {
  const props = defineProps({
    type: (v) => toMatched(v, ["button", "submit", "reset"]) || "button",
  });

  const emits = defineEmits({
    "on-click": () => {},
    "on-event": () => {}
  });

  const [clickCount, setClickCount] = signal(0);

  return () => {
    return (
      <button
        type={props().type}
        onClick={() => {
          setClickCount((count) => count + 2);
          emits("on-click", { count: clickCount(), msg: "From Chatora.js" });
          emits("on-event", { type: "click", detail: { count: clickCount() } });
      }}>
        <span>Click count: {clickCount()}</span>
        <br></br>
        <slot />
        <slot name="slot1" />
      </button>
    );
  }
}

export const ButtonStyle = `
  button {
    color: red;
    background-color: yellow;
    border: 1px solid black;
    padding: 10px;
    border-radius: 5px;
    }
    button:hover {
    background-color: orange;
  }
  button[type="submit"] {
    background-color: green;
  }
`
