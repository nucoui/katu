import { toMatched } from "@chatora/util";
import type { ChatoraComponent } from "chatora";
import type { DefineEmits, DefineProps } from "@chatora/util";

export type Emits = "on-click" | "on-hover" | "on-event"

export type Props = {
  type: "button" | "submit" | "reset";
}

export const Button: ChatoraComponent = ({ reactivity: { signal }, defineProps, defineEmits, render }) => {
  const props = defineProps<DefineProps<Props>>({
    type: (v) => toMatched(v, ["button", "submit", "reset"]) || "button",
  });

  const emits = defineEmits<DefineEmits<Emits>>(["on-click", "on-hover", "on-event"]);

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
