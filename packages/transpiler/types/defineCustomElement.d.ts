declare function defineCustomElement<Props extends Record<string, unknown>>(
  render: (helpers: {
    props: Props;
    constructor: (callback: () => void) => void;
    render: (callback: () => JSX.Element) => void;
    onConnected: (callback: () => void) => void;
    onDisconnected: (callback: () => void) => void;
    onAttributeChanged: (callback: <Prop extends keyof Props>(name: Prop, oldValue: Props[Prop] | null, newValue: Props[Prop]) => void) => void;
    onAdopted: (callback: () => void) => void;
  }) => void,
  options: ({
    nonce?: string;
    isFormAssociated?: boolean;
  }) & ({
    shadowRoot: true;
    shadowRootMode?: "open" | "closed";
  } | {
    shadowRoot?: false;
    shadowRootMode?: never;
  })
): CustomElementConstructor;
