import { functionalCustomElement } from "@tora/runtime";
import style from "./Button.scss?raw";
import { clsx } from "clsx";

const convertToType = (type: string): 'anchor' | 'submit' | 'reset' | "toggle" | 'button' => {
  switch (type) {
    case "anchor":
      return "anchor";
    case "submit":
      return "submit";
    case "reset":
      return "reset";
    case "toggle":
      return "toggle";
    default:
      return "button";
  }
}

export const Button = functionalCustomElement(({
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
    return convertToType(props().type || "button");
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
    console.log("render", type(), disabled());
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
    } else if (type() === "submit") {
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
    } else (
      <button
        type={type()}
        {...commonAttr()}
      >
        <span class="contents">
          <slot />
        </span>
      </button>
    );
  });
}, { style });

customElements.define("n-button", Button);

const nButton = document.createElement("n-button")
nButton.innerHTML = "Button";
nButton.addEventListener("on-click", (e) => {
  console.log("Hoge Button clicked", e.detail);
})

const app = document.getElementById("app");
if (app) {
  app.appendChild(nButton);
  nButton.setAttribute("type", "anchor");
}

declare global {
    interface HTMLElementTagNameMap {
        "n-button": InstanceType<typeof Button>;
    }
    interface HTMLElementEventMap {
        "on-click": CustomEvent<{ count: number }>;
    }
}