import { Observable } from 'rxjs';

/**
 * PropertySelector is used to define the type of
 * properties that can be selected from a defined root
 * in the state object supplied to the store.
 */
export interface PropertySelector<T> {
  /**
   * Selects a property of the selected model based
   * on the mapping function provided.
   */
  property<K extends keyof T>(property: K): PropertyActuator<T[K]>;
}

/**
 * PropertyActuator is used to define the actuators / functions
 * on each property
 */
export interface PropertyActuator<V> {
  /**
   * Specifies a function to set a new value.
   * Observers will be notified if the object reference is new.
   */
  set(setter: PropertySetter<V>): unknown;

  /**
   * Sets a new value on the path specified.
   * Observers will be notified if the object reference is new.
   */
  setValue(newValue: V): unknown;

  /**
   * Sets only the properties in the updates parameter
   */
  setPartial(updates: Partial<V>): void;

  /**
   * Observes value changes on the path specified.
   * If the parent is optional and is not set, observed value is undefined.
   */
  observable(modifier?: PropertyModifier<V>): Observable<V>;

  /**
   * Gets the current value on the model tree.
   */
  getCurrent(modifier?: PropertyModifier<V>): V;
}

/**
 * Model Selector type
 */
export type ModelSelector<S, T> = (model: S) => T;
/**
 * PropertyModifier type
 */
export type PropertyModifier<T> = (input: T) => T;
/**
 * PropertySetter type
 */
export type PropertySetter<T> = (currValue: T) => T;
