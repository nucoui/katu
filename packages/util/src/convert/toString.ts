const toString = (value: string | null): string | null => {
  if (value === null || value === "") {
    return null;
  }

  return String(value);
};

export { toString };
