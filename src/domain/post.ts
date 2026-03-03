import type { GatewayFullPost, GatewayPost } from '@substack-api/internal/types'
import type { CommentService, PostService } from '@substack-api/internal/services'
import { Comment } from '@substack-api/domain/comment'

export interface Post {
  readonly id: number
  readonly title: string
  readonly subtitle: string
  readonly body: string
  readonly truncatedBody: string
  readonly publishedAt: Date

  comments(options?: { limit?: number }): AsyncIterable<Comment>
  like(): Promise<void>
  addComment(data: { body: string }): Promise<Comment>
}

export class PreviewPost implements Post {
  public readonly id: number
  public readonly title: string
  public readonly subtitle: string
  public readonly body: string
  public readonly truncatedBody: string
  public readonly publishedAt: Date

  constructor(
    rawData: GatewayPost,
    private readonly commentService: CommentService,
    private readonly postService: PostService
  ) {
    this.id = rawData.id
    this.title = rawData.title
    this.subtitle = rawData.subtitle || ''
    this.truncatedBody = rawData.truncated_body || ''
    this.body = rawData.truncated_body || ''
    this.publishedAt = new Date(rawData.published_at)
  }

  async fullPost(): Promise<FullPost> {
    try {
      const fullPostData = await this.postService.getPostById(this.id)
      return new FullPost(fullPostData, this.commentService)
    } catch (error) {
      throw new Error(`Failed to fetch full post ${this.id}: ${(error as Error).message}`)
    }
  }

  async *comments(options: { limit?: number } = {}): AsyncIterable<Comment> {
    try {
      const commentsData = await this.commentService.getCommentsForPost(this.id)
      let count = 0
      for (const commentData of commentsData) {
        if (options.limit && count >= options.limit) break
        yield new Comment(commentData)
        count++
      }
    } catch (error) {
      throw new Error(`Failed to get comments for post ${this.id}: ${(error as Error).message}`)
    }
  }

  async like(): Promise<void> {
    throw new Error('Post liking not implemented yet - requires like API')
  }

  async addComment(_data: { body: string }): Promise<Comment> {
    throw new Error('Comment creation not implemented yet - requires comment creation API')
  }
}

export class FullPost implements Post {
  public readonly id: number
  public readonly title: string
  public readonly subtitle: string
  public readonly body: string
  public readonly truncatedBody: string
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
    rawData: GatewayFullPost,
    private readonly commentService: CommentService
  ) {
    this.id = rawData.id
    this.title = rawData.title
    this.subtitle = rawData.subtitle || ''
    this.truncatedBody = rawData.truncated_body || ''
    this.body = rawData.html_body || rawData.truncated_body || ''
    this.publishedAt = new Date(rawData.published_at)
    this.url = rawData.url
    this.htmlBody = rawData.html_body || ''
    this.slug = rawData.slug
    this.createdAt = new Date(rawData.published_at)
    this.reactions = rawData.reactions ?? undefined
    this.restacks = rawData.restacks ?? undefined
    this.postTags = rawData.tags ?? undefined
    this.coverImage = rawData.cover_image ?? undefined
  }

  async *comments(options: { limit?: number } = {}): AsyncIterable<Comment> {
    try {
      const commentsData = await this.commentService.getCommentsForPost(this.id)
      let count = 0
      for (const commentData of commentsData) {
        if (options.limit && count >= options.limit) break
        yield new Comment(commentData)
        count++
      }
    } catch (error) {
      throw new Error(`Failed to get comments for post ${this.id}: ${(error as Error).message}`)
    }
  }

  async like(): Promise<void> {
    throw new Error('Post liking not implemented yet - requires like API')
  }

  async addComment(_data: { body: string }): Promise<Comment> {
    throw new Error('Comment creation not implemented yet - requires comment creation API')
  }
}
