import type { SubstackNote, PaginatedSubstackNotes } from '../types'
import { SubstackCommentResponseCodec } from '../types'
import { decodeOrThrow } from '../validation'
import type { HttpClient } from '../http-client'

/**
 * Service responsible for note-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class NoteService {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get a note by ID from the API
   * @param id - The note ID
   * @returns Promise<SubstackNote> - Raw note data from API
   * @throws {Error} When note is not found or API request fails
   */
  async getNoteById(id: number): Promise<SubstackNote> {
    // Notes are fetched using the comment endpoint
    const rawResponse = await this.httpClient.get<unknown>(`/api/v1/reader/comment/${id}`)

    // Validate the response structure with io-ts
    const response = decodeOrThrow(
      SubstackCommentResponseCodec,
      rawResponse,
      'Note comment response'
    )

    // Transform the validated comment response to the SubstackNote structure expected by Note entity
    // Only include minimal fields validated by SubstackNoteCodec
    const noteData: SubstackNote = {
      entity_key: String(id),
      context: {
        timestamp: response.item.comment.date,
        users: [
          {
            id: response.item.comment.user_id,
            name: response.item.comment.name,
            handle: '', // Not available in comment response
            photo_url: (response.item.comment as any).photo_url || ''
          }
        ]
      },
      comment: {
        id: response.item.comment.id,
        body: response.item.comment.body,
        reaction_count: 0 // Default value
      },
      parentComments: []
    }

    return noteData
  }

  /**
   * Get notes for the authenticated user with cursor-based pagination
   * @param options - Pagination options with optional cursor
   * @returns Promise<PaginatedSubstackNotes> - Paginated note data from API
   * @throws {Error} When notes cannot be retrieved
   */
  async getNotesForLoggedUser(options?: { cursor?: string }): Promise<PaginatedSubstackNotes> {
    const url = options?.cursor
      ? `/api/v1/notes?cursor=${encodeURIComponent(options.cursor)}`
      : '/api/v1/notes'

    const response = await this.httpClient.get<{
      items?: SubstackNote[]
      nextCursor?: string
    }>(url)

    return {
      notes: response.items || [],
      nextCursor: response.nextCursor
    }
  }

  /**
   * Get notes for a profile with cursor-based pagination
   * @param profileId - The profile user ID
   * @param options - Pagination options with optional cursor
   * @returns Promise<PaginatedSubstackNotes> - Paginated note data from API
   * @throws {Error} When notes cannot be retrieved
   */
  async getNotesForProfile(
    profileId: number,
    options?: { cursor?: string }
  ): Promise<PaginatedSubstackNotes> {
    const url = options?.cursor
      ? `/api/v1/reader/feed/profile/${profileId}?types=note&cursor=${encodeURIComponent(options.cursor)}`
      : `/api/v1/reader/feed/profile/${profileId}?types=note`

    const response = await this.httpClient.get<{
      items?: SubstackNote[]
      nextCursor?: string
    }>(url)
    return {
      notes: response.items || [],
      nextCursor: response.nextCursor
    }
  }
}
