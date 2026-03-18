import type { SubstackFullPost, SubstackPreviewPost } from '@substack-api/internal'
import type { HttpClient } from '@substack-api/internal/http-client'
import type { CommentService, PostService } from '@substack-api/internal/services'
import { Comment } from '@substack-api/domain/comment'

/**
 * Post interface defining the common contract for all post types
 */
export interface Post {
  readonly id: number
  readonly title: string
  readonly subtitle: string
  readonly body: string
  readonly truncatedBody: string
  readonly likesCount: number
  readonly author: {
    id: number
    name: string
    handle: string
    avatarUrl: string
  }
  readonly publishedAt: Date

  comments(options?: { limit?: number }): AsyncIterable<Comment>
  like(): Promise<void>
  addComment(data: { body: string }): Promise<Comment>
}

/**
 * PreviewPost entity representing a Substack post with truncated content
 */
export class PreviewPost implements Post {
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
    rawData: SubstackPreviewPost,
    private readonly publicationClient: HttpClient,
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
      return new FullPost(fullPostData, this.publicationClient, this.commentService)
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
        yield new Comment(commentData, this.publicationClient)
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
export class FullPost implements Post {
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
  public readonly htmlBody: string
  public readonly slug: string
  public readonly createdAt: Date
  public readonly reactions?: Record<string, number>
  public readonly restacks?: number
  public readonly postTags?: string[]
  public readonly coverImage?: string
  public readonly url: string

  constructor(
    rawData: SubstackFullPost,
    private readonly publicationClient: HttpClient,
    private readonly commentService: CommentService
  ) {
    this.id = rawData.id
    this.title = rawData.title
    this.subtitle = rawData.subtitle || ''
    this.truncatedBody = rawData.truncated_body_text || ''
    this.body = rawData.body_html || rawData.htmlBody || rawData.truncated_body_text || ''
    this.likesCount = 0 // TODO: Extract from rawData when available
    this.publishedAt = new Date(rawData.post_date)
    this.url = rawData.canonical_url

    // TODO: Extract author information from rawData
    // For now, use placeholder values
    this.author = {
      id: 0,
      name: 'Unknown Author',
      handle: 'unknown',
      avatarUrl: ''
    }

    // Prefer body_html from the full post response, fall back to htmlBody for backward compatibility
    this.htmlBody = rawData.body_html || rawData.htmlBody || ''
    this.slug = rawData.slug
    this.createdAt = new Date(rawData.post_date)
    this.reactions = rawData.reactions
    this.restacks = rawData.restacks
    this.postTags = rawData.postTags
    this.coverImage = rawData.cover_image
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
        yield new Comment(commentData, this.publicationClient)
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
