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
   * Get users that the authenticated user follows
   */
  async *followees(_options: { limit?: number } = {}): AsyncIterable<Profile> {
    // First, get the list of user IDs that the user follows
    const followingResponse = await this.client.get<number[]>('/api/v1/feed/following')

    // Then, for each user ID, fetch their detailed profile
    for (const userId of followingResponse) {
      try {
        const profileResponse = await this.client.get<SubstackFullProfile>(
          `/api/v1/user/${userId}/profile`
        )

        // Use the same slug resolution as the main client if available
        let resolvedSlug = profileResponse.handle
        if (this.slugResolver) {
          resolvedSlug =
            (await this.slugResolver(userId, profileResponse.handle)) || profileResponse.handle
        }

        yield new Profile(profileResponse, this.client, resolvedSlug, this.slugResolver)
      } catch {
        // Skip profiles that can't be fetched (e.g., deleted accounts, private profiles)
        // This ensures the iterator continues working even if some profiles are inaccessible
        continue
      }
    }
  }
}
