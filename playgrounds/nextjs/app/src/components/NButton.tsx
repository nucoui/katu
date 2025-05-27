"use client";

import { PropsWithChildren, useId } from "react";
import { Button, ButtonStyle } from "@next/chatora"
import { ChatoraWrapper } from "@chatora/react/components/ChatoraWrapper";

export const NButton = ({ children }: PropsWithChildren) => {
  return (
    <>
      <ChatoraWrapper
        tag="n-button"
        component={Button}
        children={children}
        style={[ButtonStyle]}
      />
    </>
  )
};
