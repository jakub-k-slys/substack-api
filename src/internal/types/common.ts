/**
 * Common internal type definitions to reduce duplication across API response types
 * These represent frequently reused structures in flattened form
 */

/**
 * Base user information that appears across different API responses
 */
export interface SubstackUser {
  id: number
  name: string
  handle: string
  previous_name?: string
  photo_url: string
  bio?: string
  profile_set_up_at: string
  reader_installed_at: string
  bestseller_tier?: number | null
}

/**
 * Base publication information in flattened form
 */
export interface SubstackPublicationBase {
  id: number
  name: string
  subdomain: string
  custom_domain?: string
  custom_domain_optional: boolean
  logo_url: string
  author_id: number
  user_id: number
  handles_enabled: boolean
  explicit: boolean
  is_personal_mode: boolean
  payments_state: string
  pledges_enabled: boolean
}

/**
 * Extended publication information for profile contexts
 */
export interface SubstackProfilePublication extends SubstackPublicationBase {
  hero_text?: string
  primary_user_id: number
  theme_var_background_pop: string
  created_at: string
  email_from_name?: string | null
  copyright?: string
  founding_plan_name?: string
  community_enabled: boolean
  invite_only: boolean
  language?: string | null
  homepage_type: string
  author: SubstackUser
}

/**
 * Author information in flattened form (used in comments, posts, etc.)
 */
export interface SubstackAuthor {
  id: number
  name: string
  is_admin?: boolean
}

/**
 * Link metadata for attachments in flattened form
 */
export interface SubstackLinkMetadata {
  url: string
  host: string
  title: string
  description?: string
  image?: string
  original_image?: string
}

/**
 * Attachment information in flattened form
 */
export interface SubstackAttachment {
  id: string
  type: string
  imageUrl?: string
  imageWidth?: number
  imageHeight?: number
  explicit: boolean
  linkMetadata?: SubstackLinkMetadata
}

/**
 * Theme information in flattened form
 */
export interface SubstackTheme {
  background_pop_color?: string
  web_bg_color?: string
  cover_bg_color?: string | null
}

/**
 * User link information
 */
export interface SubstackUserLink {
  id: number
  value: string
  url: string
  type?: string | null
  label: string
}

/**
 * Publication user relationship information
 */
export interface SubstackPublicationUser {
  id: number
  user_id: number
  publication_id: number
  role: string
  public: boolean
  is_primary: boolean
  publication: SubstackProfilePublication
}

/**
 * Subscription information
 */
export interface SubstackProfileSubscription {
  user_id: number
  id: number
  visibility: string
  membership_state: string
  type?: string | null
  is_founding: boolean
  email_settings?: Record<string, string>
  section_podcasts_enabled?: number[]
  publication: SubstackProfilePublication
}

/**
 * Tracking parameters in flattened form
 */
export interface SubstackTrackingParameters {
  item_primary_entity_key: string
  item_entity_key: string
  item_type: string
  item_comment_id?: number
  item_post_id?: number
  item_publication_id?: number
  item_content_user_id: number
  item_context_type: string
  item_context_type_bucket: string
  item_context_timestamp: string
  item_context_user_id: number
  item_context_user_ids: number[]
  item_can_reply: boolean
  item_is_fresh: boolean
  item_last_impression_at: string | null
  item_source?: string
  item_page: number | null
  item_page_rank: number
  impression_id: string
  followed_user_count: number
  subscribed_publication_count: number
  is_following: boolean
  is_explicitly_subscribed: boolean
}

/**
 * Context information for user profile items
 */
export interface SubstackProfileItemContext {
  type: string
  timestamp: string
  users: Array<
    SubstackUser & {
      primary_publication?: SubstackPublicationBase
    }
  >
  fallbackReason?: string
  fallbackUrl?: string | null
  isFresh: boolean
  source: string
  searchTrackingParameters?: Record<string, unknown>
  page?: number | null
  page_rank: number
}
