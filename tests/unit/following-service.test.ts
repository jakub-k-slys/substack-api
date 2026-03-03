import { FollowingService } from '@substack-api/internal/services/following-service'
import { HttpClient } from '@substack-api/internal/http-client'
import { createMockHttpClient } from '@test/unit/fixtures'

jest.mock('@substack-api/internal/http-client')

describe('FollowingService', () => {
  let followingService: FollowingService
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockHttpClient()
    followingService = new FollowingService(mockClient)
  })

  describe('getFollowing', () => {
    it('should return following users from GET /me/following', async () => {
      const mockUsers = [
        { id: 123, handle: 'user123' },
        { id: 456, handle: 'user456' }
      ]
      mockClient.get.mockResolvedValue({ items: mockUsers })

      const result = await followingService.getFollowing()

      expect(mockClient.get).toHaveBeenCalledWith('/me/following')
      expect(result).toEqual(mockUsers)
    })

    it('should return empty array when no one is followed', async () => {
      mockClient.get.mockResolvedValue({ items: [] })
      expect(await followingService.getFollowing()).toEqual([])
    })

    it('should throw when request fails', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'))
      await expect(followingService.getFollowing()).rejects.toThrow('Network error')
    })
  })
})
