import type { SubstackProfilePublication } from '@substack-api/internal/types/substack-profile-publication'

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
