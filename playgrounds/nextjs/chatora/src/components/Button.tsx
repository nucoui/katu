import type { ChatoraComponent } from "chatora";

export const Button: ChatoraComponent = ({ render }) => {
  render(() => {
    return (
      <button>
        aaaa
        <slot />
        <slot name="slot1" />
      </button>
    );
  })
}

export const ButtonStyle = `
  button {
    color: red;
    background-color: yellow;
    border: 1px solid black;
    padding: 10px;
    border-radius: 5px;
    }
    button:hover {
    background-color: orange;
  }
`
