import { functionalCustomElement } from "@katu/runtime";

export const Button = functionalCustomElement<["disabled"]>(({
  reactivity: { signal, effect, computed },
  props,
  onConnected,
  onDisconnected,
  onAttributeChanged,
  render
}) => {
  // effect(() => {
  //   console.log("disabled", props().disabled);
  // });

  const disabled = computed(() => {
    return props().disabled === "";
  });

  render(() => {
    return (
      // <>
      //   <button disabled={props().disabled === ""}>
      //     {props().disabled ? "Disabled" : "Enabled"}
      //   </button>
      //   <p>Disabled: {disabled}</p>
      // </>
      <button disabled={disabled()}>
        {disabled() ? "Disabled" : <slot />}
      </button>
    );
  });
}
, {
  shadowRoot: true,
  shadowRootMode: "open",
  propsNames: ["disabled"],
  style: `
    button {
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      padding: 10px 20px;
      font-size: 16px;
      cursor: pointer;
    }
    button[disabled] {
      background-color: #ccc;
      cursor: not-allowed;
    }
  `,
});

customElements.define("hoge-button", Button);

const hogeButton = document.createElement("hoge-button") as InstanceType<typeof Button>;
hogeButton.innerHTML = "Hoge Button";
setInterval(() => {
  if (hogeButton.getAttribute("disabled") === "") {
    hogeButton.removeAttribute("disabled");
  }
  else {
    hogeButton.setAttribute("disabled", "");
  }
}, 1000);

const app = document.getElementById("app");
if (app) {
  app.appendChild(hogeButton);
}