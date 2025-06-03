"use client";

import type { PropsWithChildren } from "react";
import { Button, ButtonStyle } from "../../chatora/Button"
import { ChatoraWrapper } from "@chatora/react/components/ChatoraWrapper";
import type { Props as ButtonProps, Emits } from "../../chatora/Button";

type Props = PropsWithChildren<ButtonProps & Partial<Emits>>

export const NButton = ({ children, ...props }: Props) => {
  return (
    <>
      <ChatoraWrapper
        tag="n-button"
        props={props}
        component={Button}
        children={children}
        styles={[ButtonStyle]}
      />
    </>
  )
};
