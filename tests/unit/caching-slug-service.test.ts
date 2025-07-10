import { CachingSlugService } from '../../src/internal/services/caching-slug-service'
import { InMemoryCache } from '../../src/internal/cache/in-memory-cache'
import type { SlugResolver } from '../../src/internal/services/slug-resolver'

// Mock SlugResolver for testing
const mockSlugResolver = (): jest.Mocked<SlugResolver> => ({
  getSlugForUserId: jest.fn()
})

describe('CachingSlugService', () => {
  let cachingSlugService: CachingSlugService
  let mockBase: jest.Mocked<SlugResolver>
  let cache: InMemoryCache<number, string>

  beforeEach(() => {
    jest.clearAllMocks()
    cache = new InMemoryCache<number, string>()
    mockBase = mockSlugResolver()
    cachingSlugService = new CachingSlugService(cache, mockBase)
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

  describe('integration scenarios', () => {
    it('should cache individual slugs when fetched separately', async () => {
      // Get individual slug which should delegate and cache
      mockBase.getSlugForUserId.mockResolvedValueOnce('test-author')
      const slug1 = await cachingSlugService.getSlugForUserId(123)

      // Second call should use cache
      const slug2 = await cachingSlugService.getSlugForUserId(123)

      expect(slug1).toBe('test-author')
      expect(slug2).toBe('test-author')
      expect(mockBase.getSlugForUserId).toHaveBeenCalledTimes(1) // Only called once
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
