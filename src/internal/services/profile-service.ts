import type { HttpClient } from '@substack-api/internal/http-client'
import {
  SubstackFullProfileCodec,
  SubstackUserProfileCodec,
  PotentialHandlesCodec
} from '@substack-api/internal/types'
import type { SubstackFullProfile } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

/**
 * Service responsible for profile-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class ProfileService {
  constructor(private readonly substackClient: HttpClient) {}

  async getOwnSlug(): Promise<string> {
    const rawResponse = await this.substackClient.get<unknown>('/handle/options')
    const data = decodeOrThrow(PotentialHandlesCodec, rawResponse, 'Potential handles response')
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
    const rawResponse = await this.substackClient.get<unknown>(`/user/${ownSlug}/public_profile`)
    return decodeOrThrow(SubstackFullProfileCodec, rawResponse, 'Full profile response')
  }

  /**
   * Get a profile by user ID
   * @param id - The user ID
   * @returns Promise<SubstackFullProfile> - Raw profile data from API
   * @throws {Error} When profile is not found or API request fails
   */
  async getProfileById(id: number): Promise<SubstackFullProfile> {
    const rawProfileFeed = await this.substackClient.get<unknown>(`/reader/feed/profile/${id}`)
    const profileFeed = decodeOrThrow(
      SubstackUserProfileCodec,
      rawProfileFeed,
      'User profile feed response'
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
    const rawResponse = await this.substackClient.get<unknown>(`/user/${slug}/public_profile`)
    return decodeOrThrow(SubstackFullProfileCodec, rawResponse, 'Full profile response')
  }
}
