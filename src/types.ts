import { Substack } from './client'

export interface SubstackPublication {
  name: string
  hostname: string
  subdomain: string
  logo?: {
    url: string
  }
  description?: string
}

export interface SubstackPost {
  id: number
  title: string
  subtitle?: string
  slug: string
  post_date: string
  description?: string
  audience?: string
  canonical_url: string
  cover_image?: string
  podcast_url?: string
  type: 'newsletter' | 'podcast' | 'thread'
  published: boolean
  paywalled: boolean
}

export interface SubstackComment {
  id: number
  body: string
  created_at: string
  parent_post_id: number
  author: {
    id: number
    name: string
    is_admin?: boolean
  }
}

export interface SubstackSearchResult {
  total: number
  results: SubstackPost[]
}

export interface SubstackConfig {
  hostname?: string
  apiVersion?: string
  apiKey: string
}

export interface PaginationParams {
  offset?: number
  limit?: number
  cursor?: string
}

export interface SubstackNote {
  entity_key: string
  type: string
  context: {
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
  publication?: SubstackPublication | null
  post?: SubstackPost | null
  comment?: {
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
  parentComments: Array<SubstackNote['comment']>
  canReply: boolean
  isMuted: boolean
  trackingParameters: {
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
}

export class SubstackNotes {
  constructor(
    private readonly client: Substack,
    public readonly items: SubstackNote[],
    private readonly originalCursorTimestamp: string,
    private readonly nextCursor: string | null
  ) {}

  /**
   * Fetch the next batch of notes using the cursor
   * @returns Promise of the next SubstackNotesResponse, or null if there are no more notes
   */
  async next(): Promise<SubstackNotes | null> {
    if (!this.nextCursor) {
      return null
    }
    return this.client.getNotes({ cursor: this.nextCursor })
  }

  /**
   * Check if there are more notes available
   */
  hasMore(): boolean {
    return !!this.nextCursor
  }
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
  children: SubstackNote['comment'][]
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

export interface SearchParams extends PaginationParams {
  query: string
  published_before?: string
  published_after?: string
  type?: 'newsletter' | 'podcast' | 'thread'
}
