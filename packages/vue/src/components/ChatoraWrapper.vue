<script setup lang="tsx">
import { type ChatoraComponent, functionalCustomElement, type FunctionalCustomElementOptions, functionalDeclarativeCustomElement } from "chatora";
import { defineProps, h, onMounted, ref, useId, useSlots } from "vue";
import { hastToJsx } from "../utils/hastToJsx";

type Props<P extends Record<string, unknown>> = {
  props: P;
  tag: string;
  component: ChatoraComponent;
} & FunctionalCustomElementOptions;

const {
  tag,
  props: initialProps,
  component,
  ...options
} = defineProps<Props<Record<string, unknown>>>();

const isDefined = ref(false);
const id = useId();
const slots = useSlots();

const tagRef = ref<HTMLElement | null>(null);

const splitProps = (props: Record<string, unknown>) => {
  const emits: Record<string, (event: Event) => void> = {};
  const filteredProps: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(props)) {
    if (key.startsWith("on-") && typeof value === "function") {
      emits[key] = value as (event: Event) => void;
    }
    else {
      filteredProps[key] = value;
    }
  }
  return { props: filteredProps, emits };
};

const { props, emits } = splitProps(initialProps);

const hast = functionalDeclarativeCustomElement(
  component,
  {
    ...options,
    props: props as Record<string, string | null>,
  },
);

onMounted(() => {
  if (!customElements || customElements.get(tag)) {
    return;
  }

  const Element = functionalCustomElement(
    component,
    options,
  );

  customElements.define(tag, Element);
  isDefined.value = true;

  if (tagRef.value) {
    for (const [key, value] of Object.entries(emits)) {
      if (typeof value === "function") {
        tagRef.value.addEventListener(key, value as EventListener);
      }
    }
  }
});

defineRender(() => {
  // スロット内容を配列として処理
  const slotContent = slots.default ? slots.default() : [];

  return h(tag as any, {
    ref: tagRef,
    ...props,
    // ...emits,
  }, isDefined.value
    ? slotContent
    : hastToJsx(tag, id, hast, slotContent));
});
</script>
