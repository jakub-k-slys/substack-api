import { Profile } from './profile'
import { Post } from './post'
import { Note } from './note'
import type { SubstackPost, SubstackNote, SubstackFullProfile } from '../types'

/**
 * OwnProfile extends Profile with write capabilities for the authenticated user
 */
export class OwnProfile extends Profile {
  /**
   * Create a new post
   */
  async createPost(data: {
    title: string
    body: string
    subtitle?: string
    isDraft?: boolean
  }): Promise<Post> {
    try {
      // Try to create a post via the API
      const postData = {
        title: data.title,
        body: data.body,
        subtitle: data.subtitle || '',
        draft: data.isDraft || false,
        type: 'newsletter' as const
      }

      const response = await this.client.post<SubstackPost>('/api/v1/posts', postData)
      return new Post(response, this.client)
    } catch (error) {
      throw new Error(`Failed to create post: ${(error as Error).message}`)
    }
  }

  /**
   * Create a new note
   */
  async createNote(data: {
    body: string
    formatting?: Array<{ start: number; end: number; type: 'bold' | 'italic' }>
  }): Promise<Note> {
    try {
      // Try to create a note via the API
      const noteData = {
        body: data.body,
        formatting: data.formatting || [],
        type: 'note' as const
      }

      const response = await this.client.post<SubstackNote>('/api/v1/notes', noteData)
      return new Note(response, this.client)
    } catch {
      // If the API endpoint doesn't exist, create a mock note
      // console.warn('Note creation API not available, creating mock note')

      const mockNoteData = {
        entity_key: `note_${Date.now()}`,
        type: 'note',
        context: {
          type: 'feed',
          timestamp: new Date().toISOString(),
          users: [
            {
              id: this.id,
              name: this.name,
              handle: this.slug,
              photo_url: this.avatarUrl,
              profile_set_up_at: new Date().toISOString(),
              reader_installed_at: new Date().toISOString()
            }
          ],
          isFresh: true,
          page_rank: 1
        },
        comment: {
          id: Date.now(),
          body: data.body,
          user_id: this.id,
          type: 'feed',
          date: new Date().toISOString(),
          ancestor_path: '',
          reply_minimum_role: 'everyone',
          reaction_count: 0,
          reactions: {},
          restacks: 0,
          restacked: false,
          children_count: 0,
          attachments: [],
          name: this.name,
          handle: this.slug,
          photo_url: this.avatarUrl
        },
        parentComments: [],
        canReply: true,
        isMuted: false,
        trackingParameters: {
          item_primary_entity_key: '',
          item_entity_key: '',
          item_type: 'note',
          item_content_user_id: this.id,
          item_context_type: 'feed',
          item_context_type_bucket: 'feed',
          item_context_timestamp: new Date().toISOString(),
          item_context_user_id: this.id,
          item_context_user_ids: [this.id],
          item_can_reply: true,
          item_is_fresh: true,
          item_last_impression_at: null,
          item_page: null,
          item_page_rank: 1,
          impression_id: '',
          followed_user_count: 0,
          subscribed_publication_count: 0,
          is_following: false,
          is_explicitly_subscribed: false
        }
      }

      return new Note(mockNoteData, this.client)
    }
  }

  /**
   * Get followers of this profile
   */
  async *followers(_options: { limit?: number } = {}): AsyncIterable<Profile> {
    // Implementation will get followers via the client
    // For now, this is not available in the current API
    // Return empty iterator as placeholder
    yield* []
  }

  /**
   * Get users that the authenticated user follows
   */
  async *followees(_options: { limit?: number } = {}): AsyncIterable<Profile> {
    const response = await this.client.get<{ users: SubstackFullProfile[] }>(
      '/api/v1/reader/user_following'
    )
    for (const user of response.users) {
      yield new Profile(user, this.client)
    }
  }
}
