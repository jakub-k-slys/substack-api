import type { SubstackPublicProfile, SubstackFullProfile } from '../internal'
import type { SubstackHttpClient } from '../http-client'
import type { ProfileService, CommentService, PostService, NoteService } from '../internal/services'
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
  async *posts(options: { limit?: number } = {}): AsyncIterable<Post> {
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

        if (!postsData || postsData.length === 0) {
          break // No more posts to fetch
        }

        for (const postData of postsData) {
          if (options.limit && totalYielded >= options.limit) {
            return // Stop if we've reached the requested limit
          }
          yield new Post(postData, this.client, this.postService, this.commentService)
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
      // Get the perPage configuration from the client
      const perPageConfig = this.client.getPerPage()
      let offset = 0
      let totalYielded = 0

      while (true) {
        // Use NoteService to get notes for this profile
        const notesData = await this.noteService.getNotesForProfile(this.id, {
          limit: perPageConfig,
          offset
        })

        if (!notesData || notesData.length === 0) {
          break // No more notes to fetch
        }

        for (const item of notesData) {
          // Filter for note items (type: "comment" with comment.type: "feed")
          if (item.type === 'comment' && item.comment?.type === 'feed') {
            if (options.limit && totalYielded >= options.limit) {
              return // Stop if we've reached the requested limit
            }
            yield new Note(item, this.client)
            totalYielded++
          }
        }

        // If we got fewer items than requested, we've reached the end
        if (notesData.length < perPageConfig) {
          break
        }

        offset += perPageConfig
      }
    } catch {
      // If both endpoints fail, return empty iterator
      yield* []
    }
  }
}
