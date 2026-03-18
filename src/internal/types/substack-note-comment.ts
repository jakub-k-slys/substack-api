import type { SubstackAttachment } from '@substack-api/internal/types/substack-attachment'
import type { SubstackPublication } from '@substack-api/internal/types/substack-publication'

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
