import { err, Err, ok, Ok, Result } from './result'
import { ResultAsync } from './result-async'

// Given a list of Results, this extracts all the different `T` types from that list
type ExtractOkTypes<T extends ResultsToCombine> = {
  [Key in keyof T]: T[Key] extends ResultToCombine ? ExtractOkFromUnion<T[Key]> : never
}

// Given a list of Results, this extracts all the different `E` types from that list
type ExtractErrTypes<T extends ResultsToCombine> = {
  [Key in keyof T]: T[Key] extends ResultToCombine ? ExtractErrFromUnion<T[Key]> : never
}

// need to be separated generic type to run it for every element of union T separately
type ExtractOkFromUnion<T extends ResultToCombine> = T extends Ok<infer V, never> // filter out "unknown" values
  ? V extends unknown
    ? V
    : never
  : never

// need to be separated generic type to run it for every element of union T separately
type ExtractErrFromUnion<T extends ResultToCombine> = T extends Err<never, infer E> // filter out "unknown" values
  ? E extends unknown
    ? E
    : never
  : never

// Given a list of ResultAsyncs, this extracts all the different `T` types from that list
type ExtractOkAsyncTypes<T extends readonly ResultAsync<unknown, unknown>[]> = {
  [idx in keyof T]: T[idx] extends ResultAsync<infer U, unknown> ? U : never
}

// Given a list of ResultAsyncs, this extracts all the different `E` types from that list
type ExtractErrAsyncTypes<T extends readonly ResultAsync<never, unknown>[]> = {
  [idx in keyof T]: T[idx] extends ResultAsync<unknown, infer E> ? E : never
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
          : acc.map((values) => values.concat(result.value))
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

/*
export function combine<T extends readonly Result<unknown, unknown>[]>(
  resultList: T,
): Result<ExtractOkTypes<T>, ExtractErrTypes<T>[number]>
*/
type UnpackNeverArray<T> = T extends readonly never[] ? never : T
type ResultToCombine = Result<never, unknown> | Result<unknown, never>
// rename this to be more readable, ResultArrToCombine
type ResultsToCombine = readonly ResultToCombine[]

export function combine<T extends ResultsToCombine>(
  results: [...T],
): Result<UnpackNeverArray<ExtractOkTypes<T>>, ExtractErrTypes<T>[number]>

export function combine<T extends readonly ResultAsync<unknown, unknown>[]>(
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
