import type { SubstackSubscriptionsResponse, SubstackSubscriptionPublication } from '../types'
import type { SubstackHttpClient } from '../../http-client'

/**
 * Service responsible for slug resolution and user handle management
 * Returns internal types that can be transformed into domain models
 */
export class SlugService {
  private subscriptionsCache: Map<number, string> | null = null // user_id -> slug mapping
  private subscriptionsCacheTimestamp: number | null = null

  constructor(private readonly httpClient: SubstackHttpClient) {}

  /**
   * Get or build the user_id to slug mapping from subscriptions
   * @returns Promise<Map<number, string>> - Mapping of user IDs to slugs
   * @throws {Error} When subscriptions cannot be fetched (falls back to empty mapping)
   */
  async getSlugMapping(): Promise<Map<number, string>> {
    // Return cached mapping if available and fresh (within session)
    if (this.subscriptionsCache && this.subscriptionsCacheTimestamp) {
      return this.subscriptionsCache
    }

    try {
      // Fetch subscriptions data
      const subscriptionsResponse =
        await this.httpClient.get<SubstackSubscriptionsResponse>('/api/v1/subscriptions')

      // Build user_id -> slug mapping
      const mapping = new Map<number, string>()

      for (const publication of subscriptionsResponse.publications as SubstackSubscriptionPublication[]) {
        if (publication.author_id) {
          // Use author_handle as the slug, but only if it's not empty
          const slug = publication.author_handle?.trim() || undefined
          if (slug) {
            mapping.set(publication.author_id, slug)
          }
        }
      }

      // Cache the mapping
      this.subscriptionsCache = mapping
      this.subscriptionsCacheTimestamp = Date.now()

      return mapping
    } catch {
      // If subscriptions endpoint fails, return empty mapping
      // This ensures graceful fallback
      const emptyMapping = new Map<number, string>()
      this.subscriptionsCache = emptyMapping
      this.subscriptionsCacheTimestamp = Date.now()
      return emptyMapping
    }
  }

  /**
   * Get slug for a user ID, with fallback to handle from profile data
   * @param userId - The user ID to resolve slug for
   * @param fallbackHandle - Optional fallback handle to use if slug not found
   * @returns Promise<string | undefined> - Resolved slug or undefined if not found
   */
  async getSlugForUserId(userId: number, fallbackHandle?: string): Promise<string | undefined> {
    const slugMapping = await this.getSlugMapping()
    return slugMapping.get(userId) || fallbackHandle
  }

  /**
   * Clear the cached slug mapping
   * Useful for forcing a refresh of the subscriptions data
   */
  clearCache(): void {
    this.subscriptionsCache = null
    this.subscriptionsCacheTimestamp = null
  }

  /**
   * Check if the slug mapping cache is populated
   * @returns boolean - True if cache has data
   */
  isCached(): boolean {
    return this.subscriptionsCache !== null && this.subscriptionsCacheTimestamp !== null
  }
}
