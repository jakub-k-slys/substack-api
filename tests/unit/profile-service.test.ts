import { ProfileService } from '@substack-api/internal/services/profile-service'
import { HttpClient } from '@substack-api/internal/http-client'
import type { SubstackFullProfile } from '@substack-api/internal'

// Mock the http client
jest.mock('@substack-api/internal/http-client')

describe('ProfileService', () => {
  let profileService: ProfileService
  let mockPublicationClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockPublicationClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockPublicationClient.get = jest.fn()

    profileService = new ProfileService(mockPublicationClient)
  })

  describe('getOwnProfile', () => {
    it('should return own profile data from the HTTP client', async () => {
      const mockHandles = {
        potentialHandles: [{ id: '1', handle: 'testuser', type: 'existing' as const }]
      }
      const mockProfile: SubstackFullProfile = {
        id: 123,
        name: 'Test User',
        handle: 'testuser',
        photo_url: 'https://example.com/photo.jpg',
        bio: 'Test bio'
      }

      mockPublicationClient.get
        .mockResolvedValueOnce(mockHandles)
        .mockResolvedValueOnce(mockProfile)

      const result = await profileService.getOwnProfile()

      expect(result).toEqual(mockProfile)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/handle/options')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/user/testuser/public_profile')
    })

    it('should throw error when handle options request fails', async () => {
      const error = new Error('Handle Options API Error')
      mockPublicationClient.get.mockRejectedValueOnce(error)

      await expect(profileService.getOwnProfile()).rejects.toThrow('Handle Options API Error')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/handle/options')
    })

    it('should throw error when profile request fails', async () => {
      const mockHandles = {
        potentialHandles: [{ id: '1', handle: 'testuser', type: 'existing' as const }]
      }
      const error = new Error('Profile API Error')

      mockPublicationClient.get.mockResolvedValueOnce(mockHandles).mockRejectedValueOnce(error)

      await expect(profileService.getOwnProfile()).rejects.toThrow('Profile API Error')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/handle/options')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/user/testuser/public_profile')
    })
  })

  describe('getProfileById', () => {
    it('should return profile data by ID from the HTTP client', async () => {
      const mockProfile: SubstackFullProfile = {
        id: 456,
        name: 'Other User',
        handle: 'otheruser',
        photo_url: 'https://example.com/other.jpg',
        bio: 'Other bio'
      }

      const mockFeedResponse = {
        items: [
          {
            entity_key: 'test-key',
            type: 'note',
            context: {
              type: 'reshare',
              timestamp: '2023-01-01T00:00:00Z',
              users: [
                {
                  id: 456,
                  name: 'Other User',
                  handle: 'otheruser',
                  photo_url: 'https://example.com/other.jpg',
                  profile_set_up_at: '2022-01-01T00:00:00Z',
                  reader_installed_at: '2022-01-01T00:00:00Z'
                }
              ],
              isFresh: true,
              source: 'feed',
              page_rank: 1
            },
            parentComments: [],
            canReply: true,
            isMuted: false,
            trackingParameters: {
              item_primary_entity_key: 'test-key',
              item_entity_key: 'test-key',
              item_type: 'note',
              item_content_user_id: 456,
              item_context_type: 'reshare',
              item_context_type_bucket: 'feed',
              item_context_timestamp: '2023-01-01T00:00:00Z',
              item_context_user_id: 456,
              item_context_user_ids: [456],
              item_can_reply: true,
              item_is_fresh: true,
              item_last_impression_at: null,
              item_page: null,
              item_page_rank: 1,
              impression_id: 'test-impression',
              followed_user_count: 0,
              subscribed_publication_count: 0,
              is_following: false,
              is_explicitly_subscribed: false
            }
          }
        ],
        originalCursorTimestamp: '2023-01-01T00:00:00Z',
        nextCursor: 'next-cursor'
      }

      mockPublicationClient.get
        .mockResolvedValueOnce(mockFeedResponse)
        .mockResolvedValueOnce(mockProfile)

      const result = await profileService.getProfileById(456)

      expect(result).toEqual(mockProfile)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/feed/profile/456')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/user/otheruser/public_profile')
    })

    it('should throw error when HTTP request fails', async () => {
      const error = new Error('API Error')
      mockPublicationClient.get.mockRejectedValueOnce(error)

      await expect(profileService.getProfileById(456)).rejects.toThrow('API Error')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/feed/profile/456')
    })
  })

  describe('getProfileBySlug', () => {
    it('should return profile data by slug from the HTTP client', async () => {
      const mockProfile: SubstackFullProfile = {
        id: 789,
        name: 'Slug User',
        handle: 'sluguser',
        photo_url: 'https://example.com/slug.jpg',
        bio: 'Slug bio'
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockProfile)

      const result = await profileService.getProfileBySlug('sluguser')

      expect(result).toEqual(mockProfile)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/user/sluguser/public_profile')
    })

    it('should throw error when HTTP request fails', async () => {
      const error = new Error('API Error')
      mockPublicationClient.get.mockRejectedValueOnce(error)

      await expect(profileService.getProfileBySlug('sluguser')).rejects.toThrow('API Error')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/user/sluguser/public_profile')
    })
  })
})
