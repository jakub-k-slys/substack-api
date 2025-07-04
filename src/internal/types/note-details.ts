/**
 * Internal note context and tracking interfaces
 */

import type { SubstackPublication, SubstackPost } from './api-responses'

export interface SubstackNoteContext {
  type: string
  timestamp: string
  users: Array<{
    id: number
    name: string
    handle: string
    previous_name?: string
    photo_url: string
    bio?: string
    profile_set_up_at: string
    reader_installed_at: string
    bestseller_tier?: number | null
    primary_publication?: {
      id: number
      subdomain: string
      custom_domain?: string
      custom_domain_optional: boolean
      name: string
      logo_url: string
      author_id: number
      user_id: number
      handles_enabled: boolean
      explicit: boolean
      is_personal_mode: boolean
      payments_state: string
      pledges_enabled: boolean
    }
  }>
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
  user_bestseller_tier?: number | null
  user_primary_publication?: SubstackPublication
}

export interface SubstackNoteTracking {
  item_primary_entity_key: string
  item_entity_key: string
  item_type: string
  item_comment_id?: number
  item_post_id?: number
  item_publication_id?: number
  item_content_user_id: number
  item_context_type: string
  item_context_type_bucket: string
  item_context_timestamp: string
  item_context_user_id: number
  item_context_user_ids: number[]
  item_can_reply: boolean
  item_is_fresh: boolean
  item_last_impression_at: string | null
  item_page: number | null
  item_page_rank: number
  impression_id: string
  followed_user_count: number
  subscribed_publication_count: number
  is_following: boolean
  is_explicitly_subscribed: boolean
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
