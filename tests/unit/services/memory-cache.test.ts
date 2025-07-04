/**
 * MemoryCache unit tests
 */

import { MemoryCache } from '../../../src/services/memory-cache'

// Declare setTimeout for Node.js environment
declare const setTimeout: (callback: () => void, ms: number) => unknown

describe('MemoryCache', () => {
  let cache: MemoryCache

  beforeEach(() => {
    cache = new MemoryCache()
  })

  afterEach(() => {
    cache.clear()
  })

  describe('basic operations', () => {
    it('should store and retrieve values', async () => {
      await cache.set('key1', 'value1')
      const result = await cache.get<string>('key1')
      expect(result).toBe('value1')
    })

    it('should return undefined for non-existent keys', async () => {
      const result = await cache.get('nonexistent')
      expect(result).toBeUndefined()
    })

    it('should delete values', async () => {
      await cache.set('key1', 'value1')
      await cache.delete('key1')
      const result = await cache.get('key1')
      expect(result).toBeUndefined()
    })

    it('should store different data types', async () => {
      await cache.set('string', 'test')
      await cache.set('number', 42)
      await cache.set('object', { name: 'test', value: 123 })
      await cache.set('array', [1, 2, 3])

      expect(await cache.get('string')).toBe('test')
      expect(await cache.get('number')).toBe(42)
      expect(await cache.get('object')).toEqual({ name: 'test', value: 123 })
      expect(await cache.get('array')).toEqual([1, 2, 3])
    })
  })

  describe('TTL functionality', () => {
    it('should expire values after TTL', async () => {
      await cache.set('expiring', 'value', 10) // 10ms TTL

      // Should exist immediately
      expect(await cache.get('expiring')).toBe('value')

      // Wait for expiration
      await new Promise<void>((resolve) => setTimeout(resolve, 15))

      // Should be expired
      expect(await cache.get('expiring')).toBeUndefined()
    })

    it('should use default TTL when not specified', async () => {
      const originalDateNow = Date.now
      let currentTime = 1000000
      Date.now = jest.fn(() => currentTime)

      await cache.set('default-ttl', 'value')

      // Should exist initially
      expect(await cache.get('default-ttl')).toBe('value')

      // Move time forward by less than default TTL (5 minutes = 300000ms)
      currentTime += 299999
      expect(await cache.get('default-ttl')).toBe('value')

      // Move time forward past default TTL
      currentTime += 2
      expect(await cache.get('default-ttl')).toBeUndefined()

      Date.now = originalDateNow
    })
  })

  describe('utility methods', () => {
    it('should track cache size', () => {
      expect(cache.size()).toBe(0)
    })

    it('should update size when adding items', async () => {
      await cache.set('key1', 'value1')
      expect(cache.size()).toBe(1)

      await cache.set('key2', 'value2')
      expect(cache.size()).toBe(2)
    })

    it('should update size when deleting items', async () => {
      await cache.set('key1', 'value1')
      await cache.set('key2', 'value2')
      expect(cache.size()).toBe(2)

      await cache.delete('key1')
      expect(cache.size()).toBe(1)
    })

    it('should clear all items', async () => {
      await cache.set('key1', 'value1')
      await cache.set('key2', 'value2')
      expect(cache.size()).toBe(2)

      cache.clear()
      expect(cache.size()).toBe(0)
      expect(await cache.get('key1')).toBeUndefined()
      expect(await cache.get('key2')).toBeUndefined()
    })

    it('should handle expired items in size calculation', async () => {
      const originalDateNow = Date.now
      let currentTime = 1000000
      Date.now = jest.fn(() => currentTime)

      await cache.set('expiring', 'value', 100) // Short TTL
      expect(cache.size()).toBe(1)

      // Move time forward to expire the item
      currentTime += 200

      // Accessing expired item should remove it and update size
      expect(await cache.get('expiring')).toBeUndefined()
      expect(cache.size()).toBe(0)

      Date.now = originalDateNow
    })
  })

  describe('edge cases', () => {
    it('should handle setting same key multiple times', async () => {
      await cache.set('key', 'value1')
      await cache.set('key', 'value2')

      expect(await cache.get('key')).toBe('value2')
      expect(cache.size()).toBe(1)
    })

    it('should handle deleting non-existent keys', async () => {
      await cache.delete('nonexistent')
      expect(cache.size()).toBe(0)
    })

    it('should handle zero and negative TTL', async () => {
      await cache.set('zero-ttl', 'value', 0)
      expect(await cache.get('zero-ttl')).toBeUndefined()
    })
  })
})
