/**
 * Utility functions for runtime validation using io-ts and fp-ts
 */

import { pipe } from 'fp-ts/function'
import { fold } from 'fp-ts/Either'
import { PathReporter } from 'io-ts/PathReporter'
import * as t from 'io-ts'

/**
 * Decode and validate data using an io-ts codec
 * @param codec - The io-ts codec to use for validation
 * @param data - The raw data to validate
 * @param errorContext - Context information for error messages
 * @returns The validated data
 * @throws {Error} If validation fails
 */
export function decodeOrThrow<A>(
  codec: t.Type<A, unknown, unknown>,
  data: unknown,
  errorContext: string
): A {
  const result = codec.decode(data)

  return pipe(
    result,
    fold(
      (_errors) => {
        const errorMessage = PathReporter.report(result).join(', ')
        console.log(`Invalid ${errorContext}: ${errorMessage}`)
        throw new Error(`Invalid ${errorContext}: ${errorMessage}`)
      },
      (parsed) => parsed
    )
  )
}
