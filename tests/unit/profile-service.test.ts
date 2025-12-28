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

      mockHttpClient.get.mockResolvedValueOnce(mockHandles).mockResolvedValueOnce(mockProfile)

      const result = await profileService.getOwnProfile()

      expect(result).toEqual(mockProfile)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/handle/options')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/testuser/public_profile')
    })

    it('should throw error when handle options request fails', async () => {
      const error = new Error('Handle Options API Error')
      mockHttpClient.get.mockRejectedValueOnce(error)

      await expect(profileService.getOwnProfile()).rejects.toThrow('Handle Options API Error')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/handle/options')
    })

    it('should throw error when profile request fails', async () => {
      const mockHandles = {
        potentialHandles: [{ id: '1', handle: 'testuser', type: 'existing' as const }]
      }
      const error = new Error('Profile API Error')

      mockHttpClient.get.mockResolvedValueOnce(mockHandles).mockRejectedValueOnce(error)

      await expect(profileService.getOwnProfile()).rejects.toThrow('Profile API Error')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/handle/options')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/testuser/public_profile')
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
        bio: 'Slug bio'
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
