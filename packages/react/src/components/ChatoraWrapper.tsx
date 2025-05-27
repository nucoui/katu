import { hastToJsx } from "@/utils/hastToJsx";
import { type ChatoraComponent, functionalCustomElement, type FunctionalCustomElementOptions, functionalDeclarativeCustomElement } from "chatora";
import { type PropsWithChildren, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { jsx } from "react/jsx-runtime";

export type Props<P extends Record<string, unknown>> = PropsWithChildren<{
  props: P;
  tag: string;
  component: ChatoraComponent;
} & FunctionalCustomElementOptions>;

const splitProps = (props: Record<string, unknown>) => {
  const emits: Record<string, (event: Event) => void> = {};
  const filteredProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("on-") && typeof value === "function") {
      emits[key] = value as (event: Event) => void;
    }
    else {
      filteredProps[key] = value;
    }
  }
  return { props: filteredProps, emits };
};

export const ChatoraWrapper = <P extends Record<string, unknown>>({ tag, component, children, props, ...option }: Props<P>) => {
  const id = useId();

  const { props: filteredProps, emits } = splitProps(props || {});
  const hast = functionalDeclarativeCustomElement(
    component,
    option,
  );

  const [isDefined, setIsDefined] = useState(false);
  const domRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const defineElement = () => {
      if (!customElements || customElements.get(tag)) {
        return;
      }

      const element = functionalCustomElement(
        component,
        option,
      );

      customElements.define(tag, element);
      setIsDefined(true);
    };

    defineElement();
  }, [tag, component, option]);

  useLayoutEffect(() => {
    emits && Object.entries(emits).forEach(([event, handler]) => {
      if (typeof handler === "function" && domRef.current) {
        domRef.current.addEventListener(event, handler as EventListener);
      }
    });
    // Cleanup
    return () => {
      emits && Object.entries(emits).forEach(([event, handler]) => {
        if (typeof handler === "function" && domRef.current) {
          domRef.current.removeEventListener(event, handler as EventListener);
        }
      });
    };
  }, [emits]);

  return jsx(tag as any, {
    ...filteredProps,
    ref: domRef,
    children: isDefined ? children : hastToJsx(tag, id, hast, children),
  });
};
