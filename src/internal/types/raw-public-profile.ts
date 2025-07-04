/**
 * Raw public profile API response types (internal implementation details)
 */

export interface RawSubstackPublicProfile {
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
