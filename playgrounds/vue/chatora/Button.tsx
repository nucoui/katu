import { toMatched } from "@chatora/util";
import { signal, type CC } from "chatora";
import type { DefineEmits, DefineProps } from "@chatora/util";
import { render } from "vue";

export type Props = {
  type: "button" | "submit" | "reset";
}

export type Emits = {
  "on-click": { count: number };
  "on-event": { type: string; detail: { count: number } };
}

export const Button: CC<Props, Emits> = ({ reactivity: { signal }, defineProps, defineEmits, render }) => {
  const props = defineProps({
    type: (v) => toMatched(v, ["button", "submit", "reset"]) || "button",
  });

  const emits = defineEmits({
    "on-click": (_detail: { count: number }) => {},
    "on-event": (_detail: { type: string; detail: { count: number } }) => {}
  });

  const [clickCount, setClickCount] = signal(0);

  render(() => {
    return (
      <button
        type={props().type}
        onClick={() => {
          setClickCount((count) => count + 2);
          emits("on-click", { count: clickCount()});
          emits("on-event", { type: "click", detail: { count: clickCount() } });
      }}>
        <span>Click count: {clickCount()}</span>
        <br></br>
        <slot />
        <slot name="slot1" />
      </button>
    );
  })
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
`
