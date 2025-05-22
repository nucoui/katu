/**
 * Checks if the provided value matches any element in the array
 * @param value - The value to check against the array
 * @param matchArray - The array of string values to match against
 * @returns The value if it matches any element in the array, null otherwise
 */
const toMatched = <const T extends string>(
  value: string | null,
  matchArray: readonly T[],
): T | null => {
  if (value === null) {
    return null;
  }

  if (matchArray.includes(value as any)) {
    return value as T;
  }

  return null;
};

export { toMatched };
