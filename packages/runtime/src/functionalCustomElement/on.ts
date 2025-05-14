const onConnectedBase = (callback: () => void, constructor: any) => {
  constructor.prototype.handleConnected = callback;
};

export {
  onConnectedBase,
};
