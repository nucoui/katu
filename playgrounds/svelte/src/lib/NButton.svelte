<script lang="ts">
import { Button, type Props, type Emits } from "../../chatora"
import { ChatoraWrapper } from "@chatora/svelte";

type $$Props = Props & Emits;
</script>

<ChatoraWrapper
  component={Button}
  tag="n-button"
  props={$$restProps}
>
  <slot />
</ChatoraWrapper>