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
   * @throws {Error} When note creation fails or API is unavailable
   */
  async createNote(data: {
    body: string
    formatting?: Array<{ start: number; end: number; type: 'bold' | 'italic' }>
  }): Promise<Note> {
    try {
      const noteData = {
        body: data.body,
        formatting: data.formatting || [],
        type: 'note' as const
      }

      const response = await this.client.post<SubstackNote>('/api/v1/notes', noteData)
      return new Note(response, this.client)
    } catch (error) {
      throw new Error(`Failed to create note: ${(error as Error).message}`)
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
