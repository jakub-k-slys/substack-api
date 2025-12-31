import type { HttpClient } from '@substack-api/internal/http-client'
import type { SubstackFullProfile, SubstackUserProfile } from '@substack-api/internal/types'
import type { PotentialHandles } from '@substack-api/internal/types/potential-handles'

/**
 * Service responsible for profile-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class ProfileService {
  constructor(private readonly substackClient: HttpClient) {}

  async getOwnSlug(): Promise<string> {
    const data = await this.substackClient.get<PotentialHandles>('/handle/options')
    const existingHandle = data.potentialHandles.filter((handle) => handle.type == 'existing')[0]
    return existingHandle.handle
  }
  /**
   * Get authenticated user's own profile
   * @returns Promise<SubstackFullProfile> - Raw profile data from API
   * @throws {Error} When authentication fails or profile cannot be retrieved
   */
  async getOwnProfile(): Promise<SubstackFullProfile> {
    const ownSlug = await this.getOwnSlug()
    return await this.substackClient.get<SubstackFullProfile>(`/user/${ownSlug}/public_profile`)
  }

  /**
   * Get a profile by user ID
   * @param id - The user ID
   * @returns Promise<SubstackFullProfile> - Raw profile data from API
   * @throws {Error} When profile is not found or API request fails
   */
  async getProfileById(id: number): Promise<SubstackFullProfile> {
    const profileFeed = await this.substackClient.get<SubstackUserProfile>(
      `/reader/feed/profile/${id}`
    )

    for (const item of profileFeed.items) {
      if (item.context?.users.length > 0) {
        for (const user of item.context.users) {
          if (user.id === id) {
            return await this.getProfileBySlug(user.handle)
          }
        }
      }
    }

    throw new Error(`Profile with ID ${id} not found`)
  }

  /**
   * Get a profile by handle/slug
   * @param slug - The user handle/slug
   * @returns Promise<SubstackFullProfile> - Raw profile data from API
   * @throws {Error} When profile is not found or API request fails
   */
  async getProfileBySlug(slug: string): Promise<SubstackFullProfile> {
    return await this.substackClient.get<SubstackFullProfile>(`/user/${slug}/public_profile`)
  }
}
