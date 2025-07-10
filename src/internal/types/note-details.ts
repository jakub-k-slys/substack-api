/**
 * Internal note context and tracking interfaces
 */

import type { SubstackPublication, SubstackPost } from './api-responses'
import type {
  SubstackUser,
  SubstackPublicationBase,
  SubstackAttachment,
  SubstackTrackingParameters
} from './common'

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

export interface SubstackNoteComment {
  name: string
  handle: string
  photo_url: string
  id: number
  body: string
  body_json?: Record<string, unknown>
  publication_id?: number | null
  post_id?: number | null
  user_id: number
  type: string
  date: string
  edited_at?: string | null
  ancestor_path: string
  reply_minimum_role: string
  media_clip_id?: string | null
  reaction_count: number
  reactions: Record<string, number>
  restacks: number
  restacked: boolean
  children_count: number
  attachments: SubstackAttachment[]
  user_bestseller_tier?: number | null
  user_primary_publication?: SubstackPublication
}

export interface SubstackNoteTracking extends SubstackTrackingParameters {
  // Note-specific tracking fields that extend the base tracking
}

export interface SubstackNote {
  entity_key: string
  type: string
  context: SubstackNoteContext
  publication?: SubstackPublication | null
  post?: SubstackPost | null
  comment?: SubstackNoteComment
  parentComments: Array<SubstackNoteComment>
  canReply: boolean
  isMuted: boolean
  trackingParameters: SubstackNoteTracking
}

/**
 * Paginated response for notes API that supports cursor-based pagination
 */
export interface PaginatedSubstackNotes {
  notes: SubstackNote[]
  nextCursor?: string
}
