import { functionalCustomElement } from "tora";
import type { ToraComponent } from "tora";
import style from "./Button.scss?raw";
import { clsx } from "clsx";
import z from "zod/v4"

const TypeSchema = z.literal(["anchor", "submit", "reset", "toggle", "button"])

const ButtonComponent: ToraComponent = ({
  reactivity: { signal, effect, computed },
  defineProps,
  defineEmits,
  onConnected,
  onDisconnected,
  onAttributeChanged,
  render,
  getHost
}) => {
  const props = defineProps([
    "variant",
    "disabled",
    "width",
    "size",
    "type",
    "href",
    "target",
  ]);
  const emits = defineEmits(["on-click", "on-disabled"]);

  const type = computed(() => {
    return TypeSchema.parse(props().type || "button")
  });

  const disabled = computed(() => {
    return props().disabled === "" || props().disabled === "true";
  });

  const handleClick = (e: MouseEvent) => {
    emits("on-click", e);

    if (type() === "submit") {
      getHost().closest("form")?.requestSubmit();
    }
  };

  const commonAttr = computed(() => ({
    class: clsx("n-button", `-${props().variant ?? "primary"}`, `n-button-${props().size ?? "medium"}`, {
      "-anchor": type() === "anchor",
      "-toggle": type() === "toggle",
      "-auto": props().width === "auto",
    }),
    disabled: disabled(),
    "aria-disabled": disabled(),
    onClick: handleClick,
  }))

  render(() => {
    if (type() === "anchor") {
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

    if (type() === "submit") {
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
        type={type()}
        {...commonAttr()}
      >
        <span class="contents">
          <slot />
        </span>
      </button>
    )
  })
}

export const Button = functionalCustomElement(ButtonComponent, { style: [ style ] });

customElements.define("n-button", Button);

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

declare global {
    interface HTMLElementTagNameMap {
        "n-button": InstanceType<typeof Button>;
    }
    interface HTMLElementEventMap {
        "on-click": CustomEvent<{ count: number }>;
    }
}