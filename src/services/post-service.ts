/**
 * PostService - Business logic for post operations
 */

import type { ServiceConfig } from './types'
import type { RawSubstackPost } from '../internal/types'
import type { SubstackPost } from '../types'
import { Post } from '../entities'

export class PostService {
  constructor(private readonly config: ServiceConfig) {}

  /**
   * Convert raw post data to the expected SubstackPost format
   */
  private convertRawToSubstackPost(rawPost: RawSubstackPost): SubstackPost {
    return {
      id: rawPost.id,
      title: rawPost.title,
      subtitle: rawPost.subtitle,
      slug: rawPost.slug,
      post_date: rawPost.post_date,
      description: rawPost.description,
      audience: rawPost.audience,
      canonical_url: rawPost.canonical_url,
      cover_image: rawPost.cover_image,
      podcast_url: rawPost.podcast_url,
      type: rawPost.type,
      published: rawPost.published,
      paywalled: rawPost.paywalled
    }
  }

  /**
   * Get a specific post by ID
   */
  async getPostById(id: string): Promise<Post> {
    try {
      this.config.logger?.debug('Fetching post by ID', { id })

      const rawPost = await this.config.httpClient.get<RawSubstackPost>(`/api/v1/posts/${id}`)
      const substackPost = this.convertRawToSubstackPost(rawPost)

      this.config.logger?.debug('Post fetched successfully', { id, title: substackPost.title })

      return new Post(substackPost, this.config.httpClient)
    } catch (error) {
      this.config.logger?.error('Failed to fetch post by ID', {
        id,
        error: (error as Error).message
      })
      throw new Error(`Post with ID ${id} not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get posts for a specific profile/publication
   */
  async getPostsForProfile(
    profileUserId: number,
    options: { limit?: number; offset?: number } = {}
  ): Promise<SubstackPost[]> {
    try {
      this.config.logger?.debug('Fetching posts for profile', { profileUserId, options })

      const perPage = this.config.httpClient.getPerPage()
      const actualLimit = Math.min(options.limit || perPage, perPage)
      const offset = options.offset || 0

      const response = await this.config.httpClient.get<{ posts?: RawSubstackPost[] }>(
        `/api/v1/profile/posts?profile_user_id=${profileUserId}&limit=${actualLimit}&offset=${offset}`
      )

      const posts = response.posts || []
      this.config.logger?.debug('Posts fetched successfully', {
        profileUserId,
        count: posts.length
      })

      return posts.map((post) => this.convertRawToSubstackPost(post))
    } catch (error) {
      this.config.logger?.error('Failed to fetch posts for profile', {
        profileUserId,
        options,
        error: (error as Error).message
      })
      throw new Error(
        `Failed to fetch posts for profile ${profileUserId}: ${(error as Error).message}`
      )
    }
  }
}
