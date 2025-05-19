/**
 * Re-exports the core reactivity functions from alien-signals with custom wrappers
 * to match the expected interface for the Tora project.
 * @module @tora/reactivity
 */

import * as alienSignals from "alien-signals";

/**
 * Represents a signal function type
 */
export type Signal<T> = [() => T, (newValue: T | ((prev: T) => T)) => void];

/**
 * Represents a computed function type
 */
export type Computed<T> = () => T;

/**
 * Represents an effect function type
 */
export type Effect = () => void;

/**
 * Starts a batch of updates. Changes made to signals within a batch will trigger effects only once at the end.
 */
export function startBatch(): void {
  alienSignals.startBatch();
}

/**
 * Ends a batch of updates, triggering any pending effects.
 */
export function endBatch(): void {
  alienSignals.endBatch();
}

/**
 * Creates a reactive signal with the given initial value.
 * Returns a tuple containing a getter function and a setter function.
 *
 * @param initialValue - The initial value for the signal.
 * @returns A tuple containing [getter, setter] for the signal.
 */
export function signal<T>(initialValue: T): [() => T, (newValue: T | ((prev: T) => T)) => void] {
  const s = alienSignals.signal(initialValue);

  // Getter function
  const get = () => s();

  // Setter function that supports both direct value and updater function
  const set = (newValue: T | ((prev: T) => T)) => {
    if (typeof newValue === "function") {
      // If an updater function is provided, call it with the current value
      const updaterFn = newValue as (prev: T) => T;
      s(updaterFn(get()));
    }
    else {
      // Otherwise, set the value directly
      s(newValue);
    }
  };

  return [get, set];
}

/**
 * Creates a computed signal that derives its value from other signals.
 * The computed value is automatically updated when any of its dependencies change.
 *
 * @param getter - A function that computes the derived value.
 * @returns A getter function for the computed value.
 */
export function computed<T>(getter: () => T): () => T {
  const c = alienSignals.computed(getter);

  // Return a function that accesses the computed value
  return () => c();
}

/**
 * Creates an effect that runs when its dependencies change.
 * The effect is automatically triggered when any signal accessed within the effect function changes.
 *
 * @param fn - The effect function to execute.
 * @returns A function that can be called to clean up the effect.
 */
export function effect(fn: () => void): () => void {
  // Create the effect and return the cleanup function
  return alienSignals.effect(fn);
}
