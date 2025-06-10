import { functionalCustomElement, type CC } from "chatora";
import { toBoolean, toMatched, toString } from "@chatora/util";
import clsx from "clsx";
import style from "./Button.scss?raw";

export type Props = {
  variant?: "primary" | "secondary" | "tertiary" | "error";
  disabled?: boolean;
  width?: "auto" | "stretch";
  size?: "small" | "medium" | "large";
} & ({
  type?: "anchor";
  href?: string;
  target?: string;
} | {
  type?: "submit" | "reset" | "button" | "toggle";
  href?: never;
  target?: never;
});

export type Emits = {
  "on-click": Event;
};

export const Button: CC<Props, Emits> = ({
  reactivity: { computed },
  defineEmits,
  defineProps,
  getHost,
  render,
}) => {
  const props = defineProps({
    type: v => toMatched(v, ["anchor", "submit", "reset", "button", "toggle"]) ?? "button",
    variant: v => toMatched(v, ["primary", "secondary", "tertiary", "error"]) ?? "primary",
    disabled: v => toBoolean(v) ?? false,
    width: v => toMatched(v, ["auto", "stretch"]) ?? "auto",
    size: v => toMatched(v, ["small", "medium", "large"]) ?? "medium",
    href: v => toString(v),
    target: v => toString(v),
  });

  const emits = defineEmits({
    "on-click": () => {},
  });

  const host = getHost();

  const handleClick = (e: Event) => {
    emits("on-click", e);
    if (props().type === "submit") {
      host?.closest("form")?.requestSubmit();
    }
  };

  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === "Enter") {
      handleClick(e);
    }
  };

  const commonAttrs = computed(() => ({
    "class": clsx("n-button", `-${props().size}`, `-${props().variant}`, {
      "-anchor": props().type === "anchor",
      "-toggle": props().type === "toggle",
      "-auto": props().width === "auto",
    }),
    "disabled": props().disabled,
    "aria-disabled": props().disabled,
    "onKeydown": props().disabled ? undefined : handleKeydown,
    "onClick": props().disabled ? undefined : handleClick,
  }));

  render(() => {
    const type = props().type;

    switch (type) {
      case "anchor": {
        return (
          <a
            {...commonAttrs()}
            tabindex={props().disabled ? -1 : 0}
            href={props().disabled ? undefined : props().href}
            target={props().target}
          >
            <span class="contents">
              <slot />
            </span>
          </a>
        );
      }
      case "toggle": {
        return (
          <button
            {...commonAttrs()}
            type="button"
          >
            <span class="contents">
              <slot />
            </span>
          </button>
        );
      }
      default: {
        return (
          <button
            {...commonAttrs()}
            type={type}
          >
            <span class="contents">
              <slot />
            </span>
          </button>
        );
      }
    }
  });
};

const ButtonElement = functionalCustomElement(Button, { styles: [style] });
if (customElements.get("n-button") === undefined) {
  customElements.define("n-button", ButtonElement);
}

const button = document.createElement("n-button");
button.setAttribute("type", "button");
button.setAttribute("variant", "primary");
button.setAttribute("size", "medium");
button.setAttribute("width", "auto");
button.setAttribute("disabled", "false");
button.innerHTML = "Click Me";


document.querySelector("#app")?.appendChild(button);