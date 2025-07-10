import type { SlugResolver } from './slug-resolver'
import type { Cache } from '../cache'

/**
 * Caching decorator for SlugResolver
 * Implements the Decorator pattern to add caching behavior to any SlugResolver
 */
export class CachingSlugService implements SlugResolver {
  private mappingCache: Map<number, string> | null = null
  private mappingCacheTimestamp: number | null = null

  constructor(
    private readonly cache: Cache<number, string>,
    private readonly base: SlugResolver
  ) {}

  /**
   * Get or build the user_id to slug mapping from subscriptions with caching
   * @returns Promise<Map<number, string>> - Mapping of user IDs to slugs
   * @throws {Error} When subscriptions cannot be fetched (falls back to empty mapping)
   */
  async getSlugMapping(): Promise<Map<number, string>> {
    // Return cached mapping if available and fresh (within session)
    if (this.mappingCache && this.mappingCacheTimestamp) {
      return this.mappingCache
    }

    // Delegate to base service to get the mapping
    const mapping = await this.base.getSlugMapping()

    // Cache the full mapping for subsequent calls
    this.mappingCache = mapping
    this.mappingCacheTimestamp = Date.now()

    // Also populate individual cache entries for getSlugForUserId
    for (const [userId, slug] of mapping) {
      this.cache.set(userId, slug)
    }

    return mapping
  }

  /**
   * Get slug for a user ID with caching, with fallback to handle from profile data
   * @param userId - The user ID to resolve slug for
   * @param fallbackHandle - Optional fallback handle to use if slug not found
   * @returns Promise<string | undefined> - Resolved slug or undefined if not found
   */
  async getSlugForUserId(userId: number, fallbackHandle?: string): Promise<string | undefined> {
    // Check individual cache first
    if (this.cache.has(userId)) {
      return this.cache.get(userId)!
    }

    // If not in individual cache, delegate to base service
    const slug = await this.base.getSlugForUserId(userId, fallbackHandle)

    // Cache the result if we found a slug (not fallback or undefined)
    if (slug && slug !== fallbackHandle) {
      this.cache.set(userId, slug)
    }

    return slug
  }

  /**
   * Clear the cached slug mapping
   * Useful for forcing a refresh of the subscriptions data
   */
  clearCache(): void {
    this.cache.clear()
    this.mappingCache = null
    this.mappingCacheTimestamp = null
  }

  /**
   * Check if the slug mapping cache is populated
   * @returns boolean - True if cache has data
   */
  isCached(): boolean {
    return this.mappingCache !== null && this.mappingCacheTimestamp !== null
  }
}
