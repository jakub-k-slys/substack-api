/**
 * ProfileService - Business logic for profile operations
 */

import type { ServiceConfig, SlugResolver } from './types'
import type { RawSubstackFullProfile } from '../internal/types'
import { Profile, OwnProfile } from '../entities'
import { convertRawToSubstackFullProfile } from './profile-converter'

export class ProfileService {
  constructor(private readonly config: ServiceConfig) {}

  /**
   * Get a profile by user ID
   */
  async getProfileById(id: number, slugResolver?: SlugResolver): Promise<Profile> {
    try {
      this.config.logger?.debug('Fetching profile by ID', { id })

      const rawProfile = await this.config.httpClient.get<RawSubstackFullProfile>(
        `/api/v1/user/${id}/profile`
      )

      const substackProfile = convertRawToSubstackFullProfile(rawProfile)

      // Try to resolve slug from cache or subscriptions
      const resolvedSlug = slugResolver
        ? await slugResolver(id, substackProfile.handle)
        : substackProfile.handle

      this.config.logger?.debug('Profile fetched successfully', { id, slug: resolvedSlug })

      return new Profile(substackProfile, this.config.httpClient, resolvedSlug, slugResolver)
    } catch (error) {
      this.config.logger?.error('Failed to fetch profile by ID', {
        id,
        error: (error as Error).message
      })
      throw new Error(`Profile with ID ${id} not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get a profile by handle/slug
   */
  async getProfileBySlug(slug: string, slugResolver?: SlugResolver): Promise<Profile> {
    if (!slug || slug.trim() === '') {
      throw new Error('Profile slug cannot be empty')
    }

    try {
      this.config.logger?.debug('Fetching profile by slug', { slug })

      const rawProfile = await this.config.httpClient.get<RawSubstackFullProfile>(
        `/api/v1/user/${slug}/public_profile`
      )

      const substackProfile = convertRawToSubstackFullProfile(rawProfile)

      // For profiles fetched by slug, use the provided slug but check with resolver for consistency
      const resolvedSlug = slugResolver ? await slugResolver(substackProfile.id, slug) : slug

      this.config.logger?.debug('Profile fetched successfully', {
        id: substackProfile.id,
        slug: resolvedSlug
      })

      return new Profile(substackProfile, this.config.httpClient, resolvedSlug, slugResolver)
    } catch (error) {
      this.config.logger?.error('Failed to fetch profile by slug', {
        slug,
        error: (error as Error).message
      })
      throw new Error(`Profile with slug '${slug}' not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get the authenticated user's own profile with write capabilities
   */
  async getOwnProfile(slugResolver?: SlugResolver): Promise<OwnProfile> {
    try {
      this.config.logger?.debug('Fetching own profile')

      // Step 1: Get user_id from subscription endpoint
      const subscription = await this.config.httpClient.get<{ user_id: number }>(
        '/api/v1/subscription'
      )
      const userId = subscription.user_id

      // Step 2: Get full profile using the user_id
      const rawProfile = await this.config.httpClient.get<RawSubstackFullProfile>(
        `/api/v1/user/${userId}/profile`
      )

      const substackProfile = convertRawToSubstackFullProfile(rawProfile)

      // Step 3: Resolve slug from subscriptions cache
      const resolvedSlug = slugResolver
        ? await slugResolver(userId, substackProfile.handle)
        : substackProfile.handle

      this.config.logger?.debug('Own profile fetched successfully', { userId, slug: resolvedSlug })

      return new OwnProfile(substackProfile, this.config.httpClient, resolvedSlug, slugResolver)
    } catch (error) {
      this.config.logger?.error('Failed to get own profile', { error: (error as Error).message })
      throw new Error(`Failed to get own profile: ${(error as Error).message}`)
    }
  }
}
