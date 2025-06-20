import type { Props as ChatoraWrapperProps } from "@/components/ChatoraWrapper";
import type { useId } from "react";
import { hastToJsx } from "@/utils/hastToJsx";
import { functionalDeclarativeCustomElement } from "chatora";
import { jsx } from "react/jsx-runtime";

type Props<P extends Record<string, unknown>> = Omit<
  ChatoraWrapperProps<P>,
  "element"
> & {
  id: ReturnType<typeof useId>;
};

export const DeclarativeShadowDom = <P extends Record<string, unknown>>({
  tag,
  id,
  component,
  children,
  props: _props,
}: Props<P>) => {
  const hast = functionalDeclarativeCustomElement(
    component,
    {
      props: _props as P,
    },
  );

  return jsx(tag as any, {
    children: hastToJsx(tag, id, hast, children),
  });
};
