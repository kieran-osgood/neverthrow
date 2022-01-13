import {
  AsyncResultOptions,
  AsyncResultOptionsArray,
  err,
  Err,
  ok,
  Ok,
  Result,
  ResultOptions,
  ResultOptionsArray,
} from './result'
import { ResultAsync } from './result-async'

// Given a list of Results, this extracts all the different `T` types from that list
export type ExtractOkTypes<T extends ResultOptionsArray> = {
  [Key in keyof T]: T[Key] extends ResultOptions ? ExtractOkFromUnion<T[Key]> : never
}

// need to be separated generic type to run it for every element of union T separately
export type ExtractOkFromUnion<T extends ResultOptions> = T extends Ok<infer V, never> // filter out "unknown" values
  ? V extends unknown
    ? V
    : never
  : never

// Given a list of ResultAsyncs, this extracts all the different `T` types from that list
export type ExtractOkAsyncTypes<T extends AsyncResultOptionsArray> = {
  [Key in keyof T]: T[Key] extends AsyncResultOptions ? AsyncExtractOkFromUnion<T[Key]> : never
}
// need to be separated generic type to run it for every element of union T separately
export type AsyncExtractOkFromUnion<T extends AsyncResultOptions> = T extends Ok<infer V, never> // filter out "unknown" values
  ? V extends unknown
    ? V
    : never
  : never

// Given a list of Results, this extracts all the different `E` types from that list
export type ExtractErrTypes<T extends ResultOptionsArray> = {
  [Key in keyof T]: T[Key] extends ResultOptions ? ExtractErrFromUnion<T[Key]> : never
}
// need to be separated generic type to run it for every element of union T separately
export type ExtractErrFromUnion<T extends ResultOptions> = T extends Err<never, infer E> // filter out "unknown" values
  ? E extends unknown
    ? E
    : never
  : never

// Given a list of ResultAsyncs, this extracts all the different `E` types from that list
export type ExtractErrAsyncTypes<T extends AsyncResultOptionsArray> = {
  [idx in keyof T]: T[idx] extends AsyncResultOptions ? AsyncExtractErrFromUnion<T[idx]> : never
}

// need to be separated generic type to run it for every element of union T separately
export type AsyncExtractErrFromUnion<T extends AsyncResultOptions> = T extends Err<never, infer E> // filter out "unknown" values
  ? E extends unknown
    ? E
    : never
  : never

const appendValueToEndOfList = <T>(value: T) => (list: T[]): T[] => {
  // need to wrap `value` inside of an array in order to prevent
  // Array.prototype.concat from destructuring the contents of `value`
  // into `list`.
  //
  // Otherwise you will receive [ 'hi', 1, 2, 3 ]
  // when you actually expected a tuple containing [ 'hi', [ 1, 2, 3 ] ]
  if (Array.isArray(value)) {
    return list.concat([value])
  }

  return list.concat(value)
}

/**
 * Short circuits on the FIRST Err value that we find
 */
const combineResultList = <T, E>(resultList: Result<T, E>[]): Result<T[], E> =>
  resultList.reduce(
    (acc, result) =>
      acc.isOk()
        ? result.isErr()
          ? err(result.error)
          : acc.map(appendValueToEndOfList(result.value))
        : acc,
    ok([]) as Result<T[], E>,
  )

/* This is the typesafe version of Promise.all
 *
 * Takes a list of ResultAsync<T, E> and success if all inner results are Ok values
 * or fails if one (or more) of the inner results are Err values
 */
const combineResultAsyncList = <T, E>(asyncResultList: ResultAsync<T, E>[]): ResultAsync<T[], E> =>
  ResultAsync.fromSafePromise(Promise.all(asyncResultList)).andThen(
    combineResultList,
  ) as ResultAsync<T[], E>

export function combine<T extends ResultOptionsArray>(
  resultList: T,
): Result<ExtractOkTypes<T>, ExtractErrTypes<T>[number]>

export function combine<T extends ResultOptionsArray>(
  asyncResultList: T,
): ResultAsync<ExtractOkAsyncTypes<T>, ExtractErrAsyncTypes<T>[number]>

// eslint-disable-next-line
export function combine(list: any): any {
  if (list[0] instanceof ResultAsync) {
    return combineResultAsyncList(list)
  } else {
    return combineResultList(list)
  }
}

/**
 * Give a list of all the errors we find
 */
const combineResultListWithAllErrors = <T, E>(resultList: Result<T, E>[]): Result<T[], E[]> =>
  resultList.reduce(
    (acc, result) =>
      result.isErr()
        ? acc.isErr()
          ? err([...acc.error, result.error])
          : err([result.error])
        : acc.isErr()
        ? acc
        : ok([...acc.value, result.value]),
    ok([]) as Result<T[], E[]>,
  )

const combineResultAsyncListWithAllErrors = <T, E>(
  asyncResultList: ResultAsync<T, E>[],
): ResultAsync<T[], E[]> =>
  ResultAsync.fromSafePromise(Promise.all(asyncResultList)).andThen(
    combineResultListWithAllErrors,
  ) as ResultAsync<T[], E[]>

export function combineWithAllErrors<T extends ResultOptionsArray>(
  resultList: T,
): Result<ExtractOkTypes<T>, ExtractErrTypes<T>[number][]>

export function combineWithAllErrors<T extends ResultOptionsArray>(
  asyncResultList: T,
): ResultAsync<ExtractOkAsyncTypes<T>, ExtractErrAsyncTypes<T>[number][]>

// eslint-disable-next-line
export function combineWithAllErrors(list: any): any {
  if (list[0] instanceof ResultAsync) {
    return combineResultAsyncListWithAllErrors(list)
  } else {
    return combineResultListWithAllErrors(list)
  }
}
