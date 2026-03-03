import { ProfileService } from '@substack-api/internal/services/profile-service'
import { HttpClient } from '@substack-api/internal/http-client'

jest.mock('@substack-api/internal/http-client')

const makeGatewayProfile = (id: number, handle: string, name: string) => ({
  id,
  handle,
  name,
  url: `https://substack.com/@${handle}`,
  avatar_url: `https://example.com/${handle}.jpg`,
  bio: `Bio for ${name}`
})

describe('ProfileService', () => {
  let profileService: ProfileService
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = new HttpClient('https://test.com', {
      token: 'dummy-token',
      publicationUrl: 'https://pub.com'
    }) as jest.Mocked<HttpClient>
    mockClient.get = jest.fn()
    profileService = new ProfileService(mockClient)
  })

  describe('getOwnProfile', () => {
    it('should return own profile from GET /me', async () => {
      const mockProfile = makeGatewayProfile(123, 'testuser', 'Test User')
      mockClient.get.mockResolvedValueOnce(mockProfile)

      const result = await profileService.getOwnProfile()

      expect(result).toEqual(mockProfile)
      expect(mockClient.get).toHaveBeenCalledWith('/me')
    })

    it('should throw error when request fails', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('Unauthorized'))

      await expect(profileService.getOwnProfile()).rejects.toThrow('Unauthorized')
      expect(mockClient.get).toHaveBeenCalledWith('/me')
    })
  })

  describe('getProfileBySlug', () => {
    it('should return profile from GET /profiles/{slug}', async () => {
      const mockProfile = makeGatewayProfile(456, 'sluguser', 'Slug User')
      mockClient.get.mockResolvedValueOnce(mockProfile)

      const result = await profileService.getProfileBySlug('sluguser')

      expect(result).toEqual(mockProfile)
      expect(mockClient.get).toHaveBeenCalledWith('/profiles/sluguser')
    })

    it('should throw error when request fails', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('Not Found'))

      await expect(profileService.getProfileBySlug('unknown')).rejects.toThrow('Not Found')
      expect(mockClient.get).toHaveBeenCalledWith('/profiles/unknown')
    })
  })
})
