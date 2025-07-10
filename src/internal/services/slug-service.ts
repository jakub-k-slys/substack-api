import type { SubstackSubscriptionsResponse, SubstackSubscriptionPublication } from '../types'
import type { HttpClient } from '../http-client'
import type { SlugResolver } from './slug-resolver'

/**
 * Service responsible for slug resolution and user handle management
 * Returns internal types that can be transformed into domain models
 * This is a pure service without caching - use CachingSlugService for cached behavior
 */
export class SlugService implements SlugResolver {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get or build the user_id to slug mapping from subscriptions
   * @returns Promise<Map<number, string>> - Mapping of user IDs to slugs
   * @throws {Error} When subscriptions cannot be fetched (falls back to empty mapping)
   */
  async getSlugMapping(): Promise<Map<number, string>> {
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

      return mapping
    } catch {
      // If subscriptions endpoint fails, return empty mapping
      // This ensures graceful fallback
      return new Map<number, string>()
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
}
