/**
 * CommentService - Business logic for comment operations
 */

import type { ServiceConfig } from './types'
import type { RawSubstackComment, RawSubstackCommentResponse } from '../internal/types'
import type { SubstackComment } from '../types'
import { Comment } from '../entities'

export class CommentService {
  constructor(private readonly config: ServiceConfig) {}

  /**
   * Convert raw comment data to the expected SubstackComment format
   */
  private convertRawToSubstackComment(rawComment: RawSubstackComment): SubstackComment {
    return {
      id: rawComment.id,
      body: rawComment.body,
      created_at: rawComment.created_at,
      parent_post_id: rawComment.parent_post_id,
      author: {
        id: rawComment.author.id,
        name: rawComment.author.name,
        is_admin: rawComment.author.is_admin
      }
    }
  }

  /**
   * Get a specific comment by ID
   */
  async getCommentById(id: string): Promise<Comment> {
    if (!/^\d+$/.test(id)) {
      throw new Error('Invalid comment ID - must be numeric')
    }

    try {
      this.config.logger?.debug('Fetching comment by ID', { id })
      
      const response = await this.config.httpClient.get<RawSubstackCommentResponse>(
        `/api/v1/reader/comment/${id}`
      )

      // Transform the API response to match RawSubstackComment interface
      const rawCommentData: RawSubstackComment = {
        id: response.item.comment.id,
        body: response.item.comment.body,
        created_at: response.item.comment.date,
        parent_post_id: response.item.comment.post_id || 0,
        author: {
          id: response.item.comment.user_id,
          name: response.item.comment.name,
          is_admin: false // Default value as this info is not available in the API response
        }
      }

      const substackComment = this.convertRawToSubstackComment(rawCommentData)

      this.config.logger?.debug('Comment fetched successfully', { id, authorName: substackComment.author.name })
      
      return new Comment(substackComment, this.config.httpClient)
    } catch (error) {
      this.config.logger?.error('Failed to fetch comment by ID', { id, error: (error as Error).message })
      throw new Error(`Comment with ID ${id} not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get comments for a specific post
   */
  async getCommentsForPost(postId: number, options: { limit?: number; offset?: number } = {}): Promise<SubstackComment[]> {
    try {
      this.config.logger?.debug('Fetching comments for post', { postId, options })
      
      const response = await this.config.httpClient.get<{ comments?: RawSubstackComment[] }>(
        `/api/v1/post/${postId}/comments`
      )

      const comments = response.comments || []
      
      // Apply limit if specified
      const limitedComments = options.limit ? comments.slice(0, options.limit) : comments
      
      this.config.logger?.debug('Comments fetched successfully', { postId, count: limitedComments.length })
      
      return limitedComments.map(comment => this.convertRawToSubstackComment(comment))
    } catch (error) {
      this.config.logger?.error('Failed to fetch comments for post', { 
        postId, 
        options, 
        error: (error as Error).message 
      })
      throw new Error(`Failed to fetch comments for post ${postId}: ${(error as Error).message}`)
    }
  }
}