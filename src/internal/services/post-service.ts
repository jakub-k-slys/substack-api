import type { SubstackPost, SubstackFullPost } from '../types'
import { SubstackPostCodec, SubstackFullPostCodec } from '../types'
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
   * @returns Promise<SubstackFullPost> - Raw full post data from API (validated)
   * @throws {Error} When post is not found, API request fails, or validation fails
   *
   * Note: Uses SubstackFullPostCodec to validate the full post response from /posts/by-id/:id
   * which includes body_html, postTags, reactions, and other fields not present in preview responses.
   * This codec is specifically designed for FullPost construction.
   */
  async getPostById(id: number): Promise<SubstackFullPost> {
    // Post lookup by ID must use the global substack.com endpoint, not publication-specific hostnames
    const rawResponse = await this.globalHttpClient.get<{ post: unknown }>(
      `/api/v1/posts/by-id/${id}`
    )

    // Extract the post data from the wrapper object
    if (!rawResponse.post) {
      throw new Error('Invalid response format: missing post data')
    }

    // Transform the raw post data to match our codec expectations
    const postData = this.transformPostData(rawResponse.post as any)

    // Validate the response with SubstackFullPostCodec for full post data including body_html
    return decodeOrThrow(SubstackFullPostCodec, postData, 'Full post response')
  }

  /**
   * Transform raw API post data to match our codec structure
   */
  private transformPostData(rawPost: any): any {
    const transformedPost = { ...rawPost }

    // Transform postTags from objects to string array
    if (rawPost.postTags && Array.isArray(rawPost.postTags)) {
      transformedPost.postTags = rawPost.postTags.map((tag: any) => tag.name || tag)
    }

    return transformedPost
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
