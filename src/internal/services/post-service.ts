import type { SubstackPost } from '../types'
import { SubstackPostCodec } from '../types'
import { decodeOrThrow } from '../validation'
import type { HttpClient } from '../http-client'

/**
 * Service responsible for post-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class PostService {
  constructor(
    private readonly globalHttpClient: HttpClient,
    private readonly httpClient: HttpClient
  ) {}

  /**
   * Get a post by ID from the API
   * @param id - The post ID
   * @returns Promise<SubstackPost> - Raw post data from API (validated)
   * @throws {Error} When post is not found, API request fails, or validation fails
   */
  async getPostById(id: number): Promise<SubstackPost> {
    // Post lookup by ID must use the global substack.com endpoint, not publication-specific hostnames
    const rawResponse = await this.globalHttpClient.get<unknown>(`/api/v1/posts/by-id/${id}`)

    // Validate the response with io-ts before returning
    return decodeOrThrow(SubstackPostCodec, rawResponse, 'Post response')
  }

  /**
   * Get posts for a profile
   * @param profileId - The profile user ID
   * @param options - Pagination options
   * @returns Promise<SubstackPost[]> - Raw post data from API (validated)
   * @throws {Error} When posts cannot be retrieved or validation fails
   */
  async getPostsForProfile(
    profileId: number,
    options: { limit: number; offset: number }
  ): Promise<SubstackPost[]> {
    const response = await this.httpClient.get<{ posts?: unknown[] }>(
      `/api/v1/profile/posts?profile_user_id=${profileId}&limit=${options.limit}&offset=${options.offset}`
    )

    const posts = response.posts || []

    // Validate each post with io-ts
    return posts.map((post, index) =>
      decodeOrThrow(SubstackPostCodec, post, `Post ${index} in profile response`)
    )
  }
}
