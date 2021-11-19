import { Err, Ok, Result } from './'

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

  andThen<U>(f: (t: T) => Result<U, E> | ResultAsync<U, E>): ResultAsync<U, E> {
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

  orElse<A>(f: (e: E) => Result<T, A> | ResultAsync<T, A>): ResultAsync<T, A> {
    return new ResultAsync(
      this._promise.then(async (res: Result<T, E>) => {
        if (res.isErr()) {
          return f(res.error)
        }

        return new Ok<T, never>(res.value)
      }),
    )
  }

  match<A>(ok: (t: T) => A, _err: (e: E) => A): Promise<A> {
    return this._promise.then((res) => res.match(ok, _err))
  }

  unwrapOr<DefaultValue extends unknown>(t: DefaultValue): Promise<DefaultValue> {
    return this._promise.then((res) => res.unwrapOr(t))
  }

  // Makes ResultAsync implement PromiseLike<Result>
  then<A, B>(
    successCallback?: (res: Result<T, never>) => A | PromiseLike<A>,
    failureCallback?: (reason: unknown) => B | PromiseLike<B>,
  ): PromiseLike<A | B> {
    return this._promise.then(successCallback, failureCallback)
  }
}

export const okAsync = <T, E extends never>(value: T): ResultAsync<T, E> =>
  new ResultAsync(Promise.resolve(new Ok<T, never>(value)))

export const errAsync = <T extends never, E>(err: E): ResultAsync<T, E> =>
  new ResultAsync(Promise.resolve(new Err<never, E>(err)))
