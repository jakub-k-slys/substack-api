import { SubstackClient } from '../../src/substack-client'
import { SubstackHttpClient } from '../../src/http-client'
import { OwnProfile, Profile } from '../../src/entities'
import type { SubstackFullProfile, SubstackSubscriptionsResponse } from '../../src/types'

// Mock the HTTP client
jest.mock('../../src/http-client')

describe('SubstackClient - Slug Resolution', () => {
  let client: SubstackClient
  let mockHttpClient: jest.Mocked<SubstackHttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockHttpClient = new SubstackHttpClient({
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<SubstackHttpClient>
    mockHttpClient.get = jest.fn()
    mockHttpClient.post = jest.fn()
    mockHttpClient.request = jest.fn()

    client = new SubstackClient({
      apiKey: 'test-api-key',
      hostname: 'test.substack.com'
    })
    // Replace the internal http client with our mock
    ;(client as unknown as { httpClient: SubstackHttpClient }).httpClient = mockHttpClient
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('slug resolution via subscriptions cache', () => {
    const mockSubscriptionsResponse: SubstackSubscriptionsResponse = {
      subscriptions: [
        {
          user_id: 123,
          id: 1,
          visibility: 'public',
          membership_state: 'active',
          is_founding: false,
          author_handle: 'resolved-slug-1',
          publication: {
            id: 1,
            name: 'Test Publication',
            subdomain: 'test',
            logo_url: 'https://example.com/logo.png',
            author_id: 123,
            primary_user_id: 123,
            theme_var_background_pop: '#ffffff',
            created_at: '2023-01-01T00:00:00Z',
            community_enabled: false,
            invite_only: false,
            payments_state: 'disabled',
            explicit: false,
            homepage_type: 'newsletter',
            is_personal_mode: false,
            custom_domain_optional: false,
            author: {
              id: 123,
              name: 'Test Author',
              handle: 'test-author',
              photo_url: 'https://example.com/photo.jpg',
              profile_set_up_at: '2023-01-01T00:00:00Z',
              reader_installed_at: '2023-01-01T00:00:00Z'
            }
          }
        },
        {
          user_id: 456,
          id: 2,
          visibility: 'public',
          membership_state: 'active',
          is_founding: false,
          author_handle: 'resolved-slug-2',
          publication: {
            id: 2,
            name: 'Another Publication',
            subdomain: 'another',
            logo_url: 'https://example.com/logo2.png',
            author_id: 456,
            primary_user_id: 456,
            theme_var_background_pop: '#ffffff',
            created_at: '2023-01-01T00:00:00Z',
            community_enabled: false,
            invite_only: false,
            payments_state: 'disabled',
            explicit: false,
            homepage_type: 'newsletter',
            is_personal_mode: false,
            custom_domain_optional: false,
            author: {
              id: 456,
              name: 'Another Author',
              handle: 'another-author',
              photo_url: 'https://example.com/photo2.jpg',
              profile_set_up_at: '2023-01-01T00:00:00Z',
              reader_installed_at: '2023-01-01T00:00:00Z'
            }
          }
        }
      ]
    }

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

      mockHttpClient.get
        .mockResolvedValueOnce(mockSubscription) // /api/v1/subscription
        .mockResolvedValueOnce(mockProfile) // /api/v1/user/123/profile
        .mockResolvedValueOnce(mockSubscriptionsResponse) // /api/v1/subscriptions

      const ownProfile = await client.ownProfile()

      expect(ownProfile).toBeInstanceOf(OwnProfile)
      expect(ownProfile.slug).toBe('resolved-slug-1') // Should use resolved slug from cache
      expect(ownProfile.url).toBe('https://substack.com/@resolved-slug-1')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/subscription')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/123/profile')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/subscriptions')
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

      mockHttpClient.get
        .mockResolvedValueOnce(mockProfile) // /api/v1/users/456
        .mockResolvedValueOnce(mockSubscriptionsResponse) // /api/v1/subscriptions

      const profile = await client.profileForId(456)

      expect(profile).toBeInstanceOf(Profile)
      expect(profile.slug).toBe('resolved-slug-2') // Should use resolved slug from cache
      expect(profile.url).toBe('https://substack.com/@resolved-slug-2')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/users/456')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/subscriptions')
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

      mockHttpClient.get
        .mockResolvedValueOnce(mockProfile1) // /api/v1/users/123
        .mockResolvedValueOnce(mockSubscriptionsResponse) // /api/v1/subscriptions (first call)
        .mockResolvedValueOnce(mockProfile2) // /api/v1/users/456
      // Note: No second call to /api/v1/subscriptions expected

      const profile1 = await client.profileForId(123)
      const profile2 = await client.profileForId(456)

      expect(profile1.slug).toBe('resolved-slug-1')
      expect(profile2.slug).toBe('resolved-slug-2')

      // Should only call subscriptions endpoint once
      expect(mockHttpClient.get).toHaveBeenCalledTimes(3)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/subscriptions')
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

      mockHttpClient.get
        .mockResolvedValueOnce(mockProfile) // /api/v1/users/999
        .mockResolvedValueOnce(mockSubscriptionsResponse) // /api/v1/subscriptions

      const profile = await client.profileForId(999)

      expect(profile.slug).toBe('unknown-handle') // Should fallback to handle
      expect(profile.url).toBe('https://substack.com/@unknown-handle')
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

      mockHttpClient.get
        .mockResolvedValueOnce(mockProfile) // /api/v1/users/123
        .mockRejectedValueOnce(new Error('Subscriptions unavailable')) // /api/v1/subscriptions fails

      const profile = await client.profileForId(123)

      expect(profile.slug).toBe('fallback-handle') // Should fallback to handle
      expect(profile.url).toBe('https://substack.com/@fallback-handle')
    })
  })
})
