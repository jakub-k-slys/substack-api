/**
 * SubstackClient utilities (internal helpers)
 */

import type { SubstackHttpClient } from './http-client'
import type { SubstackSubscriptionsResponse, SubstackSubscriptionPublication } from './types'

/**
 * Subscription cache for mapping user IDs to slugs
 */
export interface SubscriptionCache {
  mapping: Map<number, string> | null
  timestamp: number | null
}

/**
 * Get slug mapping from subscriptions data with caching
 */
export async function getSlugMapping(
  httpClient: SubstackHttpClient,
  cache: SubscriptionCache
): Promise<Map<number, string>> {
  // Return cached mapping if available and fresh (within session)
  if (cache.mapping && cache.timestamp) {
    return cache.mapping
  }

  try {
    // Fetch subscriptions data
    const subscriptionsResponse =
      await httpClient.get<SubstackSubscriptionsResponse>('/api/v1/subscriptions')

    // Build user_id -> slug mapping
    const mapping = new Map<number, string>()

    for (const publication of subscriptionsResponse.publications as SubstackSubscriptionPublication[]) {
      if (publication.author_id) {
        // Use subdomain as the slug, or custom_domain if the publication is not on substack
        const slug = publication.author_handle || undefined
        if (slug) {
          mapping.set(publication.author_id, slug)
        }
      }
    }

    // Cache the mapping
    cache.mapping = mapping
    cache.timestamp = Date.now()

    return mapping
  } catch {
    // If subscriptions endpoint fails, return empty mapping
    // This ensures graceful fallback
    const emptyMapping = new Map<number, string>()
    cache.mapping = emptyMapping
    cache.timestamp = Date.now()
    return emptyMapping
  }
}

/**
 * Get slug for a user ID, with fallback to handle from profile data
 */
export async function getSlugForUserId(
  httpClient: SubstackHttpClient,
  cache: SubscriptionCache,
  userId: number,
  fallbackHandle?: string
): Promise<string | undefined> {
  const slugMapping = await getSlugMapping(httpClient, cache)
  return slugMapping.get(userId) || fallbackHandle
}
