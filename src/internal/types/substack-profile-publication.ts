import type { SubstackPublicationBase } from '@substack-api/internal/types/substack-publication-base'
import type { SubstackUser } from '@substack-api/internal/types/substack-user'

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
