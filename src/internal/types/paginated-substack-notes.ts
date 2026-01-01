import type { SubstackNote } from '@substack-api/internal/types/substack-note'

/**
 * Paginated response for notes API that supports cursor-based pagination
 */
export interface PaginatedSubstackNotes {
  notes: SubstackNote[]
  nextCursor?: string
}
