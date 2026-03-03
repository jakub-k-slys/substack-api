import { FollowingService } from '@substack-api/internal/services/following-service'
import { HttpClient } from '@substack-api/internal/http-client'

jest.mock('@substack-api/internal/http-client')

describe('FollowingService', () => {
  let followingService: FollowingService
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = new HttpClient('https://test.com', {
      token: 'dummy-token',
      publicationUrl: 'https://pub.com'
    }) as jest.Mocked<HttpClient>
    mockClient.get = jest.fn()
    followingService = new FollowingService(mockClient)
  })

  describe('getFollowing', () => {
    it('should return following users from GET /me/following with { items } response shape', async () => {
      const mockUsers = [
        { id: 123, handle: 'user123' },
        { id: 456, handle: 'user456' }
      ]
      mockClient.get.mockResolvedValue({ items: mockUsers })

      const result = await followingService.getFollowing()

      expect(mockClient.get).toHaveBeenCalledWith('/me/following')
      expect(result).toEqual(mockUsers)
    })

    it('should return empty array when items is empty', async () => {
      mockClient.get.mockResolvedValue({ items: [] })

      const result = await followingService.getFollowing()

      expect(result).toEqual([])
    })

    it('should throw error when request fails', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'))

      await expect(followingService.getFollowing()).rejects.toThrow('Network error')
    })
  })
})
