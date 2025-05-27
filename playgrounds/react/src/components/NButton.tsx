import { ChatoraWrapper } from "@chatora/react/components/ChatoraWrapper";
import { Button, ButtonStyle } from "../../chatora/Button"
import { type PropsWithChildren } from "react";

export const NButton = ({children}: PropsWithChildren) => {
  return <ChatoraWrapper
    tag="n-button"
    component={Button}
    children={children}
    style={[ButtonStyle]}
  />;
}