const Hoge = defineCustomElement<{id: string}>(({ onAttributeChanged }) => {
  // const id = props.id

  onAttributeChanged((name, oldValue, newValue) => {
    switch (name) {
      case "id":
        console.log("id changed", oldValue, newValue);
        break;
      default:
        console.log("other changed", name, oldValue, newValue);
        break;
    }
  });

  return (
    <div>
      <h1>Hello World</h1>
      <p>{"Hoge"}</p>
    </div>
  );
}, {
  shadowRoot: true,
  shadowRootMode: 'open'
});


customElements.define("hoge-element", Hoge);

const app = document.getElementById("app");
if (app) {
  const element = document.createElement("hoge-element");
  app.appendChild(element);
}

