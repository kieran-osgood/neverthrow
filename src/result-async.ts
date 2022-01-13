import { ResultOptions } from 'result'
import { Err, Ok, Result } from './'
import { ExtractErrAsyncTypes, ExtractOkAsyncTypes } from './utils'
type Awaited<T> = T extends PromiseLike<infer U> ? U : T

export class ResultAsync<T, E> implements PromiseLike<Result<T, E>> {
  private _promise: Promise<Result<T, E>>

  constructor(res: Promise<Result<T, E>>) {
    this._promise = res
  }

  static fromSafePromise<T, E>(promise: Promise<T>): ResultAsync<T, E> {
    const newPromise = promise.then((value: T) => new Ok<T, never>(value))

    return new ResultAsync(newPromise)
  }

  static fromPromise<T, E>(promise: Promise<T>, errorFn: (e: unknown) => E): ResultAsync<T, E> {
    const newPromise = promise
      .then((value: T) => new Ok<T, never>(value))
      .catch((e) => new Err<never, E>(errorFn(e)))

    return new ResultAsync(newPromise)
  }

  map<A>(f: (t: T) => A | Promise<A>): ResultAsync<A, E> {
    return new ResultAsync(
      this._promise.then(async (res: Result<T, E>) => {
        if (res.isErr()) {
          return new Err<never, E>(res.error)
        }

        return new Ok<A, never>(await f(res.value))
      }),
    )
  }

  mapErr<U>(f: (e: E) => U | Promise<U>): ResultAsync<T, U> {
    return new ResultAsync(
      this._promise.then(async (res: Result<T, E>) => {
        if (res.isOk()) {
          return new Ok<T, never>(res.value)
        }

        return new Err<never, U>(await f(res.error))
      }),
    )
  }

  andThen<R extends Result<unknown, unknown>>(
    f: (t: T) => R,
  ): ResultAsync<ExtractOkAsyncTypes<[R]>[number], ExtractErrAsyncTypes<[R]>[number] | E>

  andThen<R extends ResultAsync<unknown, unknown>>(
    f: (t: T) => R,
  ): ResultAsync<
    ExtractOkAsyncTypes<[Awaited<R>]>[number],
    ExtractErrAsyncTypes<[Awaited<R>]>[number]
  >

  andThen<U, F>(f: (t: T) => ResultAsync<U, F>): ResultAsync<U, E | F>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  andThen(f: any): any {
    return new ResultAsync(
      this._promise.then((res) => {
        if (res.isErr()) {
          return new Err<never, E>(res.error)
        }

        const newValue = f(res.value)
        return newValue instanceof ResultAsync ? newValue._promise : newValue
      }),
    )
  }

  orElse<R extends Result<T, unknown>>(f: (e: E) => R): ResultAsync<T, ExtractErrAsyncTypes<[R]>>
  orElse<R extends ResultAsync<T, unknown>>(
    f: (e: E) => R,
  ): ResultAsync<T, ExtractErrAsyncTypes<[Awaited<R>]>>
  orElse<A>(f: (e: E) => Result<T, A> | ResultAsync<T, A>): ResultAsync<T, A>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  orElse(f: any): any {
    return new ResultAsync(
      this._promise.then(async (res: Result<T, E>) => {
        if (res.isErr()) {
          return f(res.error)
        }

        return new Ok<T, never>(res.value)
      }),
    )
  }

  match<A extends ResultOptions, B extends ResultOptions>(
    ok: (t: T) => A,
    _err: (e: E) => B,
  ): Promise<A | B> {
    return this._promise.then((res) => res.match(ok, _err))
  }

  unwrapOr<A extends unknown>(t: A): Promise<T | A> {
    return this._promise.then((res) => res.unwrapOr(t))
  }

  // Makes ResultAsync implement PromiseLike<Result>
  then<A, B>(
    successCallback?: (res: Result<T, E>) => A | PromiseLike<A>,
    failureCallback?: (reason: unknown) => B | PromiseLike<B>,
  ): PromiseLike<A | B> {
    return this._promise.then(successCallback, failureCallback)
  }
}

export const okAsync = <T extends unknown, E = unknown>(value: T): ResultAsync<T, E> =>
  new ResultAsync(Promise.resolve(new Ok<T, never>(value)))

export const errAsync = <T extends unknown, E extends unknown>(err: E): ResultAsync<T, E> =>
  new ResultAsync(Promise.resolve(new Err<never, E>(err)))

export const fromPromise = ResultAsync.fromPromise
export const fromSafePromise = ResultAsync.fromSafePromise
