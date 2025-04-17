import type { KatuNode } from "@/types/KatuNode";
import type { Element, Root } from "hast";
import { createElementToHast } from "@/main";
import { effect } from "alien-signals";
import { hastToDom, updateDom } from "../utils/domUtils";

/**
 * Creates a DOM node from a KatuNode by converting it to a HAST node first.
 * @param {KatuNode} katuNode - The KatuNode to convert and render.
 * @returns {Promise<Node>} A promise that resolves to the created DOM node.
 */
export async function createElement(katuNode: KatuNode): Promise<Node> {
  const hastNode = await createElementToHast(katuNode);

  let domNode = hastToDom(hastNode);

  /**
   * Watches for changes in the signal and updates the DOM node accordingly.
   */
  effect(async () => {
    const updatedHastNode = await createElementToHast(katuNode);
    domNode = updateDom(domNode, updatedHastNode);
  });

  return domNode;
}
