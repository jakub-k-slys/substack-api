import type { SubstackNote, SubstackNoteComment } from '../internal'
import type { HttpClient } from '../internal/http-client'
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
    private readonly client: HttpClient
  ) {
    this.id = rawData.entity_key
    this.body = rawData.comment?.body || ''
    this.likesCount = rawData.comment?.reaction_count || 0
    this.publishedAt = new Date(rawData.context.timestamp)

    // Extract author info from context users
    const firstUser = rawData.context.users[0]
    this.author = {
      id: firstUser?.id || 0,
      name: firstUser?.name || 'Unknown',
      handle: firstUser?.handle || 'unknown',
      avatarUrl: firstUser?.photo_url || ''
    }
  }

  /**
   * Get parent comments for this note
   */
  async *comments(): AsyncIterable<Comment> {
    // Convert parent comments to Comment entities
    for (const parentComment of this.rawData.parentComments || []) {
      if (parentComment) {
        // Convert note comment format to SubstackComment format
        const comment = parentComment as SubstackNoteComment
        const commentData = {
          id: comment.id,
          body: comment.body,
          created_at: comment.date,
          parent_post_id: comment.post_id || 0,
          author_id: comment.user_id,
          author_name: comment.name,
          author_is_admin: false // Not available in note comment format
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
    // This requires authentication and proper API endpoints
    throw new Error('Note liking not implemented yet - requires like API')
  }

  /**
   * Add a comment to this note
   */
  async addComment(_text: string): Promise<Comment> {
    // Implementation will add a comment via the client
    // This requires authentication and proper API endpoints
    throw new Error('Note commenting not implemented yet - requires comment API')
  }
}
