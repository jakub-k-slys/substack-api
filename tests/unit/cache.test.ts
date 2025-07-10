import { InMemoryCache } from '../../src/internal/cache/in-memory-cache'

describe('InMemoryCache', () => {
  let cache: InMemoryCache<number, string>

  beforeEach(() => {
    cache = new InMemoryCache<number, string>()
  })

  describe('basic operations', () => {
    it('should be empty initially', () => {
      expect(cache.size()).toBe(0)
      expect(cache.has(1)).toBe(false)
      expect(cache.get(1)).toBeUndefined()
    })

    it('should store and retrieve values', () => {
      cache.set(1, 'value1')
      cache.set(2, 'value2')

      expect(cache.size()).toBe(2)
      expect(cache.has(1)).toBe(true)
      expect(cache.has(2)).toBe(true)
      expect(cache.has(3)).toBe(false)
      expect(cache.get(1)).toBe('value1')
      expect(cache.get(2)).toBe('value2')
      expect(cache.get(3)).toBeUndefined()
    })

    it('should update existing values', () => {
      cache.set(1, 'value1')
      cache.set(1, 'updated-value1')

      expect(cache.size()).toBe(1)
      expect(cache.get(1)).toBe('updated-value1')
    })

    it('should clear all values', () => {
      cache.set(1, 'value1')
      cache.set(2, 'value2')
      expect(cache.size()).toBe(2)

      cache.clear()

      expect(cache.size()).toBe(0)
      expect(cache.has(1)).toBe(false)
      expect(cache.has(2)).toBe(false)
      expect(cache.get(1)).toBeUndefined()
      expect(cache.get(2)).toBeUndefined()
    })
  })

  describe('type safety', () => {
    it('should work with different types', () => {
      const stringCache = new InMemoryCache<string, number>()
      stringCache.set('key1', 42)
      stringCache.set('key2', 100)

      expect(stringCache.get('key1')).toBe(42)
      expect(stringCache.get('key2')).toBe(100)
      expect(stringCache.size()).toBe(2)
    })

    it('should work with object types', () => {
      type User = { id: number; name: string }
      const objectCache = new InMemoryCache<number, User>()

      const user1: User = { id: 1, name: 'Alice' }
      const user2: User = { id: 2, name: 'Bob' }

      objectCache.set(1, user1)
      objectCache.set(2, user2)

      expect(objectCache.get(1)).toEqual(user1)
      expect(objectCache.get(2)).toEqual(user2)
      expect(objectCache.size()).toBe(2)
    })
  })
})
