import type { SubstackPost } from '../types'
import type { SubstackHttpClient } from '../../http-client'

/**
 * Service responsible for post-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class PostService {
  constructor(
    private readonly globalHttpClient: SubstackHttpClient,
    private readonly httpClient: SubstackHttpClient
  ) {}

  /**
   * Get a post by ID from the API
   * @param id - The post ID
   * @returns Promise<SubstackPost> - Raw post data from API
   * @throws {Error} When post is not found or API request fails
   */
  async getPostById(id: number): Promise<SubstackPost> {
    // Post lookup by ID must use the global substack.com endpoint, not publication-specific hostnames
    return await this.globalHttpClient.get<SubstackPost>(`/api/v1/posts/by-id/${id}`)
  }

  /**
   * Get posts for a profile
   * @param profileId - The profile user ID
   * @param options - Pagination options
   * @returns Promise<SubstackPost[]> - Raw post data from API
   * @throws {Error} When posts cannot be retrieved
   */
  async getPostsForProfile(
    profileId: number,
    options: { limit: number; offset: number }
  ): Promise<SubstackPost[]> {
    const response = await this.httpClient.get<{ posts?: SubstackPost[] }>(
      `/api/v1/profile/posts?profile_user_id=${profileId}&limit=${options.limit}&offset=${options.offset}`
    )
    return response.posts || []
  }
}
