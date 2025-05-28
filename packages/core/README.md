# Chatora.js

## Description
It is a framework that allows you to implement custom elements in a React-like manner.
Usually, knowledge of classes is required, but since the implementation is function-based, this knowledge is not necessary!

## Packages

| Name | Description | NPM link |
| ---- | ----------- | -------- |
| chatora | Core package of the project. Users will use this package. | [chatora](https://www.npmjs.com/package/chatora) |
| @chatora/runtime | Package providing functionality to convert JSX syntax to custom element classes. Also includes implementation to make code transpiled by tsc's react-jsx reactive using packages/reactivity. | [@chatora/runtime](https://www.npmjs.com/package/@chatora/runtime) |
| @chatora/reactivity | Package to make variables used in JSX syntax reactive. Uses alien-signals, customized to provide our own implementation. | [@chatora/reactivity](https://www.npmjs.com/package/@chatora/reactivity) |
| @chatora/util | Package providing utility functions for the project. This package is used by other packages. | [@chatora/util](https://www.npmjs.com/package/@chatora/util) |
| @chatora/react | Package that provides wrapper components and functionality to make Chatora.js work with React's SSR/CSR | [@chatora/react](https://www.npmjs.com/package/@chatora/react) |

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