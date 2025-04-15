import type { KatuNode } from "@/types/KatuNode";

export async function render(katuNode: KatuNode): Promise<string> {
  if (Array.isArray(katuNode)) {
    const renderedChildren = await Promise.all(katuNode.map(render));
    return renderedChildren.join("");
  }
  if (typeof katuNode === "string") {
    return katuNode;
  }
  if (katuNode === undefined || katuNode === null) {
    return "";
  }
  const { tag, props } = katuNode;
  const repeat = typeof props.repeat === "number" ? props.repeat : 1;

  if (typeof tag === "function") {
    return (await render(await tag(props))).repeat(repeat);
  }

  const { children, ...rest } = props;
  const attributes = Object.entries(rest)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("");
  const innerHTML = await render(children as KatuNode);
  return `<${tag}${attributes}>${innerHTML}</${tag}>`.repeat(repeat);
}
