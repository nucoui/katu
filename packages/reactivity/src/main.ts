import type { Dependency, Link, Subscriber } from "alien-signals";
import { createReactiveSystem, SubscriberFlags } from "alien-signals";

const {
  link,
  propagate,
  endTracking,
  startTracking,
  updateDirtyFlag,
  processComputedUpdate,
  processEffectNotifications,
} = createReactiveSystem({
  updateComputed(computed: Computed) {
    return computed.update();
  },
  notifyEffect(effect: Effect) {
    effect.notify();
    return true;
  },
});

let activeSub: Subscriber | undefined;
let batchDepth = 0;

function startBatch(): void {
  ++batchDepth;
}

function endBatch(): void {
  if (!--batchDepth) {
    processEffectNotifications();
  }
}

function signal<T>(initialValue: T): [() => T, (value: T | ((prev: T) => T)) => void] {
  let value = initialValue;
  const dep = {
    subs: undefined,
    subsTail: undefined,
  };

  const getter = () => {
    if (activeSub) {
      link(dep, activeSub);
    }
    return value;
  };

  const setter = (newValue: T | ((prev: T) => T)) => {
    const resolvedValue = typeof newValue === "function" ? (newValue as (prev: T) => T)(value) : newValue;
    if (value !== resolvedValue) {
      value = resolvedValue;
      if (dep.subs) {
        propagate(dep.subs);
        processEffectNotifications();
      }
    }
  };

  return [getter, setter];
}

class Signal<T = any> implements Dependency {
  // Dependency fields
  subs: Link | undefined = undefined;
  subsTail: Link | undefined = undefined;

  constructor(
    public currentValue: T,
  ) { }

  get(): T {
    if (activeSub !== undefined) {
      link(this, activeSub);
    }
    return this.currentValue;
  }

  set(value: T): void {
    if (this.currentValue !== value) {
      this.currentValue = value;
      const subs = this.subs;
      if (subs !== undefined) {
        propagate(subs);
        if (!batchDepth) {
          processEffectNotifications();
        }
      }
    }
  }
}

function computed<T>(getter: () => T): () => T {
  const computedInstance = new Computed<T>(getter);
  return () => computedInstance.get();
}

class Computed<T = any> implements Subscriber, Dependency {
  currentValue: T | undefined = undefined;

  // Dependency fields
  subs: Link | undefined = undefined;
  subsTail: Link | undefined = undefined;

  // Subscriber fields
  deps: Link | undefined = undefined;
  depsTail: Link | undefined = undefined;
  flags: SubscriberFlags = SubscriberFlags.Computed | SubscriberFlags.Dirty;

  constructor(
    public getter: () => T,
  ) { }

  get(): T {
    const flags = this.flags;
    if (flags & (SubscriberFlags.PendingComputed | SubscriberFlags.Dirty)) {
      processComputedUpdate(this, flags);
    }
    if (activeSub !== undefined) {
      link(this, activeSub);
    }
    return this.currentValue!;
  }

  update(): boolean {
    const prevSub = activeSub;
    // eslint-disable-next-line ts/no-this-alias
    activeSub = this;
    startTracking(this);
    try {
      const oldValue = this.currentValue;
      const newValue = this.getter();
      if (oldValue !== newValue) {
        this.currentValue = newValue;
        return true;
      }
      return false;
    }
    finally {
      activeSub = prevSub;
      endTracking(this);
    }
  }
}

function effect<T>(fn: () => T): Effect<T> {
  const e = new Effect(fn);
  e.run();
  return e;
}

class Effect<T = any> implements Subscriber {
  // Subscriber fields
  deps: Link | undefined = undefined;
  depsTail: Link | undefined = undefined;
  flags: SubscriberFlags = SubscriberFlags.Effect;

  constructor(
    public fn: () => T,
  ) { }

  notify(): void {
    const flags = this.flags;
    if (
      flags & SubscriberFlags.Dirty
      || (flags & SubscriberFlags.PendingComputed && updateDirtyFlag(this, flags))
    ) {
      this.run();
    }
  }

  run(): T {
    const prevSub = activeSub;
    // eslint-disable-next-line ts/no-this-alias
    activeSub = this;
    startTracking(this);
    try {
      return this.fn();
    }
    finally {
      activeSub = prevSub;
      endTracking(this);
    }
  }

  stop(): void {
    startTracking(this);
    endTracking(this);
  }
}

export {
  computed,
  Computed,
  effect,
  Effect,
  endBatch,
  signal,
  Signal,
  startBatch,
};
