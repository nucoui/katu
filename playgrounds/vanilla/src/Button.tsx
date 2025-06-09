import { functionalCustomElement } from "chatora";
import type { CC } from "chatora";
import style from "./Button.scss?raw";
import { clsx } from "clsx";
import { toBoolean, toMatched } from "@chatora/util";

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

type Emits = {
  "on-click": { count: number };
  "on-hover": MouseEvent;
}

const Button: CC<Props, Emits> = ({
  reactivity: { computed },
  defineProps,
  defineEmits,
  render,
  getHost
}) => {
  const props = defineProps({
    type: (v) => toMatched(v, ["anchor", "submit", "reset", "button", "toggle"]) ?? "button",
    variant: (v) => toMatched(v, ["primary", "secondary", "tertiary", "error"]) ?? "primary",
    size: (v) => toMatched(v, ["small", "medium", "large"]) ?? "medium",
    disabled: (v) => toBoolean(v) ?? false,
    href: (v) => v,
    target: (v) => v,
    width: (v) => toMatched(v, ["auto", "stretch"]) ?? "auto",
  });

  const emits = defineEmits({
    "on-click": () => {},
    "on-hover": () => {},
  });

  const handleClick = (e: MouseEvent) => {
    if (props().disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    emits("on-click", { count: e.detail });

    if (props().type === "submit") {
      getHost().closest("form")?.requestSubmit();
    }
  };

  const commonAttr = computed(() => ({
    class: clsx("n-button", `-${props().variant ?? "primary"}`, `n-button-${props().size ?? "medium"}`, {
      "-anchor": props().type === "anchor",
      "-toggle": props().type === "toggle",
      "-auto": props().width === "auto",
    }),
    disabled: props().disabled,
    "aria-disabled": props().disabled,
    onClick: handleClick,
  }))

  render(() => {
    const type = props().type

    if (type === "anchor") {
      return (
        <a
          href={props().href ?? "#"}
          target={props().target ?? "_self"}
          {...commonAttr()}
        >
          <span class="contents">
            <slot />
          </span>
        </a>
      );
    }

    if (type === "toggle") {
      return (
        <button
          type="button"
          {...commonAttr()}
        >
          <span class="contents">
            <slot />
          </span>
        </button>
      );
    }

    return (
      <button
        type={type}
        {...commonAttr()}
      >
        <span class="contents">
          <slot />
        </span>
      </button>
    )
  })
}

export const ButtonElement = functionalCustomElement(Button, { styles: [ style ] });

customElements.define("n-button", ButtonElement);

const h1 = document.createElement("h1");
h1.innerHTML = "Button.tsx";
h1.style.marginBottom = "1rem";
const nButton = document.createElement("n-button")
nButton.innerHTML = "Button";
nButton.addEventListener("on-click", (e) => {
  console.log("Hoge Button clicked", e.detail);
})

const form = document.createElement("form");
const formInput = document.createElement("input");
formInput.setAttribute("type", "text")
formInput.setAttribute("name", "name")
formInput.style.border = "1px solid #ccc"
formInput.style.padding = "0.5rem"
formInput.style.margin = "0.5rem 0"
const formButton = document.createElement("n-button");
formButton.innerHTML = "submit"
form.onsubmit = (e) => {
  e.preventDefault()
  const formData = new FormData(form);
  console.log(formData.get("name")?.toString())
}

form.appendChild(formInput);
form.appendChild(formButton);

const app = document.getElementById("app");
if (app) {
  app.appendChild(h1);
  app.appendChild(nButton);
  nButton.setAttribute("type", "anchor");
  app.appendChild(form);
  formButton.setAttribute("type", "submit");
}

setInterval(() => {
  nButton.setAttribute("disabled", `${Math.random() > 0.5}`);
}, 1000);

declare global {
    interface HTMLElementTagNameMap {
        "n-button": InstanceType<typeof ButtonElement>;
    }
    interface HTMLElementEventMap {
        "on-click": CustomEvent<{ count: number }>;
    }
}