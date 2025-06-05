"use client";

import type { PropsWithChildren } from "react";
import { Button, ButtonStyle } from "../../chatora/Button"
import { ChatoraWrapper } from "@chatora/react/components/ChatoraWrapper";
import type { Props as ButtonProps, Emits } from "../../chatora/Button";
import type { toReactEmits } from "@chatora/react";

export const NButton = ({
  children,
  ...props
}: PropsWithChildren<ButtonProps & toReactEmits<Emits>>) => ChatoraWrapper({
  tag: "n-button",
  props,
  component: Button,
  children,
  styles: [ButtonStyle],
})
