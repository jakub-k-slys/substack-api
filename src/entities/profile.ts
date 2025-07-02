import type {
  SubstackPublicProfile,
  SubstackFullProfile,
  SubstackPost,
  SubstackNote
} from '../types'
import type { SubstackHttpClient } from '../http-client'
import { Post } from './post'
import { Note } from './note'

/**
 * Base Profile class representing a Substack user profile (read-only)
 */
export class Profile {
  public readonly id: number
  public readonly slug: string
  public readonly name: string
  public readonly url: string
  public readonly avatarUrl: string
  public readonly bio?: string

  constructor(
    protected readonly rawData: SubstackPublicProfile | SubstackFullProfile,
    protected readonly client: SubstackHttpClient,
    resolvedSlug?: string
  ) {
    this.id = rawData.id
    // Use resolved slug from subscriptions cache if available, otherwise fallback to handle
    this.slug = resolvedSlug || rawData.handle
    this.name = rawData.name
    this.url = `https://substack.com/@${this.slug}`
    this.avatarUrl = rawData.photo_url
    this.bio = rawData.bio
  }

  /**
   * Get posts from this profile's publications
   */
  async *posts(options: { limit?: number } = {}): AsyncIterable<Post> {
    try {
      // Try to fetch posts for this profile
      // The API endpoint might vary, so we'll try a few approaches
      const response = await this.client.get<{ posts?: SubstackPost[] }>(
        `/api/v1/users/${this.id}/posts`
      )

      if (response.posts) {
        let count = 0
        for (const postData of response.posts) {
          if (options.limit && count >= options.limit) break
          yield new Post(postData, this.client)
          count++
        }
      }
    } catch {
      // If the endpoint doesn't exist or fails, return empty iterator
      yield* []
    }
  }

  /**
   * Get notes from this profile
   */
  async *notes(options: { limit?: number } = {}): AsyncIterable<Note> {
    try {
      // Try to fetch notes for this profile
      const response = await this.client.get<{ notes?: SubstackNote[] }>(
        `/api/v1/users/${this.id}/notes`
      )

      if (response.notes) {
        let count = 0
        for (const noteData of response.notes) {
          if (options.limit && count >= options.limit) break
          yield new Note(noteData, this.client)
          count++
        }
      }
    } catch {
      // If the endpoint doesn't exist or fails, return empty iterator
      yield* []
    }
  }
}
