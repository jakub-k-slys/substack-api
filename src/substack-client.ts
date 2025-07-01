import { SubstackHttpClient } from './http-client'
import { Profile, OwnProfile, Post, Note, Comment } from './entities'
import type {
  SubstackConfig,
  SubstackFullProfile,
  SubstackPost,
  SubstackNote,
  SubstackComment
} from './types'

/**
 * Modern SubstackClient with entity-based API
 */
export class SubstackClient {
  private readonly httpClient: SubstackHttpClient

  constructor(config: SubstackConfig) {
    this.httpClient = new SubstackHttpClient(config)
  }

  /**
   * Test API connectivity
   */
  async testConnectivity(): Promise<boolean> {
    try {
      await this.httpClient.get('/api/v1/feed/following')
      return true
    } catch {
      return false
    }
  }

  /**
   * Get the authenticated user's own profile with write capabilities
   * @throws {Error} When authentication fails or user profile cannot be retrieved
   */
  async ownProfile(): Promise<OwnProfile> {
    try {
      // Step 1: Get user_id from subscription endpoint
      const subscription = await this.httpClient.get<{ user_id: number }>('/api/v1/subscription')
      const userId = subscription.user_id

      // Step 2: Get full profile using the user_id
      const profile = await this.httpClient.get<SubstackFullProfile>(
        `/api/v1/user/${userId}/profile`
      )
      return new OwnProfile(profile, this.httpClient)
    } catch (error) {
      throw new Error(`Failed to get own profile: ${(error as Error).message}`)
    }
  }

  /**
   * Get a profile by user ID
   */
  async profileForId(id: number): Promise<Profile> {
    try {
      const profile = await this.httpClient.get<SubstackFullProfile>(`/api/v1/users/${id}`)
      return new Profile(profile, this.httpClient)
    } catch (error) {
      throw new Error(`Profile with ID ${id} not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get a profile by handle/slug
   */
  async profileForSlug(slug: string): Promise<Profile> {
    if (!slug || slug.trim() === '') {
      throw new Error('Profile slug cannot be empty')
    }

    try {
      const profile = await this.httpClient.get<SubstackFullProfile>(`/api/v1/users/${slug}`)
      return new Profile(profile, this.httpClient)
    } catch (error) {
      throw new Error(`Profile with slug '${slug}' not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get a specific post by ID
   */
  async postForId(id: string): Promise<Post> {
    const post = await this.httpClient.get<SubstackPost>(`/api/v1/posts/${id}`)
    return new Post(post, this.httpClient)
  }

  /**
   * Get a specific note by ID
   */
  async noteForId(id: string): Promise<Note> {
    try {
      const note = await this.httpClient.get<SubstackNote>(`/api/v1/notes/${id}`)
      return new Note(note, this.httpClient)
    } catch {
      throw new Error(`Note with ID ${id} not found`)
    }
  }

  /**
   * Get a specific comment by ID
   */
  async commentForId(id: string): Promise<Comment> {
    if (!/^\d+$/.test(id)) {
      throw new Error('Invalid comment ID - must be numeric')
    }

    const comment = await this.httpClient.get<SubstackComment>(`/api/v1/comments/${id}`)
    return new Comment(comment, this.httpClient)
  }
}
