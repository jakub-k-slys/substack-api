/**
 * Internal API request/response types for notes
 */

import type { SubstackPublication } from './api-responses'
import type { SubstackAttachment } from './common'

export interface NoteBodyJson {
  type: 'doc'
  attrs: {
    schemaVersion: 'v1'
  }
  content: Array<
    | {
        type: 'paragraph'
        content: Array<{
          type: 'text'
          text: string
          marks?: Array<{
            type: 'bold' | 'italic' | 'code' | 'underline' | 'link'
            attrs?: { href: string } // For link marks
          }>
        }>
      }
    | {
        type: 'bulletList' | 'orderedList'
        content: Array<{
          type: 'listItem'
          content: Array<{
            type: 'paragraph'
            content: Array<{
              type: 'text'
              text: string
              marks?: Array<{
                type: 'bold' | 'italic' | 'code' | 'underline' | 'link'
                attrs?: { href: string } // For link marks
              }>
            }>
          }>
        }>
      }
  >
}

export interface PublishNoteRequest {
  bodyJson: NoteBodyJson
  tabId: string
  surface: string
  replyMinimumRole: 'everyone'
  attachmentIds?: string[]
}

export interface CreateAttachmentRequest {
  url: string
  type: 'link'
}

export interface CreateAttachmentResponse {
  id: string
  type: string
  publication: any
  post: any
}

export interface PublishNoteResponse {
  user_id: number
  body: string
  body_json: NoteBodyJson
  post_id: number | null
  publication_id: number | null
  media_clip_id: string | null
  ancestor_path: string
  type: 'feed'
  status: 'published'
  reply_minimum_role: 'everyone'
  id: number
  deleted: boolean
  date: string
  name: string
  photo_url: string
  reactions: Record<string, number>
  children: Array<unknown>
  user_bestseller_tier: number | null
  isFirstFeedCommentByUser: boolean
  reaction_count: number
  restacks: number
  restacked: boolean
  children_count: number
  attachments: SubstackAttachment[]
  user_primary_publication?: SubstackPublication
}
