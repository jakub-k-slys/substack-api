/**
 * Raw user profile API response types (internal implementation details)
 */

export interface RawSubstackUserProfile {
  items: Array<{
    entity_key: string
    type: string
    context: {
      type: string
      timestamp: string
      users: Array<{
        id: number
        name: string
        handle: string
        previous_name?: string
        photo_url: string
        bio?: string
        profile_set_up_at: string
        reader_installed_at: string
        bestseller_tier?: number | null
        primary_publication?: {
          id: number
          subdomain: string
          custom_domain_optional: boolean
          name: string
          logo_url: string
          author_id: number
          user_id: number
          handles_enabled: boolean
          explicit: boolean
          is_personal_mode: boolean
          payments_state: string
          pledges_enabled: boolean
        }
      }>
      fallbackReason?: string
      fallbackUrl?: string | null
      isFresh: boolean
      source: string
      searchTrackingParameters?: Record<string, unknown>
      page?: number | null
      page_rank: number
    }
    publication?: RawSubstackPublication | null
    post?: RawSubstackPost | null
    comment?: RawSubstackComment | null
    parentComments: Array<RawSubstackComment>
    canReply: boolean
    isMuted: boolean
    trackingParameters: {
      item_primary_entity_key: string
      item_entity_key: string
      item_type: string
      item_comment_id: number
      item_content_user_id: number
      item_context_type: string
      item_context_type_bucket: string
      item_context_timestamp: string
      item_context_user_id: number
      item_context_user_ids: number[]
      item_can_reply: boolean
      item_is_fresh: boolean
      item_last_impression_at: string | null
      item_source: string
      item_page: number | null
      item_page_rank: number
      impression_id: string
      followed_user_count: number
      subscribed_publication_count: number
      is_following: boolean
      is_explicitly_subscribed: boolean
    }
  }>
  originalCursorTimestamp: string
  nextCursor: string
}

// Re-export helper types to maintain the raw naming convention
export type RawSubstackPublication = {
  name: string
  hostname: string
  subdomain: string
  logo?: {
    url: string
  }
  description?: string
}

export type RawSubstackPost = {
  id: number
  title: string
  subtitle?: string
  slug: string
  post_date: string
  description?: string
  audience?: string
  canonical_url: string
  cover_image?: string
  podcast_url?: string
  type: 'newsletter' | 'podcast' | 'thread'
  published?: boolean
  paywalled?: boolean
}

export type RawSubstackComment = {
  id: number
  body: string
  created_at: string
  parent_post_id: number
  author: {
    id: number
    name: string
    is_admin?: boolean
  }
}
