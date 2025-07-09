import type { SubstackFullProfile, SubstackPost, SubstackNote } from '../types'
import type { SubstackHttpClient } from '../../http-client'

/**
 * Service responsible for profile-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class ProfileService {
  constructor(private readonly httpClient: SubstackHttpClient) {}

  /**
   * Get authenticated user's own profile
   * @returns Promise<SubstackFullProfile> - Raw profile data from API
   * @throws {Error} When authentication fails or profile cannot be retrieved
   */
  async getOwnProfile(): Promise<SubstackFullProfile> {
    // Step 1: Get user_id from subscription endpoint
    const subscription = await this.httpClient.get<{ user_id: number }>('/api/v1/subscription')
    const userId = subscription.user_id

    // Step 2: Get full profile using the user_id
    return await this.httpClient.get<SubstackFullProfile>(`/api/v1/user/${userId}/profile`)
  }

  /**
   * Get a profile by user ID
   * @param id - The user ID
   * @returns Promise<SubstackFullProfile> - Raw profile data from API
   * @throws {Error} When profile is not found or API request fails
   */
  async getProfileById(id: number): Promise<SubstackFullProfile> {
    return await this.httpClient.get<SubstackFullProfile>(`/api/v1/user/${id}/profile`)
  }

  /**
   * Get a profile by handle/slug
   * @param slug - The user handle/slug
   * @returns Promise<SubstackFullProfile> - Raw profile data from API
   * @throws {Error} When profile is not found or API request fails
   */
  async getProfileBySlug(slug: string): Promise<SubstackFullProfile> {
    return await this.httpClient.get<SubstackFullProfile>(`/api/v1/user/${slug}/public_profile`)
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

  /**
   * Get notes for a profile
   * @param profileId - The profile user ID
   * @param options - Pagination options
   * @returns Promise<SubstackNote[]> - Raw note data from API
   * @throws {Error} When notes cannot be retrieved
   */
  async getNotesForProfile(
    profileId: number,
    options: { limit: number; offset: number }
  ): Promise<SubstackNote[]> {
    const response = await this.httpClient.get<{ items?: SubstackNote[] }>(
      `/api/v1/reader/feed/profile/${profileId}?types=note&limit=${options.limit}&offset=${options.offset}`
    )
    return response.items || []
  }
}
