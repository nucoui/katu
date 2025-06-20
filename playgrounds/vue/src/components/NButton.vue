<script setup lang="ts">
import type { ToVueEmits } from "@chatora/vue"
import { Button, type Emits, type Props } from "../../chatora/Button"
import ChatoraWrapper from "@chatora/vue/components/ChatoraWrapper.vue"

const props = defineProps<Props>()
type VueEmits = /* @vue-ignore */ ToVueEmits<Emits>;
defineEmits<VueEmits>()
</script>

<template>
  <ChatoraWrapper
    tag="n-button"
    :component="Button"
    :props
  >
    <slot />
  </ChatoraWrapper>
</template>