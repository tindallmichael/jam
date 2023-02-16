import {BehaviorSubject, identity, map, Observable} from 'rxjs';
import {deepFreeze, naiveObjectComparison, select$, deepCopy} from './store.functions';
import { ModelSelector, PropertyActuator, PropertyModifier, PropertySelector, PropertySetter } from './store.types';
/**
 * The Store Subject is an extension of the RXJS BehaviorSubject/
 * Its purpose is to overrider the next method with deepFreeze
 * and object comparisons. The reason for this is to ensure
 * 1. The object in question is frozen during the emission
 * 2. only if the data is changed is the new value emitted
 */
export class StoreSubject<T> extends BehaviorSubject<T> {
  /**
   * Creates an instance of the store with the
   * supplied generic type T
   * @param initialData
   */
  constructor(initialData: T) {
    super(deepFreeze(initialData));
  }

  /**
   * New data to emit in the store
   * overrdies standard behavior subject next
   * adding in deepFreeze
   * @param newData
   */
  override next(newData: T): void {
    const frozenData = deepFreeze(newData);
    if (!naiveObjectComparison(frozenData, this.getValue())) {
      super.next(frozenData);
    }
  }
}

/**
 * The Base store is used to setup the basic structres of a store.
 * It includes all required methods for the store
 * except for the selector. This selector nneds to be
 * implemented in the child class to ensure the store functionality
 * is enabled
 */
export class Store<T> {
  private readonly _state: StoreSubject<T>;
  state$: Observable<T>;

  /**
   * Initialise the Store. Can be initialised as empty but a Behavior subject
   * requires an initial state as per the documentation (ie. initial)
   * However the initial state can be set by passing it to the constructor
   * @param initialState
   */
  constructor(initialState: T) {
    this._state = new StoreSubject(initialState);
    this.state$ = this._state.asObservable();
  }

  /**
   * Get the current state of the store as a value
   * Returns an object of the same type of the state supplied to the store
   *
   */
  public get state(): T {
    return this._state.getValue();
  }

  /**
   * Set the state of the current store
   * updates the behavior subject by pushing a new
   * value down the stream
   * @param nextState
   */
  public set state(nextState: T) {
    this._state.next(nextState);
  }

  /**
   * This method is used to set or update the existing state of the store
   * One can pass the specific attribute that one would like to change/update
   * this allows us to individually set attribute states in the store   *
   * @param partialState
   */
  public setState(partialState: Partial<T>): void {
    const currentState = this.state;
    this.state = {...currentState, ...partialState};
  }

  /**
   * Get a partial state from the store
   * @param attribute
   */
  public getPartialState(attribute: keyof T) {
    return this.state[attribute];
  }

  /**
   * Select a property from the store based on the model mapping
   * function provided using the model selector.
   * each model level mapped can then have each property selected,
   * and then perform actions on the attribute
   * 1. set
   * 2. setValue
   * 3. getCurrent
   * 4. observable
   * @param parent
   */
    select<R>(parent: ModelSelector<T, R>): PropertySelector<R>;
    /**
     * Implementation of method select overloading
     * @param arg
     */
    select<R, K extends keyof T>(arg: ModelSelector<T, R> | K) {
      if (typeof arg === 'function') {
        return {
          property: <K extends keyof R>(prop: K) => {
            const set = (setter: PropertySetter<R[K]>) => {
              const root = deepCopy(this.state);
              const parentValue: R = arg(root);
              if (parentValue) {
                const currValue: R[K] = parentValue[prop];
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                parentValue[prop] = setter(currValue);
                this.setState(root);
              }
            };
            const setValue = (newValue: R[K]) => {
              set(() => newValue);
            };
            const setPartial = (updates: Partial<R[K]>) => {
              set((currValue) => ({
                ...currValue,
                ...updates
              }));
            };
            const getCurrent = (modifier?: PropertyModifier<R[K]>) => {
              const root = this.state;
              const parentValue: R = arg(root);
              const mod = modifier || identity;
              return parentValue && mod(parentValue[prop]);
            };
            const observable = (modifier?: PropertyModifier<R[K]>) => {
              return select$(this.state$, (value) => {
                const parentObject = arg(value);
                return parentObject && parentObject[prop];
              }).pipe(
                map((value) => {
                  const mod = modifier || identity;
                  return mod(value);
                })
              );
            };
            const actuator: PropertyActuator<R[K]> = {
              set,
              setValue,
              setPartial,
              getCurrent,
              observable
            };
            return actuator;
          }
        } as PropertySelector<R>;
      }
      return select$(this.state$, (mappable) => mappable[arg]);
    }

    /**
     * Shortcut to select root model
     */
    selectRoot(): PropertySelector<T> {
      return this.select((model) => model);
    }

    /**
     * Shortcut to select the current property from the root model
     * @param attribute
     */
    selectCurrent(attribute: keyof T) {
      return this.selectRoot().property(attribute).getCurrent();
    }

}

export class ReactiveStore<T> {
  store = new Store<Partial<T> & { [key: string]: unknown }>({} as T & { [key: string]: unknown });
}
