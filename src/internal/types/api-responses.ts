/**
 * Internal API response types - not exported from the public API
 * These represent raw response shapes from Substack's API endpoints
 */

/**
 * Raw API response shape for publications - flattened
 */
export interface SubstackPublication {
  name: string
  hostname: string
  subdomain: string
  logo_url?: string
  description?: string
}

/**
 * Raw API response shape for posts
 */
export interface SubstackPost {
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

/**
 * Raw API response shape for comments - flattened
 */
export interface SubstackComment {
  id: number
  body: string
  created_at: string
  parent_post_id: number
  author_id: number
  author_name: string
  author_is_admin?: boolean
}

/**
 * Response structure from /api/v1/reader/comment/{id} endpoint - keeping wrapper structure
 */
export interface SubstackCommentResponse {
  item: {
    comment: {
      id: number
      body: string
      user_id: number
      name: string
      date: string
      post_id?: number | null
      // Additional fields that may be present but not needed for our Comment entity
      [key: string]: unknown
    }
  }
}

/**
 * Raw API response shape for search results
 */
export interface SubstackSearchResult {
  total: number
  results: SubstackPost[]
}

/**
 * Subscription types for internal API responses
 */
export interface SubstackSubscription {
  id: number
  user_id: number
  publication_id: number
  expiry: string | null
  email_disabled: boolean
  membership_state: string
  type: string | null
  gift_user_id: number | null
  created_at: string
  gifted_at: string | null
  paused: string | null
  is_group_parent: boolean
  visibility: string
  is_founding: boolean
  is_favorite: boolean
  podcast_rss_token: string
  email_settings: Record<string, unknown> | null
  section_podcasts_enabled: string[] | null
}

export interface SubstackPublicationUser {
  id: number
  publication_id: number
  user_id: number
  public: boolean
  created_at: string
  updated_at: string
  public_rank: number
  name: string | null
  bio: string | null
  photo_url: string | null
  role: string
  is_primary: boolean
  show_badge: boolean | null
  is_in_notes_feed: boolean
  twitter_screen_name: string | null
  email: string | null
  primary_section_id: number | null
}

export interface SubstackSubscriptionPublication {
  id: number
  name: string
  subdomain: string
  custom_domain?: string | null
  is_on_substack: boolean
  author_id: number
  author_handle: string
  created_at: string
  logo_url?: string
  cover_photo_url?: string
  twitter_screen_name?: string | null
  community_enabled: boolean
  copyright?: string
  founding_subscription_benefits?: string[]
  paid_subscription_benefits?: string[]
  free_subscription_benefits?: string[]
  stripe_user_id?: string
  stripe_country?: string
  payments_state?: string
  language?: string
  email_from_name?: string
  homepage_type?: string
  theme_background_pop_color?: string
  theme_web_bg_color?: string
  theme_cover_bg_color?: string | null
}

export interface SubstackSubscriptionsResponse {
  subscriptions: SubstackSubscription[]
  publicationUsers: SubstackPublicationUser[]
  publications: SubstackSubscriptionPublication[]
}
