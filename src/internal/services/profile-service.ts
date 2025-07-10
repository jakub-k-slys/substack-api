import type { SubstackFullProfile } from '../types'
import type { HttpClient } from '../http-client'

/**
 * Service responsible for profile-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class ProfileService {
  constructor(private readonly httpClient: HttpClient) {}

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
}
