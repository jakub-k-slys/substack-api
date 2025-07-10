import { CachingSlugService } from '../../src/internal/services/caching-slug-service'
import { InMemoryCache } from '../../src/internal/cache/in-memory-cache'
import type { SlugResolver } from '../../src/internal/services/slug-resolver'

// Mock SlugResolver for testing
const mockSlugResolver = (): jest.Mocked<SlugResolver> => ({
  getSlugMapping: jest.fn(),
  getSlugForUserId: jest.fn()
})

describe('CachingSlugService', () => {
  let cachingSlugService: CachingSlugService
  let mockBase: jest.Mocked<SlugResolver>
  let cache: InMemoryCache<number, string>

  const mockMapping = new Map([
    [123, 'test-author'],
    [456, 'another-author']
  ])

  beforeEach(() => {
    jest.clearAllMocks()
    cache = new InMemoryCache<number, string>()
    mockBase = mockSlugResolver()
    cachingSlugService = new CachingSlugService(cache, mockBase)
  })

  describe('getSlugMapping', () => {
    it('should delegate to base service and cache the result', async () => {
      mockBase.getSlugMapping.mockResolvedValueOnce(mockMapping)

      const result = await cachingSlugService.getSlugMapping()

      expect(result).toBe(mockMapping)
      expect(mockBase.getSlugMapping).toHaveBeenCalledTimes(1)
      expect(cachingSlugService.isCached()).toBe(true)

      // Check that individual entries are cached
      expect(cache.get(123)).toBe('test-author')
      expect(cache.get(456)).toBe('another-author')
    })

    it('should return cached mapping on second call', async () => {
      mockBase.getSlugMapping.mockResolvedValueOnce(mockMapping)

      const result1 = await cachingSlugService.getSlugMapping()
      const result2 = await cachingSlugService.getSlugMapping()

      expect(result1).toBe(result2) // Same object reference (cached)
      expect(mockBase.getSlugMapping).toHaveBeenCalledTimes(1) // Only called once
    })

    it('should handle empty mapping', async () => {
      const emptyMapping = new Map<number, string>()
      mockBase.getSlugMapping.mockResolvedValueOnce(emptyMapping)

      const result = await cachingSlugService.getSlugMapping()

      expect(result).toBe(emptyMapping)
      expect(result.size).toBe(0)
      expect(cachingSlugService.isCached()).toBe(true)
    })

    it('should propagate errors from base service', async () => {
      const error = new Error('Base service error')
      mockBase.getSlugMapping.mockRejectedValueOnce(error)

      await expect(cachingSlugService.getSlugMapping()).rejects.toThrow('Base service error')
      expect(mockBase.getSlugMapping).toHaveBeenCalledTimes(1)
      expect(cachingSlugService.isCached()).toBe(false)
    })
  })

  describe('getSlugForUserId', () => {
    it('should return cached value if available', async () => {
      cache.set(123, 'cached-author')

      const result = await cachingSlugService.getSlugForUserId(123)

      expect(result).toBe('cached-author')
      expect(mockBase.getSlugForUserId).not.toHaveBeenCalled()
    })

    it('should delegate to base service if not cached', async () => {
      mockBase.getSlugForUserId.mockResolvedValueOnce('base-author')

      const result = await cachingSlugService.getSlugForUserId(123, 'fallback')

      expect(result).toBe('base-author')
      expect(mockBase.getSlugForUserId).toHaveBeenCalledWith(123, 'fallback')
      expect(cache.get(123)).toBe('base-author') // Should be cached
    })

    it('should not cache fallback values', async () => {
      mockBase.getSlugForUserId.mockResolvedValueOnce('fallback-handle')

      const result = await cachingSlugService.getSlugForUserId(999, 'fallback-handle')

      expect(result).toBe('fallback-handle')
      expect(cache.has(999)).toBe(false) // Fallback should not be cached
    })

    it('should not cache undefined values', async () => {
      mockBase.getSlugForUserId.mockResolvedValueOnce(undefined)

      const result = await cachingSlugService.getSlugForUserId(999)

      expect(result).toBeUndefined()
      expect(cache.has(999)).toBe(false) // Undefined should not be cached
    })

    it('should cache actual slug values (not fallback)', async () => {
      mockBase.getSlugForUserId.mockResolvedValueOnce('actual-slug')

      const result = await cachingSlugService.getSlugForUserId(123, 'fallback')

      expect(result).toBe('actual-slug')
      expect(cache.get(123)).toBe('actual-slug') // Should be cached
    })

    it('should propagate errors from base service', async () => {
      const error = new Error('Base service error')
      mockBase.getSlugForUserId.mockRejectedValueOnce(error)

      await expect(cachingSlugService.getSlugForUserId(123)).rejects.toThrow('Base service error')
      expect(mockBase.getSlugForUserId).toHaveBeenCalledWith(123, undefined)
    })
  })

  describe('cache management', () => {
    it('should clear all caches', async () => {
      // Set up caches
      mockBase.getSlugMapping.mockResolvedValueOnce(mockMapping)
      await cachingSlugService.getSlugMapping()
      cache.set(999, 'manual-entry')

      expect(cachingSlugService.isCached()).toBe(true)
      expect(cache.size()).toBe(3) // 2 from mapping + 1 manual

      cachingSlugService.clearCache()

      expect(cachingSlugService.isCached()).toBe(false)
      expect(cache.size()).toBe(0)
    })

    it('should report cache status correctly', () => {
      expect(cachingSlugService.isCached()).toBe(false)
    })

    it('should report cached after mapping is fetched', async () => {
      mockBase.getSlugMapping.mockResolvedValueOnce(mockMapping)

      await cachingSlugService.getSlugMapping()

      expect(cachingSlugService.isCached()).toBe(true)
    })
  })

  describe('integration scenarios', () => {
    it('should work when both mapping and individual caches are used', async () => {
      // First, get mapping which populates both caches
      mockBase.getSlugMapping.mockResolvedValueOnce(mockMapping)
      const mapping = await cachingSlugService.getSlugMapping()

      // Then get individual slug which should use individual cache
      const slug = await cachingSlugService.getSlugForUserId(123)

      expect(mapping.get(123)).toBe('test-author')
      expect(slug).toBe('test-author')
      expect(mockBase.getSlugForUserId).not.toHaveBeenCalled() // Used cache
      expect(mockBase.getSlugMapping).toHaveBeenCalledTimes(1)
    })

    it('should handle mixed cache scenarios', async () => {
      // Manually cache one entry
      cache.set(123, 'manually-cached')

      // Get slug for cached entry (should use cache)
      const cachedSlug = await cachingSlugService.getSlugForUserId(123)
      expect(cachedSlug).toBe('manually-cached')
      expect(mockBase.getSlugForUserId).not.toHaveBeenCalled()

      // Get slug for non-cached entry (should delegate)
      mockBase.getSlugForUserId.mockResolvedValueOnce('delegated-slug')
      const delegatedSlug = await cachingSlugService.getSlugForUserId(456, 'fallback')
      expect(delegatedSlug).toBe('delegated-slug')
      expect(mockBase.getSlugForUserId).toHaveBeenCalledWith(456, 'fallback')
      expect(cache.get(456)).toBe('delegated-slug') // Should now be cached
    })
  })
})
