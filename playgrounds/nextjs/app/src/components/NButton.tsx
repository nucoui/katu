"use client";

import { PropsWithChildren } from "react";
import { Button, ButtonStyle } from "@next/chatora"
import { ChatoraWrapper } from "@chatora/react/components/ChatoraWrapper";
import type { Props as ButtonProps, Emits } from "@next/chatora";

type Props = PropsWithChildren<ButtonProps & Partial<Emits>>

export const NButton = ({ children, ...props }: Props) => {
  return (
    <>
      <ChatoraWrapper
        tag="n-button"
        props={{
          type: props.type,
        }}
        component={Button}
        children={children}
        styles={[ButtonStyle]}
      />
    </>
  )
};
