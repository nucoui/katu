import type { ChatoraComponent, FunctionalCustomElementOptions } from "chatora";
import { DeclarativeShadowDom } from "@/components/DeclarativeShadowDom";
import { ShadowDom } from "@/components/ShadowDom";
import { type FC, type PropsWithChildren, useId } from "react";

type Props = PropsWithChildren<{
  tag: string;
  component: ChatoraComponent;
} & FunctionalCustomElementOptions>;

export const ChatoraWrapper: FC<Props> = (props) => {
  const id = useId();

  return (
    <>
      <ShadowDom {...props} id={id} />
      <DeclarativeShadowDom {...props} id={id} />
    </>
  );
};
