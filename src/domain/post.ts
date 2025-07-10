import type { SubstackPost } from '../internal'
import type { SubstackHttpClient } from '../internal/http-client'
import type { PostService, CommentService } from '../internal/services'
import { Comment } from './comment'

/**
 * Post entity representing a Substack post
 */
export class Post {
  public readonly id: number
  public readonly title: string
  public readonly body: string
  public readonly likesCount: number
  public readonly author: {
    id: number
    name: string
    handle: string
    avatarUrl: string
  }
  public readonly publishedAt: Date

  constructor(
    private readonly rawData: SubstackPost,
    private readonly client: SubstackHttpClient,
    private readonly postService: PostService,
    private readonly commentService: CommentService
  ) {
    this.id = rawData.id
    this.title = rawData.title
    this.body = rawData.description || rawData.subtitle || ''
    this.likesCount = 0 // TODO: Extract from rawData when available
    this.publishedAt = new Date(rawData.post_date)

    // TODO: Extract author information from rawData
    // For now, use placeholder values
    this.author = {
      id: 0,
      name: 'Unknown Author',
      handle: 'unknown',
      avatarUrl: ''
    }
  }

  /**
   * Get comments for this post
   * @throws {Error} When comment retrieval fails or API is unavailable
   */
  async *comments(options: { limit?: number } = {}): AsyncIterable<Comment> {
    try {
      const commentsData = await this.commentService.getCommentsForPost(this.id)

      let count = 0
      for (const commentData of commentsData) {
        if (options.limit && count >= options.limit) break
        yield new Comment(commentData, this.client)
        count++
      }
    } catch (error) {
      throw new Error(`Failed to get comments for post ${this.id}: ${(error as Error).message}`)
    }
  }

  /**
   * Like this post
   */
  async like(): Promise<void> {
    // Implementation will like the post via the client
    throw new Error('Post liking not implemented yet - requires like API')
  }

  /**
   * Add a comment to this post
   */
  async addComment(_data: { body: string }): Promise<Comment> {
    // Implementation will add comment via the client
    throw new Error('Comment creation not implemented yet - requires comment creation API')
  }
}
