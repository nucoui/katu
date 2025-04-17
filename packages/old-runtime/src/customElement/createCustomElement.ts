import type { FunctionComponentResult } from "@/types/KatuJSXElement";
import { createElement } from "@/createElement/createElement";
import { jsx } from "@/jsx-runtime/jsx-runtime";
import { effect } from "alien-signals";
import type { Element, Text, Root, ElementContent } from "hast";
import { createElementToHast } from "@/createElement/createElementToHast";
import { hastToDom, updateDom } from "../utils/domUtils";

/**
 * Creates a custom HTML element based on a given functional component.
 * @template P - The type of the props for the functional component.
 * @param {(props: P) => FunctionComponentResult} element - The functional component to render.
 * @returns {typeof HTMLElement} The custom HTML element class.
 */
export const createCustomElement = <P extends Record<string, unknown>>(element: (props: P) => FunctionComponentResult): typeof HTMLElement => {
  return class CustomElement extends HTMLElement {
    private props: Partial<P> = {};
    private container: Node | null = null;

    constructor() {
      super();
      this.attachShadow({ mode: "open" });
      this.updatePropsFromAttributes();
      this.setupEffect();
    }

    /**
     * Checks if a value is a valid number.
     * @param {string | null} value - The value to check.
     * @returns {boolean} True if the value is a number, false otherwise.
     */
    private isNumber(value: string | null): boolean {
      return value !== null && !Number.isNaN(Number(value));
    }

    /**
     * Checks if a value is a valid boolean.
     * @param {string | null} value - The value to check.
     * @returns {boolean} True if the value is a boolean, false otherwise.
     */
    private isBoolean(value: string | null): boolean {
      return value === "true" || value === "false";
    }

    /**
     * Updates the props of the custom element based on its attributes.
     */
    private updatePropsFromAttributes() {
      const attributes = this.getAttributeNames();
      attributes.forEach((name) => {
        const value = this.getAttribute(name);

        if (this.isNumber(value)) {
          this.props[name as keyof P] = Number(value) as P[keyof P];
        } else if (this.isBoolean(value)) {
          this.props[name as keyof P] = (value === "true") as P[keyof P];
        } else {
          this.props[name as keyof P] = value as P[keyof P];
        }
      });
    }

    /**
     * Renders the functional component into the shadow DOM.
     */
    private async render() {
      const newHastNode = await createElementToHast(jsx(element as (props: Record<string, unknown>) => FunctionComponentResult, this.props));
      if (this.container) {
        this.container = updateDom(this.container, newHastNode);
      } else {
        const shadow = this.shadowRoot!;
        this.container = hastToDom(newHastNode) as Node;
        shadow.appendChild(this.container);
      }
    }

    /**
     * Sets up a reactive effect to re-render the component when props change.
     */
    private setupEffect() {
      effect(() => {
        this.render();
      });
    }

    /**
     * Called when the custom element is added to the DOM.
     */
    connectedCallback() {
      this.updatePropsFromAttributes();
      this.render();
    }

    /**
     * Called when an observed attribute of the custom element changes.
     * @param {string} name - The name of the attribute that changed.
     * @param {string} _oldValue - The old value of the attribute.
     * @param {string} newValue - The new value of the attribute.
     */
    attributeChangedCallback(name: string, _oldValue: string, newValue: string) {
      if (this.isNumber(newValue)) {
        this.props[name as keyof P] = Number(newValue) as P[keyof P];
      } else if (this.isBoolean(newValue)) {
        this.props[name as keyof P] = (newValue === "true") as P[keyof P];
      } else {
        this.props[name as keyof P] = newValue as P[keyof P];
      }
      this.render();
    }

    /**
     * Specifies the attributes to observe for changes.
     * @returns {string[]} The list of observed attribute names.
     */
    static get observedAttributes() {
      return Object.keys({} as P);
    }
  };
};
