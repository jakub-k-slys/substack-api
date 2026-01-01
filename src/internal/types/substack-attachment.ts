import type { SubstackLinkMetadata } from '@substack-api/internal/types/substack-link-metadata'

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
