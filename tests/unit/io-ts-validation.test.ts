import { decodeOrThrow } from '@substack-api/internal/validation'
import * as t from 'io-ts'

const TestCodec = t.type({ id: t.number, name: t.string })
const TestOptionalCodec = t.intersection([t.type({ id: t.number }), t.partial({ name: t.string })])

describe('decodeOrThrow', () => {
  it('should return decoded data for valid input', () => {
    const result = decodeOrThrow(TestCodec, { id: 42, name: 'Hello' }, 'test entity')
    expect(result.id).toBe(42)
    expect(result.name).toBe('Hello')
  })

  it('should throw for invalid input', () => {
    expect(() => decodeOrThrow(TestCodec, { id: 'bad', name: 'Test' }, 'test entity')).toThrow(
      'Invalid test entity'
    )
  })

  it('should handle optional fields', () => {
    const result = decodeOrThrow(TestOptionalCodec, { id: 1 }, 'test')
    expect(result.id).toBe(1)
    expect(result.name).toBeUndefined()
  })

  it('should include context name in error message', () => {
    expect(() => decodeOrThrow(TestCodec, {}, 'my special entity')).toThrow(
      'Invalid my special entity'
    )
  })
})
