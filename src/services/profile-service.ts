/**
 * ProfileService - Business logic for profile operations
 */

import type { ServiceConfig, SlugResolver } from './types'
import type { RawSubstackFullProfile } from '../internal/types'
import type { SubstackFullProfile } from '../types'
import { Profile, OwnProfile } from '../entities'

export class ProfileService {
  constructor(private readonly config: ServiceConfig) {}

  /**
   * Convert raw profile data to the expected SubstackFullProfile format
   */
  private convertRawToSubstackFullProfile(rawProfile: RawSubstackFullProfile): SubstackFullProfile {
    return {
      id: rawProfile.id,
      name: rawProfile.name,
      handle: rawProfile.handle,
      previous_name: rawProfile.previous_name,
      photo_url: rawProfile.photo_url,
      bio: rawProfile.bio,
      profile_set_up_at: rawProfile.profile_set_up_at,
      reader_installed_at: rawProfile.reader_installed_at,
      tos_accepted_at: rawProfile.tos_accepted_at,
      profile_disabled: rawProfile.profile_disabled,
      publicationUsers: rawProfile.publicationUsers,
      userLinks: rawProfile.userLinks,
      subscriptions: rawProfile.subscriptions,
      subscriptionsTruncated: rawProfile.subscriptionsTruncated,
      hasGuestPost: rawProfile.hasGuestPost,
      primaryPublication: rawProfile.primaryPublication,
      max_pub_tier: rawProfile.max_pub_tier,
      hasActivity: rawProfile.hasActivity,
      hasLikes: rawProfile.hasLikes,
      lists: rawProfile.lists,
      rough_num_free_subscribers_int: rawProfile.rough_num_free_subscribers_int,
      rough_num_free_subscribers: rawProfile.rough_num_free_subscribers,
      bestseller_badge_disabled: rawProfile.bestseller_badge_disabled,
      bestseller_tier: rawProfile.bestseller_tier,
      subscriberCountString: rawProfile.subscriberCountString,
      subscriberCount: rawProfile.subscriberCount,
      subscriberCountNumber: rawProfile.subscriberCountNumber,
      hasHiddenPublicationUsers: rawProfile.hasHiddenPublicationUsers,
      visibleSubscriptionsCount: rawProfile.visibleSubscriptionsCount,
      slug: rawProfile.slug,
      previousSlug: rawProfile.previousSlug,
      primaryPublicationIsPledged: rawProfile.primaryPublicationIsPledged,
      primaryPublicationSubscriptionState: rawProfile.primaryPublicationSubscriptionState,
      isSubscribed: rawProfile.isSubscribed,
      isFollowing: rawProfile.isFollowing,
      followsViewer: rawProfile.followsViewer,
      can_dm: rawProfile.can_dm,
      dm_upgrade_options: rawProfile.dm_upgrade_options,
      userProfile: rawProfile.userProfile
    }
  }

  /**
   * Get a profile by user ID
   */
  async getProfileById(id: number, slugResolver?: SlugResolver): Promise<Profile> {
    try {
      this.config.logger?.debug('Fetching profile by ID', { id })
      
      const rawProfile = await this.config.httpClient.get<RawSubstackFullProfile>(
        `/api/v1/user/${id}/profile`
      )

      const substackProfile = this.convertRawToSubstackFullProfile(rawProfile)

      // Try to resolve slug from cache or subscriptions
      const resolvedSlug = slugResolver ? await slugResolver(id, substackProfile.handle) : substackProfile.handle

      this.config.logger?.debug('Profile fetched successfully', { id, slug: resolvedSlug })
      
      return new Profile(substackProfile, this.config.httpClient, resolvedSlug, slugResolver)
    } catch (error) {
      this.config.logger?.error('Failed to fetch profile by ID', { id, error: (error as Error).message })
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

      const substackProfile = this.convertRawToSubstackFullProfile(rawProfile)

      // For profiles fetched by slug, use the provided slug but check with resolver for consistency
      const resolvedSlug = slugResolver ? await slugResolver(substackProfile.id, slug) : slug

      this.config.logger?.debug('Profile fetched successfully', { id: substackProfile.id, slug: resolvedSlug })
      
      return new Profile(substackProfile, this.config.httpClient, resolvedSlug, slugResolver)
    } catch (error) {
      this.config.logger?.error('Failed to fetch profile by slug', { slug, error: (error as Error).message })
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
      const subscription = await this.config.httpClient.get<{ user_id: number }>('/api/v1/subscription')
      const userId = subscription.user_id

      // Step 2: Get full profile using the user_id
      const rawProfile = await this.config.httpClient.get<RawSubstackFullProfile>(
        `/api/v1/user/${userId}/profile`
      )

      const substackProfile = this.convertRawToSubstackFullProfile(rawProfile)

      // Step 3: Resolve slug from subscriptions cache
      const resolvedSlug = slugResolver ? await slugResolver(userId, substackProfile.handle) : substackProfile.handle

      this.config.logger?.debug('Own profile fetched successfully', { userId, slug: resolvedSlug })
      
      return new OwnProfile(substackProfile, this.config.httpClient, resolvedSlug, slugResolver)
    } catch (error) {
      this.config.logger?.error('Failed to get own profile', { error: (error as Error).message })
      throw new Error(`Failed to get own profile: ${(error as Error).message}`)
    }
  }
}