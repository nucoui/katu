<script setup lang="ts">
import { Button, ButtonStyle, type Props } from "../../chatora/Button"
import ChatoraWrapper from "@chatora/vue/components/ChatoraWrapper.vue"

const props = defineProps<Props>()

const emits = defineEmits<{
  click: [Event]
  hover: [Event]
  event: [Event]
}>()
</script>

<template>
  <ChatoraWrapper
    tag="n-button"
    :component="Button"
    :props="{
      ...props,
      'on-click': (e: Event) => emits('click', e),
      'on-hover': (e: Event) => emits('hover', e),
      'on-event': (e: Event) => emits('event', e),
    }"
    :styles="ButtonStyle"
    :shadow-root="true"
  >
    <slot />
  </ChatoraWrapper>
</template>