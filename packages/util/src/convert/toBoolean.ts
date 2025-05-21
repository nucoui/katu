const toBoolean = (value: string | null): boolean | null => {
  if (value === "" || value === "true") {
    return true;
  }

  if (value === null || value === "false") {
    return false;
  }

  return null;
};

export { toBoolean };
