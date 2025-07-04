/**
 * NoteService - Business logic for note operations
 */

import type { ServiceConfig } from './types'
import type { RawSubstackNote } from '../internal/types'
import type { SubstackNote } from '../types'
import { Note } from '../entities'

export class NoteService {
  constructor(private readonly config: ServiceConfig) {}

  /**
   * Convert raw note data to the expected SubstackNote format
   */
  private convertRawToSubstackNote(rawNote: RawSubstackNote): SubstackNote {
    return {
      entity_key: rawNote.entity_key,
      type: rawNote.type,
      context: {
        type: rawNote.context.type,
        timestamp: rawNote.context.timestamp,
        users: rawNote.context.users,
        fallbackReason: rawNote.context.fallbackReason,
        fallbackUrl: rawNote.context.fallbackUrl,
        isFresh: rawNote.context.isFresh,
        searchTrackingParameters: rawNote.context.searchTrackingParameters,
        page: rawNote.context.page,
        page_rank: rawNote.context.page_rank
      },
      publication: rawNote.publication || null,
      post: rawNote.post || null,
      comment: rawNote.comment
        ? {
            name: rawNote.comment.name || '',
            handle: rawNote.comment.handle || '',
            photo_url: rawNote.comment.photo_url || '',
            id: rawNote.comment.id,
            body: rawNote.comment.body,
            body_json: undefined,
            publication_id: null,
            post_id: null,
            user_id: rawNote.comment.user_id || 0,
            type: rawNote.comment.type || 'note',
            date: rawNote.comment.date || '',
            edited_at: null,
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            media_clip_id: null,
            reaction_count: rawNote.comment.reaction_count || 0,
            reactions: rawNote.comment.reactions || {},
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: [],
            user_bestseller_tier: null,
            user_primary_publication: undefined
          }
        : undefined,
      parentComments: (rawNote.parentComments || []).map((pc) => ({
        name: pc.name,
        handle: '',
        photo_url: '',
        id: pc.id,
        body: pc.body,
        body_json: undefined,
        publication_id: null,
        post_id: pc.post_id || null,
        user_id: pc.user_id,
        type: 'comment',
        date: pc.date,
        edited_at: null,
        ancestor_path: '',
        reply_minimum_role: 'everyone',
        media_clip_id: null,
        reaction_count: 0,
        reactions: {},
        restacks: 0,
        restacked: false,
        children_count: 0,
        attachments: [],
        user_bestseller_tier: null,
        user_primary_publication: undefined
      })),
      canReply: rawNote.canReply,
      isMuted: rawNote.isMuted,
      trackingParameters: rawNote.trackingParameters
    }
  }

  /**
   * Get a specific note by ID
   */
  async getNoteById(id: string): Promise<Note> {
    try {
      this.config.logger?.debug('Fetching note by ID', { id })

      const rawNote = await this.config.httpClient.get<RawSubstackNote>(`/api/v1/notes/${id}`)
      const substackNote = this.convertRawToSubstackNote(rawNote)

      this.config.logger?.debug('Note fetched successfully', {
        id,
        body: substackNote.comment?.body?.substring(0, 50)
      })

      return new Note(substackNote, this.config.httpClient)
    } catch (error) {
      this.config.logger?.error('Failed to fetch note by ID', {
        id,
        error: (error as Error).message
      })
      throw new Error(`Note with ID ${id} not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get notes for a specific profile
   */
  async getNotesForProfile(
    profileUserId: number,
    options: { limit?: number; offset?: number } = {}
  ): Promise<SubstackNote[]> {
    try {
      this.config.logger?.debug('Fetching notes for profile', { profileUserId, options })

      const perPage = this.config.httpClient.getPerPage()
      const actualLimit = Math.min(options.limit || perPage, perPage)
      const offset = options.offset || 0

      const response = await this.config.httpClient.get<{ items?: RawSubstackNote[] }>(
        `/api/v1/reader/feed/profile/${profileUserId}?limit=${actualLimit}&offset=${offset}`
      )

      const notes = response.items?.filter((item) => item.type === 'note') || []
      this.config.logger?.debug('Notes fetched successfully', {
        profileUserId,
        count: notes.length
      })

      return notes.map((note) => this.convertRawToSubstackNote(note))
    } catch (error) {
      this.config.logger?.error('Failed to fetch notes for profile', {
        profileUserId,
        options,
        error: (error as Error).message
      })
      throw new Error(
        `Failed to fetch notes for profile ${profileUserId}: ${(error as Error).message}`
      )
    }
  }

  /**
   * Create a new note
   */
  async createNote(body: string): Promise<Note> {
    try {
      this.config.logger?.debug('Creating note', { bodyLength: body.length })

      const rawNote = await this.config.httpClient.post<RawSubstackNote>('/api/v1/comment/feed', {
        body,
        context: {
          type: 'feed'
        }
      })

      const substackNote = this.convertRawToSubstackNote(rawNote)

      this.config.logger?.debug('Note created successfully', { id: substackNote.entity_key })

      return new Note(substackNote, this.config.httpClient)
    } catch (error) {
      this.config.logger?.error('Failed to create note', {
        body: body.substring(0, 50),
        error: (error as Error).message
      })
      throw new Error(`Failed to create note: ${(error as Error).message}`)
    }
  }
}
