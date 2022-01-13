/*
 * Type Tests
 *
 * This file is ran during CI to ensure that there aren't breaking changes with types
 */
import { combine, err, errAsync, ok, okAsync, Result, ResultAsync } from '../src';

(function describe(_ = 'Result') {
  (function describe(_ = 'andThen') {
    (function it(_ = 'Combines two equal error types (native scalar types)') {
      type Expectation = Result<unknown, string>

      const result: Expectation = ok<number, never>(123)
        .andThen((val) => err('yoooooo dude' + val))
    });

    (function it(_ = 'Combines two equal error types (custom types)') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = Result<string, MyError>

      const result: Expectation = ok<number, never>(123)
        .andThen((val) => err<never, MyError>({ stack: '/blah', code: 500 }))
    });

    (function it(_ = 'Creates a union of error types for disjoint types') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = Result<string, MyError | string[]>

      const result: Expectation = ok<number, never>(123)
        .andThen((val) => err<never, string[]>(['oh nooooo']))
    });

    (function it(_ = 'Infers error type when returning disjoint types (native scalar types)') {
      type Expectation = Result<unknown, string | number | boolean>

      const result: Expectation = ok<number, never>(123)
        .andThen((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            case 2:
              return err(123)
            default:
              return err(false)
          }
        })
    });

    (function it(_ = 'Infers error type when returning disjoint types (custom types)') {
      interface MyError { 
        stack: string
        code: number
      }
      type Expectation = Result<unknown, string | number | MyError>

      const result: Expectation = ok<number, never>(123)
        .andThen((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            case 2:
              return err(123)
            default:
              return err({ stack: '/blah', code: 500 })
          }
        })
    });

    (function it(_ = 'Infers new ok type when returning both Ok and Err (same as initial)') {
      type Expectation = Result<number, unknown>

      const result: Expectation = ok<number, never>(123)
        .andThen((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            default:
              return ok(val + 456)
          }
        })
    });

    (function it(_ = 'Infers new ok type when returning both Ok and Err (different from initial)') {
      const initial = ok<number, never>(123)
      type Expectation = Result<string, unknown>

      const result: Expectation = initial
        .andThen((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            default:
              return ok(val + ' string')
          }
        })
    });

    (function it(_ = 'Infers new err type when returning both Ok and Err') {
      interface MyError { 
        stack: string
        code: number
      }
      type Expectation = Result<unknown, string | number | MyError>
  
      const result: Expectation = ok<number, never>(123)
        .andThen((val) => {
          switch (val) {
            case 1:
              return err('yoooooo dude' + val)
            case 2:
              return ok(123)
            default:
              return err({ stack: '/blah', code: 500 })
          }
        })
    });

    (function it(_ = 'allows specifying the E and T types explicitly') {
      type Expectation = Result<'yo', number>

      const result: Expectation = ok(123).andThen<'yo', number>(val => {
        return ok('yo')
      })
    });
  });

  (function describe(_ = 'orElse') {
    (function it(_ = 'the type of the argument is the error type of the result') {
      type Expectation = string

      const result = ok<number, never>(123)
        .orElse((val: Expectation) => {
          switch (val) {
            case '2':
              return err(1)
            default:
              return err(1)
          }
        })
    });


    (function it(_ = 'infers the err return type with multiple returns (same type) ') {
      type Expectation = Result<number, number>

      const result: Expectation = ok<number, never>(123)
        .orElse((val) => {
          switch (val) {
            case '2':
              return err(1)
            default:
              return err(1)
          }
        })
    });

    (function it(_ = 'infers the err return type with multiple returns (different type) ') {
      type Expectation = Result<number, number | string>

      const result: Expectation = ok<number, never>(123)
        .orElse((val) => {
          switch (val) {
            case '2':
              return err(1)
            default:
              return err('1')
          }
        })
    });

    (function it(_ = 'infers ok and err return types with multiple returns ') {
      type Expectation = Result<number, number | string>

      const result: Expectation = ok<number, never>(123)
        .orElse((val) => {
          switch (val) {
            case '1':
              return ok(1)
            case '2':
              return err(1)
            default:
              return err('1')
          }
        })
    });

    (function it(_ = 'allows specifying the E and T types explicitly') {
      type Expectation = Result<'yo', string>

      const result: Expectation = ok<'yo', never>('yo').orElse<string>(val => {
        return err('yo')
      })
    });
  });

  (function describe(_ = 'asyncAndThen') {
    (function it(_ = 'Combines two equal error types (native scalar types)') {
      type Expectation = ResultAsync<unknown, string>

      const result: Expectation = ok<number, never>(123)
        .asyncAndThen((val) => errAsync('yoooooo dude' + val))
    });

    (function it(_ = 'Combines two equal error types (custom types)') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = ResultAsync<string, MyError>

      const result: Expectation = ok<number, never>(123)
        .asyncAndThen((val) => errAsync<string, MyError>({ stack: '/blah', code: 500 }))
    });

    (function it(_ = 'Creates a union of error types for disjoint types') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = ResultAsync<string, MyError | string[]>

      const result: Expectation = ok<number, never>(123)
        .asyncAndThen((val) => errAsync<string, string[]>(['oh nooooo']))
    });
  });
});


