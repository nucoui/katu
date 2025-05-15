import { functionalCustomElement } from "@katu/runtime";

  const convertToBoolean = (value: string | null) => {
    if (value === null) {
      return false;
    }
    if (value === "") {
      return true;
    }
    if (value === "true") {
      return true;
    }
    if (value === "false") {
      return false;
    }
    return Boolean(value);
  };

export const Button = functionalCustomElement(({
  reactivity: { signal, effect, computed },
  defineProps,
  defineEmits,
  onConnected,
  onDisconnected,
  onAttributeChanged,
  render
}) => {
  const props = defineProps(["disabled"]);
  const emits = defineEmits(["on-click", "on-disabled"]);

  const [clickCount, setClickCount] = signal(0);

  const disabled = computed(() => {
    return convertToBoolean(props().disabled);
  });

  const handleClick = () => {
    setClickCount(c => c + 1);
    emits("on-click", { count: clickCount() });
  };

  render(() => {
    return (
      // <>
      //   <button disabled={props().disabled === ""}>
      //     {props().disabled ? "Disabled" : "Enabled"}
      //   </button>
      //   <p>Disabled: {disabled}</p>
      // </>
      <button disabled={disabled()} onClick={handleClick}>
        {disabled() ? "Disabled" : <slot />}
      </button>
    );
  });
}, {
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
hogeButton.addEventListener("on-click", (e) => {
  console.log("Hoge Button clicked", e.detail.count);
})
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