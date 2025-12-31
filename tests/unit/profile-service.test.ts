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
            context: {
              users: [{ id: 456, handle: 'otheruser' }]
            }
          }
        ]
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
