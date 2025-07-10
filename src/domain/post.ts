import type { SubstackPost } from '../internal'
import type { HttpClient } from '../internal/http-client'
import type { CommentService, PostService } from '../internal/services'
import { Comment } from './comment'

/**
 * PreviewPost entity representing a Substack post with truncated content
 */
export class PreviewPost {
  public readonly id: number
  public readonly title: string
  public readonly subtitle: string
  public readonly body: string
  public readonly truncatedBody: string
  public readonly likesCount: number
  public readonly author: {
    id: number
    name: string
    handle: string
    avatarUrl: string
  }
  public readonly publishedAt: Date

  constructor(
    rawData: SubstackPost,
    private readonly client: HttpClient,
    private readonly commentService: CommentService,
    private readonly postService: PostService
  ) {
    this.id = rawData.id
    this.title = rawData.title
    this.subtitle = rawData.subtitle || ''
    this.truncatedBody = rawData.truncated_body_text || ''
    this.body = rawData.truncated_body_text || ''
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
   * Fetch the full post data with HTML body content
   * @returns Promise<FullPost> - A FullPost instance with complete content
   * @throws {Error} When full post retrieval fails
   */
  async fullPost(): Promise<FullPost> {
    try {
      const fullPostData = await this.postService.getPostById(this.id)
      return new FullPost(fullPostData, this.client, this.commentService, this.postService)
    } catch (error) {
      throw new Error(`Failed to fetch full post ${this.id}: ${(error as Error).message}`)
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

/**
 * FullPost entity representing a Substack post with complete HTML content
 */
export class FullPost extends PreviewPost {
  public readonly htmlBody: string

  constructor(
    rawData: SubstackPost,
    client: HttpClient,
    commentService: CommentService,
    postService: PostService
  ) {
    super(rawData, client, commentService, postService)
    this.htmlBody = rawData.htmlBody || ''
  }
}
