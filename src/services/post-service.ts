import type { SubstackPost } from '../internal'
import type { SubstackHttpClient } from '../http-client'

/**
 * Service responsible for post-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class PostService {
  constructor(
    private readonly httpClient: SubstackHttpClient,
    private readonly globalHttpClient: SubstackHttpClient
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
}
