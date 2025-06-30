import type { SubstackNote } from '../types'
import type { Substack } from '../client'
import { Comment } from './comment'

/**
 * Note entity representing a Substack note
 */
export class Note {
  public readonly id: string
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
    private readonly rawData: SubstackNote,
    private readonly client: Substack
  ) {
    this.id = rawData.entity_key
    this.body = rawData.comment?.body || ''
    this.likesCount = 0 // TODO: Extract from rawData when available
    this.publishedAt = new Date(rawData.context.timestamp)

    // Extract author from the first user in context
    const firstUser = rawData.context.users[0]
    this.author = {
      id: firstUser?.id || 0,
      name: firstUser?.name || 'Unknown',
      handle: firstUser?.handle || 'unknown',
      avatarUrl: firstUser?.photo_url || ''
    }
  }

  /**
   * Get comments for this note
   */
  async *comments(_options: { limit?: number } = {}): AsyncIterable<Comment> {
    // Notes may have comments, but the API structure might be different
    // For now, return parent comments if available, converting them to SubstackComment format
    for (const parentComment of this.rawData.parentComments || []) {
      if (parentComment) {
        // Convert note comment format to SubstackComment format
        const commentData = {
          id: parentComment.id,
          body: parentComment.body,
          created_at: parentComment.date,
          parent_post_id: parentComment.post_id || 0,
          author: {
            id: parentComment.user_id,
            name: parentComment.name,
            is_admin: false // Not available in note comment format
          }
        }
        yield new Comment(commentData, this.client)
      }
    }
  }

  /**
   * Like this note
   */
  async like(): Promise<void> {
    // Implementation will like the note via the client
    throw new Error('Note liking not implemented yet - requires like API')
  }

  /**
   * Add a comment to this note
   */
  async addComment(_data: { body: string }): Promise<Comment> {
    // Implementation will add comment via the client
    throw new Error('Comment creation not implemented yet - requires comment creation API')
  }
}
