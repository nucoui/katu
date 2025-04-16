import type { Element, Text, Root, ElementContent, RootContent } from "hast";

/**
 * Converts a HAST (Hypertext Abstract Syntax Tree) node to a DOM node.
 * @param {Element | Text | Root} hast - The HAST node to convert.
 * @returns {Node} The corresponding DOM node.
 */
export function hastToDom(hast: Element | Text | Root): Node {
  if (hast.type === "text") {
    return document.createTextNode(hast.value);
  }

  if (hast.type === "element") {
    const element = document.createElement(hast.tagName);
    if (hast.properties) {
      Object.entries(hast.properties).forEach(([key, value]) => {
        if (value !== undefined) {
          element.setAttribute(key, value as string);
        }
      });
    }
    if (hast.children) {
      hast.children.forEach((child: RootContent) => {
        if (child.type === "element" || child.type === "text") {
          element.appendChild(hastToDom(child));
        }
      });
    }
    return element;
  }

  const fragment = document.createDocumentFragment();
  if (hast.children) {
    hast.children.forEach((child: RootContent) => {
      if (child.type === "element" || child.type === "text") {
        fragment.appendChild(hastToDom(child));
      }
    });
  }
  return fragment;
}

/**
 * Updates an existing DOM node to match a new HAST node.
 * @param {Node} existingNode - The existing DOM node to update.
 * @param {Element | Text | Root} newHast - The new HAST node to apply.
 * @returns {Node} The updated DOM node.
 */
export function updateDom(existingNode: Node, newHast: Element | Text | Root): Node {
  if (newHast.type === "text") {
    if (existingNode.nodeType === Node.TEXT_NODE && existingNode.textContent !== newHast.value) {
      existingNode.textContent = newHast.value;
    }
    return existingNode;
  }

  if (newHast.type === "element") {
    if (existingNode.nodeType === Node.ELEMENT_NODE && (existingNode as HTMLElement).tagName.toLowerCase() === newHast.tagName) {
      const element = existingNode as HTMLElement;

      // Update attributes
      const newProps = newHast.properties || {};
      const existingProps = Array.from(element.attributes).reduce((acc, attr) => {
        acc[attr.name] = attr.value;
        return acc;
      }, {} as Record<string, string>);

      Object.keys(newProps).forEach((key) => {
        if (newProps[key] !== existingProps[key]) {
          element.setAttribute(key, newProps[key] as string);
        }
      });

      Object.keys(existingProps).forEach((key) => {
        if (!(key in newProps)) {
          element.removeAttribute(key);
        }
      });

      // Update children
      const newChildren = newHast.children || [];
      const existingChildren = Array.from(element.childNodes);

      newChildren.forEach((child: RootContent, index: number) => {
        if (child.type === "element" || child.type === "text") {
          if (existingChildren[index]) {
            updateDom(existingChildren[index], child);
          } else {
            element.appendChild(hastToDom(child));
          }
        }
      });

      while (existingChildren.length > newChildren.length) {
        const childToRemove = existingChildren[existingChildren.length - 1];
        if (childToRemove.parentNode === element) {
          element.removeChild(childToRemove);
        } else {
          console.warn("Attempted to remove a node that is not a child of the parent.", childToRemove);
        }
        existingChildren.pop();
      }

      return element;
    }

    // Replace node if tagName doesn't match
    const newElement = hastToDom(newHast);
    if (existingNode.parentNode) {
      existingNode.parentNode.replaceChild(newElement, existingNode);
    }
    return newElement;
  }

  // Handle root or fragment
  const fragment = document.createDocumentFragment();
  if (newHast.children) {
    newHast.children.forEach((child: RootContent) => {
      if (child.type === "element" || child.type === "text") {
        fragment.appendChild(hastToDom(child));
      }
    });
  }
  if (existingNode.parentNode) {
    existingNode.parentNode.replaceChild(fragment, existingNode);
  }
  return fragment;
}