import { Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

/**
 * deepfreeze function, used to freeze changes to the object / state
 * before it is intitialised or a new value emitted
 * @param inObj
 */
export function deepFreeze<T>(inObj: T): T {
  Object.freeze(inObj);

  Object.getOwnPropertyNames(inObj).forEach(function (prop) {
    // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line no-prototype-builtins
    if (
      // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/ban-ts-comment
      // @ts-ignore
      // eslint-disable-next-line no-prototype-builtins
      inObj.hasOwnProperty(prop) &&
      // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/ban-ts-comment
      // @ts-ignore
      inObj[prop] != null &&
      // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/ban-ts-comment
      // @ts-ignore
      typeof inObj[prop] === 'object' &&
      // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/ban-ts-comment
      // @ts-ignore
      !Object.isFrozen(inObj[prop])
    ) {
      // eslint-disable-next-line no-prototype-builtins,@typescript-eslint/ban-ts-comment
      // @ts-ignore
      deepFreeze(inObj[prop]);
    }
  });
  return inObj;
}

/**
 * Simple comparasion function to check if 2 objects are the same
 * it is done using a stringify
 * @param objOne
 * @param objTwo
 */
export function naiveObjectComparison(objOne: unknown, objTwo: unknown): boolean {
  return JSON.stringify(objOne) === JSON.stringify(objTwo);
}

/**
 * Type for the mapping function used in the Store select function
 */
type MappingFunction<T, R> = (mappable: T) => R;
/**
 * Type for the MemoizationFunction
 */
type MemoizationFunction<R> = (previousResult: R, currentResult: R) => boolean;

/**
 * MemoizationFunction to speed up processing with cached resutls
 * @param previousValue
 * @param currentValue
 */
function defaultMemoization(previousValue: unknown, currentValue: unknown): boolean {
  if (typeof previousValue === 'object' && typeof currentValue === 'object') {
    return naiveObjectComparison(previousValue, currentValue);
  }
  return previousValue === currentValue;
}

/**
 * Select function to select based on a model mapping function
 * an observable from the state supplied to the store.
 * @param source$
 * @param mappingFunction
 * @param memoizationFunction
 */
export function select$<T, R>(
  source$: Observable<T>,
  mappingFunction: MappingFunction<T, R>,
  memoizationFunction?: MemoizationFunction<R>
): Observable<R> {
  return source$.pipe(
    map(mappingFunction),
    distinctUntilChanged(memoizationFunction || defaultMemoization),
    shareReplay(1)
  );
}

/**
 * Helper function to copy an Array
 * @param input
 */
export function copyArray<T>(input: T[]): T[] {
  return input ? [...input] : input;
}
/**
 * Helper function to copy and Object
 * @param input
 */
export function copyObject<T>(input: T): T {
  return input ? { ...input } : input;
}

export function deepCopy<T>(input: T): T {
  const copyValue = JSON.stringify(input);
  return JSON.parse(copyValue);
}

export function implementPartialState<T>(): new () => T {
  return class {} as never;
}

/**
 * Helper function to detect empty Objects.
 * Useful in cases where the value to check is {} as
 * opposed to null,undefined or ''
 * @param input
 */
export function ObjectIsEmpty<T>(input: T): boolean {
  return input ? Object.keys(input).length === 0 : true;
}

export const isObject = (item: any) => {
  return item && typeof item === 'object' && !Array.isArray(item);
};

export const mergeDeep = (target: any, ...sources: any): any => {
  if (!sources.length) return target;
  const source = sources.shift();

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key])
          Object.assign(target, {
            [key]: {}
          });
        mergeDeep(target[key], source[key]);
      } else {
        Object.assign(target, {
          [key]: source[key]
        });
      }
    }
  }

  return mergeDeep(target, ...sources);
};
