import type { SubstackUser } from '@substack-api/internal/types/substack-user'
import type { SubstackPublicationBase } from '@substack-api/internal/types/substack-publication-base'

export interface SubstackNoteContext {
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
  searchTrackingParameters?: Record<string, unknown>
  page?: number | null
  page_rank: number
}
