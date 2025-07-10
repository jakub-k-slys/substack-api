import { SubstackClient } from '../../src/substack-client'
import { HttpClient } from '../../src/internal/http-client'
import { OwnProfile, Profile } from '../../src/domain'
import { SlugService, ProfileService } from '../../src/internal/services'
import type { SubstackFullProfile } from '../../src/internal'

// Mock the HTTP client and services
jest.mock('../../src/internal/http-client')
jest.mock('../../src/internal/services')

describe('SubstackClient - Slug Resolution', () => {
  let client: SubstackClient
  let mockHttpClient: jest.Mocked<HttpClient>
  let mockSlugService: jest.Mocked<SlugService>
  let mockProfileService: jest.Mocked<ProfileService>

  beforeEach(() => {
    jest.clearAllMocks()
    mockHttpClient = new HttpClient('https://test.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()
    mockHttpClient.post = jest.fn()
    mockHttpClient.request = jest.fn()

    mockSlugService = new SlugService(mockHttpClient) as jest.Mocked<SlugService>
    mockSlugService.getSlugForUserId = jest.fn()
    mockSlugService.getSlugMapping = jest.fn()

    mockProfileService = new ProfileService(mockHttpClient) as jest.Mocked<ProfileService>
    mockProfileService.getOwnProfile = jest.fn()
    mockProfileService.getProfileById = jest.fn()

    client = new SubstackClient({
      apiKey: 'test-api-key',
      hostname: 'test.substack.com'
    })
    // Replace the internal services with our mocks
    ;(client as unknown as { publicationClient: HttpClient }).publicationClient = mockHttpClient
    ;(client as unknown as { slugService: SlugService }).slugService = mockSlugService
    ;(client as unknown as { profileService: ProfileService }).profileService = mockProfileService
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('slug resolution via subscriptions cache', () => {
    it('should resolve own profile slug from subscriptions cache', async () => {
      const mockSubscription = { user_id: 123 }
      const mockProfile: SubstackFullProfile = {
        id: 123,
        name: 'Test User',
        handle: 'fallback-handle',
        photo_url: 'https://example.com/photo.jpg',
        profile_set_up_at: '2023-01-01T00:00:00Z',
        reader_installed_at: '2023-01-01T00:00:00Z',
        profile_disabled: false,
        publicationUsers: [],
        userLinks: [],
        subscriptions: [],
        subscriptionsTruncated: false,
        hasGuestPost: false,
        max_pub_tier: 1,
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
        slug: 'fallback-handle',
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'none',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }

      mockProfileService.getOwnProfile.mockResolvedValueOnce(mockProfile)
      mockHttpClient.get.mockResolvedValueOnce(mockSubscription) // /api/v1/subscription
      mockSlugService.getSlugForUserId.mockResolvedValueOnce('resolved-slug-1')

      const ownProfile = await client.ownProfile()

      expect(ownProfile).toBeInstanceOf(OwnProfile)
      expect(ownProfile.slug).toBe('resolved-slug-1') // Should use resolved slug from service
      expect(ownProfile.url).toBe('https://substack.com/@resolved-slug-1')
      expect(mockProfileService.getOwnProfile).toHaveBeenCalled()
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/subscription')
      expect(mockSlugService.getSlugForUserId).toHaveBeenCalledWith(123, 'fallback-handle')
    })

    it('should resolve foreign profile slug from subscriptions cache', async () => {
      const mockProfile: SubstackFullProfile = {
        id: 456,
        name: 'Foreign User',
        handle: 'fallback-handle-2',
        photo_url: 'https://example.com/photo2.jpg',
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
        slug: 'fallback-handle-2',
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'none',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }

      mockProfileService.getProfileById.mockResolvedValueOnce(mockProfile)
      mockSlugService.getSlugForUserId.mockResolvedValueOnce('resolved-slug-2')

      const profile = await client.profileForId(456)

      expect(profile).toBeInstanceOf(Profile)
      expect(profile.slug).toBe('resolved-slug-2') // Should use resolved slug from service
      expect(profile.url).toBe('https://substack.com/@resolved-slug-2')
      expect(mockProfileService.getProfileById).toHaveBeenCalledWith(456)
      expect(mockSlugService.getSlugForUserId).toHaveBeenCalledWith(456, 'fallback-handle-2')
    })

    it('should use cached subscriptions on second call', async () => {
      const mockProfile1: SubstackFullProfile = {
        id: 123,
        name: 'Test User 1',
        handle: 'fallback-1',
        photo_url: 'https://example.com/photo1.jpg',
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
        slug: 'fallback-1',
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'none',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }

      const mockProfile2: SubstackFullProfile = {
        ...mockProfile1,
        id: 456,
        name: 'Test User 2',
        handle: 'fallback-2',
        slug: 'fallback-2'
      }

      mockProfileService.getProfileById
        .mockResolvedValueOnce(mockProfile1) // First call
        .mockResolvedValueOnce(mockProfile2) // Second call

      mockSlugService.getSlugForUserId
        .mockResolvedValueOnce('resolved-slug-1') // First call
        .mockResolvedValueOnce('resolved-slug-2') // Second call (should use cache)

      const profile1 = await client.profileForId(123)
      const profile2 = await client.profileForId(456)

      expect(profile1.slug).toBe('resolved-slug-1')
      expect(profile2.slug).toBe('resolved-slug-2')

      // Should call SlugService twice (same underlying cache)
      expect(mockSlugService.getSlugForUserId).toHaveBeenCalledTimes(2)
      expect(mockSlugService.getSlugForUserId).toHaveBeenCalledWith(123, 'fallback-1')
      expect(mockSlugService.getSlugForUserId).toHaveBeenCalledWith(456, 'fallback-2')
    })

    it('should fallback to handle when slug not found in subscriptions', async () => {
      const mockProfile: SubstackFullProfile = {
        id: 999, // Not in subscriptions
        name: 'Unknown User',
        handle: 'unknown-handle',
        photo_url: 'https://example.com/photo.jpg',
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
        slug: 'unknown-handle',
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'none',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }

      mockProfileService.getProfileById.mockResolvedValueOnce(mockProfile)
      mockSlugService.getSlugForUserId.mockResolvedValueOnce('unknown-handle') // Fallback to handle

      const profile = await client.profileForId(999)

      expect(profile.slug).toBe('unknown-handle') // Should fallback to handle
      expect(profile.url).toBe('https://substack.com/@unknown-handle')
      expect(mockSlugService.getSlugForUserId).toHaveBeenCalledWith(999, 'unknown-handle')
    })

    it('should handle subscriptions endpoint failure gracefully', async () => {
      const mockProfile: SubstackFullProfile = {
        id: 123,
        name: 'Test User',
        handle: 'fallback-handle',
        photo_url: 'https://example.com/photo.jpg',
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
        slug: 'fallback-handle',
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'none',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }

      mockProfileService.getProfileById.mockResolvedValueOnce(mockProfile)
      mockSlugService.getSlugForUserId.mockResolvedValueOnce('fallback-handle') // Graceful fallback

      const profile = await client.profileForId(123)

      expect(profile.slug).toBe('fallback-handle') // Should fallback to handle
      expect(profile.url).toBe('https://substack.com/@fallback-handle')
      expect(mockSlugService.getSlugForUserId).toHaveBeenCalledWith(123, 'fallback-handle')
    })
  })
})
