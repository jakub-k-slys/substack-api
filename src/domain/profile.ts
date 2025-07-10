import type { SubstackPublicProfile, SubstackFullProfile } from '../internal'
import type { HttpClient } from '../internal/http-client'
import type { ProfileService, CommentService, PostService, NoteService } from '../internal/services'
import { PreviewPost } from './post'
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
    protected readonly client: HttpClient,
    protected readonly profileService: ProfileService,
    protected readonly postService: PostService,
    protected readonly noteService: NoteService,
    protected readonly commentService: CommentService,
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
  async *posts(options: { limit?: number } = {}): AsyncIterable<PreviewPost> {
    try {
      // Get the perPage configuration from the client
      const perPageConfig = this.client.getPerPage()
      let offset = 0
      let totalYielded = 0

      while (true) {
        // Use PostService to get posts
        const postsData = await this.postService.getPostsForProfile(this.id, {
          limit: perPageConfig,
          offset
        })

        if (!postsData) {
          break // No more posts to fetch
        }

        for (const postData of postsData) {
          if (options.limit && totalYielded >= options.limit) {
            return // Stop if we've reached the requested limit
          }
          yield new PreviewPost(postData, this.client, this.commentService, this.postService)
          totalYielded++
        }

        // If we got fewer posts than requested, we've reached the end
        if (postsData.length < perPageConfig) {
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
      let cursor: string | undefined = undefined
      let totalYielded = 0

      while (true) {
        // Use NoteService to get notes for this profile with cursor-based pagination
        const paginatedNotes = await this.noteService.getNotesForProfile(this.id, {
          cursor
        })

        if (!paginatedNotes.notes) {
          break // No more notes to fetch
        }

        for (const item of paginatedNotes.notes) {
          if (options.limit && totalYielded >= options.limit) {
            return // Stop if we've reached the requested limit
          }
          yield new Note(item, this.client)
          totalYielded++
        }

        // If there's no next cursor, we've reached the end
        if (!paginatedNotes.nextCursor) {
          break
        }

        cursor = paginatedNotes.nextCursor
      }
    } catch {
      // If both endpoints fail, return empty iterator
      yield* []
    }
  }
}
