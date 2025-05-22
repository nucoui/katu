import { functionalCustomElement } from "chatora";
import type { ChatoraComponent } from "chatora";
import style from "./Button.scss?raw";
import { clsx } from "clsx";
import { toBoolean, toMatched } from "@chatora/util";

const Button: ChatoraComponent = ({
  reactivity: { signal, effect, computed },
  defineProps,
  defineEmits,
  onConnected,
  onDisconnected,
  onAttributeChanged,
  render,
  getHost
}) => {
  const props = defineProps({
    type: (v) => toMatched(v, ["anchor", "submit", "reset", "toggle", "button"]) ?? "button",
    variant: (v) => v,
    size: (v) => v,
    disabled: (v) => toBoolean(v) ?? false,
    href: (v) => v,
    target: (v) => v,
    width: (v) => v
  });
  const emits = defineEmits(["on-click"]);

  const handleClick = (e: MouseEvent) => {
    if (props().disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    emits("on-click", e);

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
    if (props().type === "anchor") {
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

    if (props().type === "submit") {
      return (
        <button
          type="submit"
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
        type={props().type}
        {...commonAttr()}
      >
        <span class="contents">
          <slot />
        </span>
      </button>
    )
  })
}

export const ButtonElement = functionalCustomElement(Button, { style: [ style ] });

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