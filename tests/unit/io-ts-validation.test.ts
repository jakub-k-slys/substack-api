/**
 * Unit tests for io-ts validation utility functions
 */

import { decodeOrThrow, decodeEither } from '@substack-api/internal/validation'
import { isLeft, isRight } from 'fp-ts/Either'
import * as t from 'io-ts'

const TestCodec = t.type({
  id: t.number,
  name: t.string
})

const TestOptionalCodec = t.intersection([t.type({ id: t.number }), t.partial({ name: t.string })])

describe('Validation utilities', () => {
  describe('decodeEither', () => {
    it('should return Right for valid data', () => {
      const result = decodeEither(TestCodec, { id: 1, name: 'Test' })
      expect(isRight(result)).toBe(true)
    })

    it('should return Left for invalid data (wrong id type)', () => {
      const result = decodeEither(TestCodec, { id: 'not-a-number', name: 'Test' })
      expect(isLeft(result)).toBe(true)
    })

    it('should return Left for missing required fields', () => {
      const result = decodeEither(TestCodec, { id: 1 })
      expect(isLeft(result)).toBe(true)
    })
  })

  describe('decodeOrThrow', () => {
    it('should return decoded data for valid input', () => {
      const result = decodeOrThrow(TestCodec, { id: 42, name: 'Hello' }, 'test entity')
      expect(result.id).toBe(42)
      expect(result.name).toBe('Hello')
    })

    it('should throw for invalid input', () => {
      expect(() => {
        decodeOrThrow(TestCodec, { id: 'bad', name: 'Test' }, 'test entity')
      }).toThrow('Invalid test entity')
    })

    it('should handle optional fields correctly', () => {
      const result = decodeOrThrow(TestOptionalCodec, { id: 1 }, 'test')
      expect(result.id).toBe(1)
      expect(result.name).toBeUndefined()
    })

    it('should include context in error message', () => {
      expect(() => {
        decodeOrThrow(TestCodec, {}, 'my special entity')
      }).toThrow('Invalid my special entity')
    })
  })
})
