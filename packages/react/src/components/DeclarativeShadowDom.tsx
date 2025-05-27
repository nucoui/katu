import type { ChatoraWrapper } from "@/main";
import type { FunctionalCustomElementOptions } from "chatora";
import type { ComponentProps, FC, useId } from "react";
import { hastToJsx } from "@/utils/hastToJsx";
import { functionalDeclarativeCustomElement } from "chatora";

type Props = Omit<
  ComponentProps<typeof ChatoraWrapper>,
  "element"
> & {
  id: ReturnType<typeof useId>;
} & FunctionalCustomElementOptions;

export const DeclarativeShadowDom: FC<Props> = ({ tag, id, component, children, ...option }) => {
  const hast = functionalDeclarativeCustomElement(
    component,
    option,
  );

  return hastToJsx(tag, id, hast, children);
};
