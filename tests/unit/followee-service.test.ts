import { FolloweeService } from '../../src/internal/services/followee-service'
import { HttpClient } from '../../src/internal/http-client'

// Mock the http client
jest.mock('../../src/internal/http-client')

describe('FolloweeService', () => {
  let followeeService: FolloweeService
  let mockHttpClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockHttpClient = new HttpClient('https://test.substack.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()

    followeeService = new FolloweeService(mockHttpClient)
  })

  describe('getFollowees', () => {
    it('should fetch following users successfully', async () => {
      const mockUserIds = [123, 456, 789]
      mockHttpClient.get.mockResolvedValue(mockUserIds)

      const result = await followeeService.getFollowees()

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/feed/following')
      expect(result).toEqual(mockUserIds)
    })

    it('should return empty array when no following users', async () => {
      const mockUserIds: number[] = []
      mockHttpClient.get.mockResolvedValue(mockUserIds)

      const result = await followeeService.getFollowees()

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/feed/following')
      expect(result).toEqual([])
    })

    it('should throw error when request fails', async () => {
      const error = new Error('Network error')
      mockHttpClient.get.mockRejectedValue(error)

      await expect(followeeService.getFollowees()).rejects.toThrow('Network error')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/feed/following')
    })

    it('should handle authentication errors gracefully', async () => {
      const error = new Error('Unauthorized')
      mockHttpClient.get.mockRejectedValue(error)

      await expect(followeeService.getFollowees()).rejects.toThrow('Unauthorized')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/feed/following')
    })
  })
})
