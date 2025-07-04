/**
 * NoteService - Business logic for note operations
 */

import type { ServiceConfig } from './types'
import type { RawSubstackNote } from '../internal/types'
import type { SubstackNote } from '../types'
import { Note } from '../entities'
import { convertRawToSubstackNote } from './note-converter'

export class NoteService {
  constructor(private readonly config: ServiceConfig) {}

  /**
   * Get a specific note by ID
   */
  async getNoteById(id: string): Promise<Note> {
    try {
      this.config.logger?.debug('Fetching note by ID', { id })

      const rawNote = await this.config.httpClient.get<RawSubstackNote>(`/api/v1/notes/${id}`)
      const substackNote = convertRawToSubstackNote(rawNote)

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

      return notes.map((note) => convertRawToSubstackNote(note))
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

      const substackNote = convertRawToSubstackNote(rawNote)

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
