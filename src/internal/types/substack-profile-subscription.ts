import type { SubstackProfilePublication } from '@substack-api/internal/types/substack-profile-publication'

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
