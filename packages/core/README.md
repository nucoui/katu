# Chatora

## Description
It is a framework that allows you to implement custom elements in a React-like manner.
Usually, knowledge of classes is required, but since the implementation is function-based, this knowledge is not necessary!

# Installation

### 1. Install the package
```bash
npm install chatora
```

### 2. Setting `tsconfig.json`
```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "chatora"
  }
}
```

### 3. Create a custom element
```tsx
import { functionalCustomElement, ChatoraComponent } from "chatora";

const Comp: ChatoraComponent = ({ reactivity: { signal }, render }) => {
    const [count, setCount] = signal(0);

    render(() => {
      return (
        <div>
          <h1>Mini</h1>
          <p>Count: {count()}</p>
          <button onClick={() => setCount((c) => c + 1)}>Increment</button>
          <button onClick={() => setCount((c) => c - 1)}>Decrement</button>
        </div>
      );
    });
  }

const MiniElement = functionalCustomElement(Comp, {
  shadowRoot: true,
});
```

### 4. Use the custom element
```html
<ce-comp></ce-comp>

<script type="module">
  import { Comp } from "./Comp.js";
  customElements.define("ce-comp", Comp);
</script>
```

### Eponym
**chatora**(*/t͡ɕa toɾa/*) means tabby in Japanese