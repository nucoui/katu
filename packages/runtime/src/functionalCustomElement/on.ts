const onConnectedBase = (callback: () => void, constructor: any) => {
  constructor.prototype.handleConnected = callback;
};

const onDisconnectedBase = (callback: () => void, constructor: any) => {
  constructor.prototype.handleDisconnected = callback;
};

const onAdopted = (callback: () => void, constructor: any) => {
  constructor.prototype.handleAdopted = callback;
};

const onAttributeChangedBase = (callback: (name: string, oldValue: string | null, newValue: string | null) => void, constructor: any) => {
  constructor.prototype.handleAttributeChanged = callback;
};

export {
  onAdopted,
  onAttributeChangedBase,
  onConnectedBase,
  onDisconnectedBase,
};
