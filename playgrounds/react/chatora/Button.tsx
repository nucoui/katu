import { toMatched } from "@chatora/util";
import type { CC } from "chatora";

export type Emits = {
  "on-click"?: { count: number };
  "on-hover"?: MouseEvent;
}

export type Props = {
  type: "button" | "submit" | "reset";
}

export const Button: CC<Props, Emits> = ({ reactivity: { signal }, defineProps, defineEmits, render }) => {
  const props = defineProps({
    type: (v) => toMatched(v, ["button", "submit", "reset"]) || "button",
  });

  const emits = defineEmits({
    "on-click": (detail) => detail,
    "on-hover": (event) => event,
  });

  const [clickCount, setClickCount] = signal(0);

  render(() => {
    return (
      <button
        type={props().type}
        onClick={() => {
          setClickCount((count) => count + 2);
          emits("on-click", {count: clickCount()});
        }}
      >
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
    border: none;
    border-radius: calc(infinity * 1px);
    padding: 0.75em 2em;
    cursor: pointer;
  }
`
