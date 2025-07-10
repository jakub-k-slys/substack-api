import type { SubstackComment, SubstackCommentResponse } from '../types'
import type { HttpClient } from '../http-client'

/**
 * Service responsible for comment-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class CommentService {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get comments for a post
   * @param postId - The post ID
   * @returns Promise<SubstackComment[]> - Raw comment data from API
   * @throws {Error} When comments cannot be retrieved
   */
  async getCommentsForPost(postId: number): Promise<SubstackComment[]> {
    const response = await this.httpClient.get<{ comments?: SubstackComment[] }>(
      `/api/v1/post/${postId}/comments`
    )
    return response.comments || []
  }

  /**
   * Get a specific comment by ID
   * @param id - The comment ID
   * @returns Promise<SubstackComment> - Raw comment data from API
   * @throws {Error} When comment is not found or API request fails
   */
  async getCommentById(id: number): Promise<SubstackComment> {
    const response = await this.httpClient.get<SubstackCommentResponse>(
      `/api/v1/reader/comment/${id}`
    )

    // Transform the API response to match SubstackComment interface
    const commentData: SubstackComment = {
      id: response.item.comment.id,
      body: response.item.comment.body,
      created_at: response.item.comment.date,
      parent_post_id: response.item.comment.post_id || 0,
      author_id: response.item.comment.user_id,
      author_name: response.item.comment.name,
      author_is_admin: false // Default value as this info is not available in the API response
    }

    return commentData
  }
}
