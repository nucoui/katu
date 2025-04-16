import type { KatuNode } from "@/types/KatuNode";

export async function createElementToString(katuNode: KatuNode): Promise<string> {
  if (Array.isArray(katuNode)) {
    const renderedChildren = await Promise.all(katuNode.map(createElementToString));
    return renderedChildren.join("");
  }
  if (typeof katuNode === "string") {
    return katuNode;
  }
  if (katuNode === undefined || katuNode === null) {
    return "";
  }
  const { tag, props } = katuNode;

  if (typeof tag === "function") {
    return (await createElementToString(await tag(props)));
  }

  const { children, ...rest } = props;
  const attributes = Object.entries(rest)
    .map(([key, value]) => ` ${key}="${value}"`)
    .join("");
  const innerHTML = await createElementToString(children as KatuNode);
  return `<${tag}${attributes}>${innerHTML}</${tag}>`;
}
