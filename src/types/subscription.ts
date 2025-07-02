/**
 * Subscription types for the /api/v1/subscriptions endpoint
 */

export interface SubstackSubscription {
  user_id: number
  id: number
  visibility: string
  membership_state: string
  type?: string | null
  is_founding: boolean
  email_settings?: Record<string, string>
  section_podcasts_enabled?: number[]
  author_handle: string // This is the key field for slug resolution
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
}

export interface SubstackSubscriptionsResponse {
  subscriptions: SubstackSubscription[]
}
