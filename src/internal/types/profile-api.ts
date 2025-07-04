/**
 * Internal profile API response types
 */

export interface SubstackPublicProfile {
  id: number
  name: string
  handle: string
  previous_name?: string
  photo_url: string
  bio?: string
  profile_set_up_at: string
  reader_installed_at: string
  tos_accepted_at?: string | null
  profile_disabled: boolean
  publicationUsers: Array<{
    id: number
    user_id: number
    publication_id: number
    role: string
    public: boolean
    is_primary: boolean
    publication: {
      id: number
      name: string
      subdomain: string
      custom_domain?: string | null
      custom_domain_optional: boolean
      hero_text?: string
      logo_url: string
      author_id: number
      primary_user_id: number
      theme_var_background_pop: string
      created_at: string
      email_from_name?: string | null
      copyright?: string
      founding_plan_name?: string
      community_enabled: boolean
      invite_only: boolean
      payments_state: string
      language?: string | null
      explicit: boolean
      homepage_type: string
      is_personal_mode: boolean
      author: {
        id: number
        name: string
        handle: string
        previous_name?: string
        photo_url: string
        bio?: string
        profile_set_up_at: string
        reader_installed_at: string
      }
    }
  }>
  userLinks: Array<{
    id: number
    value: string
    url: string
    type?: string | null
    label: string
  }>
  subscriptions: Array<{
    user_id: number
    id: number
    visibility: string
    membership_state: string
    type?: string | null
    is_founding: boolean
    email_settings?: Record<string, string>
    section_podcasts_enabled?: number[]
    publication: {
      id: number
      name: string
      subdomain: string
      custom_domain?: string | null
      custom_domain_optional: boolean
      hero_text?: string
      logo_url: string
      author_id: number
      primary_user_id: number
      theme_var_background_pop: string
      created_at: string
      email_from_name?: string | null
      copyright?: string
      founding_plan_name?: string
      community_enabled: boolean
      invite_only: boolean
      payments_state: string
      language?: string | null
      explicit: boolean
      homepage_type: string
      is_personal_mode: boolean
      author: {
        id: number
        name: string
        handle: string
        previous_name?: string
        photo_url: string
        bio?: string
        profile_set_up_at: string
        reader_installed_at: string
      }
    }
  }>
  subscriptionsTruncated: boolean
  hasGuestPost: boolean
  primaryPublication?: {
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
  max_pub_tier: number
  hasActivity: boolean
  hasLikes: boolean
  lists: unknown[]
  rough_num_free_subscribers_int: number
  rough_num_free_subscribers: string
  bestseller_badge_disabled: boolean
  bestseller_tier?: number | null
  subscriberCountString: string
  subscriberCount: string
  subscriberCountNumber: number
  hasHiddenPublicationUsers: boolean
  visibleSubscriptionsCount: number
  slug: string
  previousSlug?: string
  primaryPublicationIsPledged: boolean
  primaryPublicationSubscriptionState: string
  isSubscribed: boolean
  isFollowing: boolean
  followsViewer: boolean
  can_dm: boolean
  dm_upgrade_options: string[]
}

export interface SubstackFullProfile extends SubstackPublicProfile {
  userProfile?: SubstackUserProfile
}

export interface SubstackUserProfile {
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
    publication?: {
      name: string
      hostname: string
      subdomain: string
      logo?: {
        url: string
      }
      description?: string
    } | null
    post?: {
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
    } | null
    comment?: {
      id: number
      body: string
      created_at: string
      parent_post_id: number
      author: {
        id: number
        name: string
        is_admin?: boolean
      }
    } | null
    parentComments: Array<{
      id: number
      body: string
      created_at: string
      parent_post_id: number
      author: {
        id: number
        name: string
        is_admin?: boolean
      }
    }>
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
