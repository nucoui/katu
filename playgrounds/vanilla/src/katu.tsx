// @ts-nocheck

// import "katu" type
type Connected = () => void;
type Disconnected = () => void;
type AttributeChanged = (name: keyof Props, prevVal: Props[Parameters<AttributeChanged>[0]], newVal: Props[Parameters<AttributeChanged>[0]]) => void;

import { signal, effect } from "@katu/reactivity";
import { connected, disconnected, attributeChanged } from "katu";

type Props = {
  title: string
}

const Counter = ({ title }: Props) => {
  const [count, setCount] = signal(0);

  connected(() => {
    console.log("Counter connected");
  })

  disconnected(() => {
    console.log("Counter disconnected");
  })

  attributeChanged((name, prevVal, newVal) => {
    console.log(`${name}'s value has been changed from ${oldValue} to ${newValue}`);
  })

  return (
    <div>
      <p>{title} counter: {count()}</p>
      <button
        class="btn"
        onClick={() => setCount((prev) => prev + 1)}
      >
        Increment
      </button>
    </div>
  );
}
