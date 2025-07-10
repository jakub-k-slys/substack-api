import type { SubstackNote, SubstackCommentResponse } from '../types'
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
    const response = await this.httpClient.get<SubstackCommentResponse>(
      `/api/v1/reader/comment/${id}`
    )

    // Transform the comment response to the SubstackNote structure expected by Note entity
    const noteData: SubstackNote = {
      entity_key: String(id),
      type: 'note',
      context: {
        type: 'feed',
        timestamp: response.item.comment.date,
        users: [
          {
            id: response.item.comment.user_id,
            name: response.item.comment.name,
            handle: '', // Not available in comment response
            photo_url: (response.item.comment as any).photo_url || '',
            bio: '',
            profile_set_up_at: response.item.comment.date,
            reader_installed_at: response.item.comment.date
          }
        ],
        isFresh: false,
        page: null,
        page_rank: 1
      },
      comment: {
        id: response.item.comment.id,
        body: response.item.comment.body,
        type: 'feed',
        date: response.item.comment.date,
        user_id: response.item.comment.user_id,
        post_id: response.item.comment.post_id || null,
        name: response.item.comment.name,
        handle: '',
        photo_url: (response.item.comment as any).photo_url || '',
        ancestor_path: '',
        reply_minimum_role: 'everyone',
        reaction_count: 0, // Default value
        reactions: {},
        restacks: 0,
        restacked: false,
        children_count: 0,
        attachments: []
      },
      parentComments: [],
      canReply: true,
      isMuted: false,
      trackingParameters: {
        item_primary_entity_key: String(id),
        item_entity_key: String(id),
        item_type: 'note',
        item_content_user_id: response.item.comment.user_id,
        item_context_type: 'feed',
        item_context_type_bucket: 'note',
        item_context_timestamp: response.item.comment.date,
        item_context_user_id: response.item.comment.user_id,
        item_context_user_ids: [response.item.comment.user_id],
        item_can_reply: true,
        item_is_fresh: false,
        item_last_impression_at: null,
        item_page: null,
        item_page_rank: 1,
        impression_id: 'generated',
        followed_user_count: 0,
        subscribed_publication_count: 0,
        is_following: false,
        is_explicitly_subscribed: false
      }
    }

    return noteData
  }

  /**
   * Get notes for the authenticated user
   * @returns Promise<SubstackNote[]> - Raw note data from API
   * @throws {Error} When notes cannot be retrieved
   */
  async getNotesForLoggedUser(): Promise<SubstackNote[]> {
    const response = await this.httpClient.get<{ items?: SubstackNote[] }>('/api/v1/notes')
    return response.items || []
  }

  /**
   * Get notes for a profile
   * @param profileId - The profile user ID
   * @param options - Pagination options
   * @returns Promise<SubstackNote[]> - Raw note data from API
   * @throws {Error} When notes cannot be retrieved
   */
  async getNotesForProfile(
    profileId: number,
    options: { limit: number; offset: number }
  ): Promise<SubstackNote[]> {
    const response = await this.httpClient.get<{ items?: SubstackNote[] }>(
      `/api/v1/reader/feed/profile/${profileId}?types=note&limit=${options.limit}&offset=${options.offset}`
    )
    return response.items || []
  }
}
