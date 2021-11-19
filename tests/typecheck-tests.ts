/*
 * Type Tests
 *
 * This file is ran during CI to ensure that there aren't breaking changes with types
 */
import { combine, err, errAsync, ok, okAsync, Result } from '../src'
;(function describe(_ = 'Combine on Unbounded lists') {
  ;(function describe(_ = 'Heterogeneous list') {
    ;(function it(_ = 'does not contain `unknown` values') {
      type ListType = Array<Result<number, never> | Result<never, string> | Result<boolean, never>>

      // this test fails if I provide the above anotation
      const myList: ListType = [ok(123), err('hello'), ok(true)]

      type Expectation = Result<(number | boolean)[], string>

      const combined: Expectation = combine(myList)

      return combined
    })
    ;(function it(_ = "combines ok's `Result.E` to never if no Ok's.") {
      const myList = [ok(123), ok(true)]
      type Expectation = Result<(number | boolean)[], never>
      const combined: Expectation = combine(myList)
      return combined
    })
    ;(function it(_ = "combines ok's `Result.E` to never if no Ok's.") {
      const myList = [ok(123)]
      type Expectation = Result<number[], never>
      const combined: Expectation = combine(myList)
      return combined
    })
    ;(function it(_ = "combines `Result.T` to `never` if no Ok's.") {
      const myList = [err(123), err(true)]
      type Expectation = Result<never, number | boolean>
      const combined: Expectation = combine(myList)
      return combined
    })
    ;(async function it(_ = 'maps `unknown` to `never` if `unknown` is the only possible value.') {
      const someAsyncAction = async (val: number) => {
        if (!abc) {
          return errAsync('oops')
        }
        return okAsync(val)
      }
      const asyncVal = await someAsyncAction(123)
      const myList = [asyncVal]
      type Expectation = Result<number[], never>
      const combined: Expectation = combine(myList)
      return combined
    })

    const abc = ''

    ;(function it(_ = 'infers err from initial ok object.') {
      const myerr = ok(true)
      type Expectation = Result<string, string>
      const result = myerr.andThen(() => {
        if (abc) {
          return ok('ok')
        }
        return err('abc')
      })
      return result
    })
  })()
})()

class InvalidTest {}

const ok1 = ok('my value1')
const ok2 = ok(2)
const err1 = err(new InvalidTest())

const arrayOfResWithErr: (Result<string, unknown> | Result<unknown, InvalidTest>)[] = [ok1, err1]

const combinedResultsErr = combine(arrayOfResWithErr)