(function describe(_ = 'ResultAsync') {
  (function describe(_ = 'andThen') {
    (function it(_ = 'Combines two equal error types (native scalar types)') {
      type Expectation = ResultAsync<unknown, string>

      const result: Expectation = okAsync<number, string>(123)
        .andThen((val) => err('yoooooo dude' + val))
    });

    (function it(_ = 'Combines two equal error types (custom types)') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = ResultAsync<string, MyError>

      const result: Expectation = okAsync<number, MyError>(123)
        .andThen((val) => err<never, MyError>({ stack: '/blah', code: 500 }))
    });

    (function it(_ = 'Creates a union of error types for disjoint types') {
      interface MyError { 
        stack: string
        code: number
      }

      type Expectation = ResultAsync<number, MyError | string[]>

      const result: Expectation = okAsync<number, MyError>(123)
        .andThen((val) => err<never, string[]>(['oh nooooo']))
    });

    (function describe(_ = 'when returning Result types') {
      (function it(_ = 'Infers error type when returning disjoint types (native scalar types)') {
        type Expectation = ResultAsync<unknown, string | number | boolean>
  
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return err('yoooooo dude' + val)
              case 2:
                return err(123)
              default:
                return err(false)
            }
          })
      });
  
      (function it(_ = 'Infers error type when returning disjoint types (custom types)') {
        interface MyError { 
          stack: string
          code: number
        }
        type Expectation = ResultAsync<unknown, string | number | MyError>
  
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return err('yoooooo dude' + val)
              case 2:
                return err(123)
              default:
                return err({ stack: '/blah', code: 500 })
            }
          })
      });
  
      (function it(_ = 'Infers new ok type when returning both Ok and Err (same as initial)') {
        type Expectation = ResultAsync<number, unknown>
  
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return err('yoooooo dude' + val)
              default:
                return ok(val + 456)
            }
          })
      });
  
      (function it(_ = 'Infers new ok type when returning both Ok and Err (different from initial)') {
        const initial = okAsync<number, string>(123)
        type Expectation = ResultAsync<string, unknown>
  
        const result: Expectation = initial
          .andThen((val) => {
            switch (val) {
              case 1:
                return err('yoooooo dude' + val)
              default:
                return ok(val + ' string')
            }
          })
      });
  
      (function it(_ = 'Infers new err type when returning both Ok and Err') {
        interface MyError { 
          stack: string
          code: number
        }
        type Expectation = ResultAsync<unknown, string | number | MyError>
    
        const result: Expectation = okAsync<number, string>(123)
        .andThen((val) => {
          switch (val) {
            case 1:
            return err('yoooooo dude' + val)
            case 2:
            return ok(123)
            default:
            return err({ stack: '/blah', code: 500 })
          }
        })
        console.log('result: ', result);
      });
    });

    (function describe(_ = 'when returning ResultAsync types') {
      (function it(_ = 'Infers error type when returning disjoint types (native scalar types)') {
        type Expectation = ResultAsync<unknown, string | number | boolean>
  
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return errAsync('yoooooo dude' + val)
              case 2:
                return errAsync(123)
              default:
                return errAsync(false)
            }
          })
      });
  
      (function it(_ = 'Infers error type when returning disjoint types (custom types)') {
        interface MyError { 
          stack: string
          code: number
        }
        type Expectation = ResultAsync<unknown, string | number | MyError>
  
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return errAsync('yoooooo dude' + val)
              case 2:
                return errAsync(123)
              default:
                return errAsync({ stack: '/blah', code: 500 })
            }
          })
      });
  
      (function it(_ = 'Infers new ok type when returning both Ok and Err (same as initial)') {
        type Expectation = ResultAsync<number, unknown>
  
        const result1 = okAsync<number, string>(123)

        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return errAsync('yoooooo dude' + val)
              default:
                return okAsync(val + 456)
            }
          })
      });
  
      (function it(_ = 'Infers new ok type when returning both Ok and Err (different from initial)') {
        const initial = okAsync<number, string>(123)
        type Expectation = ResultAsync<string, unknown>
  
        const result: Expectation = initial
          .andThen((val) => {
            switch (val) {
              case 1:
                return errAsync('yoooooo dude' + val)
              default:
                return okAsync(val + ' string')
            }
          })
      });
  
      (function it(_ = 'Infers new err type when returning both Ok and Err') {
        interface MyError { 
          stack: string
          code: number
        }
        type Expectation = ResultAsync<unknown, string | number | MyError>
    
        const result: Expectation = okAsync<number, string>(123)
          .andThen((val) => {
            switch (val) {
              case 1:
                return errAsync('yoooooo dude' + val)
              case 2:
                return okAsync(123)
              default:
                return errAsync({ stack: '/blah', code: 500 })
            }
          })
      });
    });

    (function describe(_ = 'when returning a mix of Result and ResultAsync types') {
      (function it(_ = 'allows for explicitly specifying the Ok and Err types when inference fails') {
        type Expectation = ResultAsync<number | boolean, string | number | boolean>
  
        const result: Expectation = okAsync<number, string>(123)
          .andThen<number | boolean, string | number | boolean>((val) => {
            switch (val) {
              case 1:
                return errAsync('yoooooo dude' + val)
              case 2:
                return err(123)
              default:
                return okAsync(false)
            }
          })
      });
    });
  });

  (function describe(_ = 'orElse') {
    (function it(_ = 'the type of the argument is the error type of the result') {
      type Expectation = string

      const result = okAsync<number, string>(123)
        .orElse((val: Expectation) => {
          switch (val) {
            case '2':
              return errAsync(1)
            default:
              return errAsync(1)
          }
        })
    });


    (function it(_ = 'infers the err return type with multiple returns (same type) ') {
      type Expectation = ResultAsync<number, number>

      const result: Expectation = okAsync<number, string>(123)
        .orElse((val) => {
          switch (val) {
            case '2':
              return errAsync(1)
            default:
              return errAsync(1)
          }
        })
    });

    (function it(_ = 'infers the err return type with multiple returns (different type) ') {
      type Expectation = ResultAsync<number, number | string>

      const result: Expectation = okAsync<number, string>(123)
        .orElse((val) => {
          switch (val) {
            case '2':
              return errAsync(1)
            default:
              return errAsync('1')
          }
        })
    });

    (function it(_ = 'infers ok and err return types with multiple returns ') {
      type Expectation = ResultAsync<number, number | string>

      const result: Expectation = okAsync<number, string>(123)
        .orElse((val) => {
          switch (val) {
            case '1':
              return okAsync(1)
            case '2':
              return errAsync(1)
            default:
              return errAsync('1')
          }
        })
    });

    (function it(_ = 'allows specifying ok and err return types when mixing Result and ResultAsync in returns ') {
      type Expectation = ResultAsync<number, number | string>

      const result: Expectation = okAsync<number, string>(123)
        .orElse<number | string>((val) => {
          switch (val) {
            case '1':
              return ok(1)
            case '2':
              return errAsync(1)
            default:
              return errAsync('1')
          }
        })
    });
  });
});

(function describe(_ = 'Combine on Unbounded lists') {
  (function describe(_ = 'Heterogeneous list') {
    (function it(_= 'does not contain `unknown` values') {
      
      type ListType
        = Array<Result<number, never>
        | Result<never, string>
        | Result<boolean, never>>
      

      // this test fails if I provide the above anotation
      const myList: ListType = [
        ok(123),
        err('hello'),
        ok(true)
      ] 

      type Expectation = Result<( number | boolean )[], string>

      const combined: Expectation = combine(myList)

      return combined
    })();

    (function it(_= 'maps `unknown` to `never` if `unknown` is the only possible value.') {
      const myList = [
        ok(123),
        ok(true)
      ]

      type Expectation = Result<( number | boolean )[], never>

      const combined: Expectation = combine(myList)

      return combined
    })
  })();
})();


class InvalidTest {}

const ok1 = ok('my value1');
const ok2 = ok(2);
const err1 = err(new InvalidTest());

const arrayOfResWithErr: (
  | Result<string, unknown>
  | Result<unknown, InvalidTest>
)[] = [ok1, err1];

const combinedResultsErr = combine(arrayOfResWithErr);


