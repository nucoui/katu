/**
 * Converts a JavaScript value to its literal string representation.
 * This is useful for code generation scenarios.
 *
 * @param value - The value to convert to a literal
 * @returns The string representation of the value as it would appear in code
 */
const toLiteral = (value: unknown): string => {
  if (value === undefined) {
    return "undefined";
  }

  if (value === null) {
    return "null";
  }

  if (typeof value === "string") {
    return `"${value.replace(/"/g, "\\\"")}"`;
  }

  if (typeof value === "bigint") {
    return `${value}n`;
  }

  if (typeof value === "symbol") {
    return `Symbol(${value.description ? `"${value.description}"` : ""})`;
  }

  if (typeof value === "function") {
    return value.toString();
  }

  if (Array.isArray(value)) {
    const items = value.map(item => toLiteral(item)).join(", ");
    return `[${items}]`;
  }

  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, val]) => {
        const propName = /^[a-z_$][\w$]*$/i.test(key)
          ? key
          : `"${key.replace(/"/g, "\\\"")}"`;
        return `${propName}: ${toLiteral(val)}`;
      })
      .join(", ");
    return `{${entries}}`;
  }

  // For primitive types like number, boolean
  return String(value);
};

export { toLiteral };
