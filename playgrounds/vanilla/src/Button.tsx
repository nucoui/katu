import { functionalCustomElement, type CC } from "chatora";
import { toBoolean, toMatched, toString } from "@chatora/util";
import clsx from "clsx";
import style from "./Button.scss?raw";
import { Host } from "chatora/jsx-runtime"

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
  type?: "submit" | "reset" | "button";
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
  getInternals,
}) => {
  const props = defineProps({
    type: v => toMatched(v, ["anchor", "submit", "reset", "button"]) ?? "button",
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
  const internals = getInternals();

  console.log(internals)

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
      "-auto": props().width === "auto",
    }),
    "disabled": props().disabled,
    "aria-disabled": props().disabled,
    "onKeydown": props().disabled ? undefined : handleKeydown,
    "onClick": props().disabled ? undefined : handleClick,
  }));

  return () => {
      const type = props().type;

      switch (type) {
        case "anchor": {
          return (
            <Host shadowRoot shadowRootMode="open" style={[style]}>
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
            </Host>
          );
        }
        default: {
          return (
            <Host shadowRoot shadowRootMode="open" style={[style]}>
              <button
                {...commonAttrs()}
                type={type}
              >
                <span class="contents">
                  <slot />
                </span>
              </button>
            </Host>
          );
        }
      }
    }
};

class ButtonElement extends functionalCustomElement(Button) {
  static formAssociated = true;
}

if (customElements.get("n-button") === undefined) {
  customElements.define("n-button", ButtonElement);
}

const button = document.createElement("n-button");
document.querySelector("#app")?.appendChild(button);
button.setAttribute("type", "anchor");
button.setAttribute("variant", "primary");
button.setAttribute("size", "medium");
button.setAttribute("width", "auto");
button.setAttribute("disabled", "false");
button.innerHTML = "Click Me";
button.addEventListener("on-click", (e) => {
  const customEvent = e as CustomEvent;
  console.log("Button clicked:", customEvent.detail);
});

setInterval(() => {
  const currentDisabled = button.getAttribute("disabled");
  const nextVariant = currentDisabled === "true" ? "false" : "true";
  button.setAttribute("disabled", nextVariant);
  // console.log(`Button variant changed to: ${nextVariant}`);
}, 1000);
