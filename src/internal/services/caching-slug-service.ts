import type { SlugResolver } from './slug-resolver'
import type { Cache } from '../cache'

/**
 * Caching decorator for SlugResolver
 * Implements the Decorator pattern to add caching behavior to any SlugResolver
 */
export class CachingSlugService implements SlugResolver {
  constructor(
    private readonly cache: Cache<number, string>,
    private readonly base: SlugResolver
  ) {}

  /**
   * Get or build the user_id to slug mapping from subscriptions
   * Delegates to the base service without additional caching
   * @returns Promise<Map<number, string>> - Mapping of user IDs to slugs
   * @throws {Error} When subscriptions cannot be fetched (falls back to empty mapping)
   */
  async getSlugMapping(): Promise<Map<number, string>> {
    return this.base.getSlugMapping()
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
}
