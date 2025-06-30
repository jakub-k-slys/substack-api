import type { SubstackPost } from '../types'
import type { SubstackHttpClient } from '../http-client'
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
    private readonly client: SubstackHttpClient
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
   */
  async *comments(_options: { limit?: number } = {}): AsyncIterable<Comment> {
    // Mock implementation - in real API, this would fetch comments for this post
    // For now, return empty iterator
    yield* []
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
