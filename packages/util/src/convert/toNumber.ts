const toNumber = (value: string | null): number | null => {
  if (value === null || value === "") {
    return null;
  }

  const numberValue = Number(value);

  return Number.isNaN(numberValue) ? null : numberValue;
};

export { toNumber };
