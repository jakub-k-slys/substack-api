import { ProfileService } from '../../src/internal/services/profile-service'
import { HttpClient } from '../../src/internal/http-client'
import type { SubstackFullProfile } from '../../src/internal'

// Mock the http client
jest.mock('../../src/internal/http-client')

describe('ProfileService', () => {
  let profileService: ProfileService
  let mockHttpClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockHttpClient = new HttpClient('https://test.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()

    profileService = new ProfileService(mockHttpClient)
  })

  describe('getOwnProfile', () => {
    it('should return own profile data from the HTTP client', async () => {
      const mockProfile: SubstackFullProfile = {
        id: 123,
        name: 'Test User',
        handle: 'testuser',
        photo_url: 'https://example.com/photo.jpg',
        bio: 'Test bio',
        profile_set_up_at: '2023-01-01T00:00:00Z',
        reader_installed_at: '2023-01-01T00:00:00Z',
        tos_accepted_at: null,
        profile_disabled: false,
        publicationUsers: [],
        userLinks: [],
        subscriptions: [],
        subscriptionsTruncated: false,
        hasGuestPost: false,
        max_pub_tier: 0,
        hasActivity: true,
        hasLikes: true,
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
        primaryPublicationSubscriptionState: 'none',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }

      mockHttpClient.get.mockResolvedValueOnce(mockProfile)

      const result = await profileService.getOwnProfile()

      expect(result).toEqual(mockProfile)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/profile/self')
    })

    it('should throw error when profile request fails', async () => {
      const error = new Error('Profile API Error')
      mockHttpClient.get.mockRejectedValueOnce(error)

      await expect(profileService.getOwnProfile()).rejects.toThrow('Profile API Error')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/profile/self')
    })
  })

  describe('getProfileById', () => {
    it('should return profile data by ID from the HTTP client', async () => {
      const mockFeedResponse = {
        items: [
          {
            entity_key: 'test',
            type: 'post',
            context: {
              users: [
                {
                  id: 456,
                  handle: 'otheruser',
                  name: 'Other User',
                  photo_url: 'https://example.com/other.jpg'
                }
              ]
            },
            publication: null,
            post: null,
            comment: null,
            parentComments: [],
            canReply: false,
            isMuted: false,
            trackingParameters: {}
          }
        ],
        originalCursorTimestamp: '2023-01-01T00:00:00Z',
        nextCursor: 'abc123'
      }

      const mockProfile: SubstackFullProfile = {
        id: 456,
        name: 'Other User',
        handle: 'otheruser',
        photo_url: 'https://example.com/other.jpg',
        bio: 'Other bio',
        profile_set_up_at: '2023-01-01T00:00:00Z',
        reader_installed_at: '2023-01-01T00:00:00Z',
        tos_accepted_at: null,
        profile_disabled: false,
        publicationUsers: [],
        userLinks: [],
        subscriptions: [],
        subscriptionsTruncated: false,
        hasGuestPost: false,
        max_pub_tier: 0,
        hasActivity: true,
        hasLikes: true,
        lists: [],
        rough_num_free_subscribers_int: 0,
        rough_num_free_subscribers: '0',
        bestseller_badge_disabled: false,
        subscriberCountString: '0',
        subscriberCount: '0',
        subscriberCountNumber: 0,
        hasHiddenPublicationUsers: false,
        visibleSubscriptionsCount: 0,
        slug: 'otheruser',
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'none',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }

      mockHttpClient.get.mockResolvedValueOnce(mockFeedResponse).mockResolvedValueOnce(mockProfile)

      const result = await profileService.getProfileById(456)

      expect(result).toEqual(mockProfile)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/feed/profile/456')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/otheruser/public_profile')
    })

    it('should throw error when HTTP request fails', async () => {
      const error = new Error('API Error')
      mockHttpClient.get.mockRejectedValueOnce(error)

      await expect(profileService.getProfileById(456)).rejects.toThrow('API Error')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/feed/profile/456')
    })
  })

  describe('getProfileBySlug', () => {
    it('should return profile data by slug from the HTTP client', async () => {
      const mockProfile: SubstackFullProfile = {
        id: 789,
        name: 'Slug User',
        handle: 'sluguser',
        photo_url: 'https://example.com/slug.jpg',
        bio: 'Slug bio',
        profile_set_up_at: '2023-01-01T00:00:00Z',
        reader_installed_at: '2023-01-01T00:00:00Z',
        tos_accepted_at: null,
        profile_disabled: false,
        publicationUsers: [],
        userLinks: [],
        subscriptions: [],
        subscriptionsTruncated: false,
        hasGuestPost: false,
        max_pub_tier: 0,
        hasActivity: true,
        hasLikes: true,
        lists: [],
        rough_num_free_subscribers_int: 0,
        rough_num_free_subscribers: '0',
        bestseller_badge_disabled: false,
        subscriberCountString: '0',
        subscriberCount: '0',
        subscriberCountNumber: 0,
        hasHiddenPublicationUsers: false,
        visibleSubscriptionsCount: 0,
        slug: 'sluguser',
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'none',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }

      mockHttpClient.get.mockResolvedValueOnce(mockProfile)

      const result = await profileService.getProfileBySlug('sluguser')

      expect(result).toEqual(mockProfile)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/sluguser/public_profile')
    })

    it('should throw error when HTTP request fails', async () => {
      const error = new Error('API Error')
      mockHttpClient.get.mockRejectedValueOnce(error)

      await expect(profileService.getProfileBySlug('sluguser')).rejects.toThrow('API Error')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/sluguser/public_profile')
    })
  })
})
