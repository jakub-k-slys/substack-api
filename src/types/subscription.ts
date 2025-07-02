/**
 * Subscription types for the /api/v1/subscriptions endpoint
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
  email_settings: Record<string, any> | null
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
  theme?: {
    background_pop_color?: string
    web_bg_color?: string
    cover_bg_color?: string | null
  }
}

export interface SubstackSubscriptionsResponse {
  subscriptions: SubstackSubscription[]
  publicationUsers: SubstackPublicationUser[]
  publications: SubstackSubscriptionPublication[]
}
