/**
 * ProfileService unit tests
 */

import { ProfileService } from '../../../src/services/profile-service'
import { SubstackHttpClient } from '../../../src/http-client'
import { MemoryCache } from '../../../src/services/memory-cache'
import type { ServiceConfig } from '../../../src/services/types'

// Mock the entities
jest.mock('../../../src/entities')

describe('ProfileService', () => {
  let profileService: ProfileService
  let mockHttpClient: jest.Mocked<SubstackHttpClient>
  let mockCache: jest.Mocked<MemoryCache>
  let serviceConfig: ServiceConfig

  beforeEach(() => {
    jest.clearAllMocks()

    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    } as unknown as jest.Mocked<SubstackHttpClient>

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      size: jest.fn()
    } as unknown as jest.Mocked<MemoryCache>

    serviceConfig = {
      httpClient: mockHttpClient,
      cache: mockCache,
      logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      }
    }

    profileService = new ProfileService(serviceConfig)
  })

  describe('getProfileById', () => {
    it('should fetch a profile by ID successfully', async () => {
      const mockRawProfile = {
        id: 123,
        name: 'Test User',
        handle: 'testuser',
        photo_url: 'https://example.com/photo.jpg',
        bio: 'Test bio',
        profile_set_up_at: '2023-01-01T00:00:00Z',
        reader_installed_at: '2023-01-01T00:00:00Z',
        profile_disabled: false,
        publicationUsers: [],
        userLinks: [],
        subscriptions: [],
        subscriptionsTruncated: false,
        hasGuestPost: false,
        max_pub_tier: 0,
        hasActivity: false,
        hasLikes: false,
        lists: [],
        rough_num_free_subscribers_int: 0,
        rough_num_free_subscribers: '0',
        bestseller_badge_disabled: false,
        subscriberCountString: '0',
        subscriberCount: '0',
        subscriberCountNumber: 0,
        hasHiddenPublicationUsers: false,
        visibleSubscriptionsCount: 0,
        slug: 'testuser',
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'not_subscribed',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }

      mockHttpClient.get.mockResolvedValue(mockRawProfile)

      const result = await profileService.getProfileById(123)

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/123/profile')
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Fetching profile by ID', {
        id: 123
      })
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Profile fetched successfully', {
        id: 123,
        slug: 'testuser'
      })
      expect(result).toBeDefined()
    })

    it('should handle error when profile not found', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'))

      await expect(profileService.getProfileById(999)).rejects.toThrow(
        'Profile with ID 999 not found: Not found'
      )
      expect(serviceConfig.logger?.error).toHaveBeenCalledWith('Failed to fetch profile by ID', {
        id: 999,
        error: 'Not found'
      })
    })

    it('should use slug resolver when provided', async () => {
      const mockRawProfile = {
        id: 123,
        name: 'Test User',
        handle: 'testuser',
        photo_url: 'https://example.com/photo.jpg',
        bio: 'Test bio',
        profile_set_up_at: '2023-01-01T00:00:00Z',
        reader_installed_at: '2023-01-01T00:00:00Z',
        profile_disabled: false,
        publicationUsers: [],
        userLinks: [],
        subscriptions: [],
        subscriptionsTruncated: false,
        hasGuestPost: false,
        max_pub_tier: 0,
        hasActivity: false,
        hasLikes: false,
        lists: [],
        rough_num_free_subscribers_int: 0,
        rough_num_free_subscribers: '0',
        bestseller_badge_disabled: false,
        subscriberCountString: '0',
        subscriberCount: '0',
        subscriberCountNumber: 0,
        hasHiddenPublicationUsers: false,
        visibleSubscriptionsCount: 0,
        slug: 'testuser',
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'not_subscribed',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }

      mockHttpClient.get.mockResolvedValue(mockRawProfile)
      const mockSlugResolver = jest.fn().mockResolvedValue('resolved-slug')

      await profileService.getProfileById(123, mockSlugResolver)

      expect(mockSlugResolver).toHaveBeenCalledWith(123, 'testuser')
    })
  })

  describe('getProfileBySlug', () => {
    it('should fetch a profile by slug successfully', async () => {
      const mockRawProfile = {
        id: 123,
        name: 'Test User',
        handle: 'testuser',
        photo_url: 'https://example.com/photo.jpg',
        bio: 'Test bio',
        profile_set_up_at: '2023-01-01T00:00:00Z',
        reader_installed_at: '2023-01-01T00:00:00Z',
        profile_disabled: false,
        publicationUsers: [],
        userLinks: [],
        subscriptions: [],
        subscriptionsTruncated: false,
        hasGuestPost: false,
        max_pub_tier: 0,
        hasActivity: false,
        hasLikes: false,
        lists: [],
        rough_num_free_subscribers_int: 0,
        rough_num_free_subscribers: '0',
        bestseller_badge_disabled: false,
        subscriberCountString: '0',
        subscriberCount: '0',
        subscriberCountNumber: 0,
        hasHiddenPublicationUsers: false,
        visibleSubscriptionsCount: 0,
        slug: 'testuser',
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'not_subscribed',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }

      mockHttpClient.get.mockResolvedValue(mockRawProfile)

      const result = await profileService.getProfileBySlug('testuser')

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/testuser/public_profile')
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Fetching profile by slug', {
        slug: 'testuser'
      })
      expect(result).toBeDefined()
    })

    it('should throw error for empty slug', async () => {
      await expect(profileService.getProfileBySlug('')).rejects.toThrow(
        'Profile slug cannot be empty'
      )
      await expect(profileService.getProfileBySlug('   ')).rejects.toThrow(
        'Profile slug cannot be empty'
      )
    })

    it('should handle API error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'))

      await expect(profileService.getProfileBySlug('nonexistent')).rejects.toThrow(
        "Profile with slug 'nonexistent' not found: Not found"
      )
    })
  })

  describe('getOwnProfile', () => {
    it('should fetch own profile successfully', async () => {
      const mockSubscription = { user_id: 123 }
      const mockRawProfile = {
        id: 123,
        name: 'Own User',
        handle: 'ownuser',
        photo_url: 'https://example.com/photo.jpg',
        bio: 'Own bio',
        profile_set_up_at: '2023-01-01T00:00:00Z',
        reader_installed_at: '2023-01-01T00:00:00Z',
        profile_disabled: false,
        publicationUsers: [],
        userLinks: [],
        subscriptions: [],
        subscriptionsTruncated: false,
        hasGuestPost: false,
        max_pub_tier: 0,
        hasActivity: false,
        hasLikes: false,
        lists: [],
        rough_num_free_subscribers_int: 0,
        rough_num_free_subscribers: '0',
        bestseller_badge_disabled: false,
        subscriberCountString: '0',
        subscriberCount: '0',
        subscriberCountNumber: 0,
        hasHiddenPublicationUsers: false,
        visibleSubscriptionsCount: 0,
        slug: 'ownuser',
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'not_subscribed',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }

      mockHttpClient.get
        .mockResolvedValueOnce(mockSubscription)
        .mockResolvedValueOnce(mockRawProfile)

      const result = await profileService.getOwnProfile()

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/subscription')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/123/profile')
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Fetching own profile')
      expect(result).toBeDefined()
    })

    it('should handle authentication failure', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Unauthorized'))

      await expect(profileService.getOwnProfile()).rejects.toThrow(
        'Failed to get own profile: Unauthorized'
      )
      expect(serviceConfig.logger?.error).toHaveBeenCalledWith('Failed to get own profile', {
        error: 'Unauthorized'
      })
    })
  })
})
