/**
 * Core note interfaces for Substack notes
 */

import { SubstackPublication } from './content'

export interface NotesIteratorOptions {
  limit?: number
}

export interface NoteBodyJson {
  type: 'doc'
  attrs: {
    schemaVersion: 'v1'
  }
  content: Array<{
    type: 'paragraph'
    content: Array<{
      type: 'text'
      text: string
      marks?: Array<{
        type: 'bold' | 'italic'
      }>
    }>
  }>
}

export interface PublishNoteRequest {
  bodyJson: NoteBodyJson
  replyMinimumRole: 'everyone'
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
  attachments: Array<{
    id: string
    type: string
    imageUrl?: string
    imageWidth?: number
    imageHeight?: number
    explicit: boolean
    linkMetadata?: {
      url: string
      host: string
      title: string
      description?: string
      image?: string
      original_image?: string
    }
  }>
  user_primary_publication?: SubstackPublication
}
