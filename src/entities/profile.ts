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
    resolvedSlug?: string,
    protected readonly slugResolver?: (
      userId: number,
      fallbackHandle?: string
    ) => Promise<string | undefined>
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
      // Get the perPage configuration from the client
      const perPageConfig = this.client.getPerPage()
      let offset = 0
      let totalYielded = 0

      while (true) {
        // Use the correct endpoint for profile posts with limit and offset parameters
        const response = await this.client.get<{ posts?: SubstackPost[] }>(
          `/api/v1/profile/posts?profile_user_id=${this.id}&limit=${perPageConfig}&offset=${offset}`
        )

        if (!response.posts || response.posts.length === 0) {
          break // No more posts to fetch
        }

        for (const postData of response.posts) {
          if (options.limit && totalYielded >= options.limit) {
            return // Stop if we've reached the requested limit
          }
          yield new Post(postData, this.client)
          totalYielded++
        }

        // If we got fewer posts than requested, we've reached the end
        if (response.posts.length < perPageConfig) {
          break
        }

        offset += perPageConfig
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
      // Try the reader feed endpoint first
      // Get the perPage configuration from the client
      const perPageConfig = this.client.getPerPage()
      let offset = 0
      let totalYielded = 0

      while (true) {
        // Use the reader feed endpoint for profile notes with types=note filter
        const response = await this.client.get<{ notes?: SubstackNote[] }>(
          `/api/v1/reader/feed/profile/${this.id}?types=note&limit=${perPageConfig}&offset=${offset}`
        )

        if (!response.notes || response.notes.length === 0) {
          break // No more notes to fetch
        }

        for (const item of response.notes) {
          // Filter for note items (type: "comment" with comment.type: "feed")
          if (options.limit && totalYielded >= options.limit) {
            return // Stop if we've reached the requested limit
          }
          yield new Note(item, this.client)
          totalYielded++
        }

        // If we got fewer items than requested, we've reached the end
        if (response.notes.length < perPageConfig) {
          break
        }

        offset += perPageConfig
      }
    } catch {
        yield* []
    }
  }
}
