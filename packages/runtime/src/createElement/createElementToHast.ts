import type { KatuNode } from "@/types/KatuNode";
import type { Element, ElementContent, Root, RootContent, Text } from "hast";

export async function createElementToHast(katuNode: KatuNode): Promise<Element | Text | Root> {
  if (Array.isArray(katuNode)) {
    return {
      type: "root",
      children: (await Promise.all(katuNode.map(createElementToHast))) as RootContent[],
    };
  }
  if (typeof katuNode === "string") {
    return {
      type: "text",
      value: katuNode,
    };
  }
  if (katuNode === undefined || katuNode === null) {
    return {
      type: "root",
      children: [],
    };
  }
  const { tag, props } = katuNode;

  if (typeof tag === "function") {
    return await createElementToHast(await tag(props));
  }

  const { children, ...rest } = props;
  const attributes = Object.entries(rest).reduce((acc, [key, value]) => {
    acc[key] = String(value);
    return acc;
  }, {} as Record<string, string>);

  if (Array.isArray(children)) {
    const childNodes = await Promise.all(children.map((child) => createElementToHast(child as KatuNode)));
    return {
      type: "element",
      tagName: tag,
      properties: attributes,
      children: childNodes as ElementContent[],
    };
  }

  return {
    type: "element",
    tagName: tag,
    properties: attributes,
    children: children ? [(await createElementToHast(children as KatuNode)) as ElementContent] : [],
  };
}
