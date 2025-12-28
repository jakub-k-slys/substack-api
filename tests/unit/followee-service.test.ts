import { FolloweeService } from '../../src/internal/services/followee-service'
import { HttpClient } from '../../src/internal/http-client'

// Mock the http client
jest.mock('../../src/internal/http-client')

describe('FolloweeService', () => {
  let followeeService: FolloweeService
  let mockHttpClient: jest.Mocked<HttpClient>
  let mockSubstackClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockHttpClient = new HttpClient('https://test.substack.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()

    mockSubstackClient = new HttpClient('https://substack.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<HttpClient>
    mockSubstackClient.put = jest.fn()

    followeeService = new FolloweeService(mockHttpClient, mockSubstackClient)
  })

  describe('getFollowees', () => {
    it('should fetch following users successfully', async () => {
      const mockUserId = 12345
      const mockSubscriberLists = {
        subscriberLists: [
          {
            id: 'following-list',
            name: 'Following',
            groups: [
              {
                users: [
                  { id: 123, handle: 'user123' },
                  { id: 456, handle: 'user456' },
                  { id: 789, handle: 'user789' }
                ]
              }
            ]
          }
        ]
      }

      mockSubstackClient.put.mockResolvedValue({ user_id: mockUserId })
      mockHttpClient.get.mockResolvedValue(mockSubscriberLists)

      const result = await followeeService.getFollowees()

      expect(mockSubstackClient.put).toHaveBeenCalledWith('/api/v1/user-setting', {
        type: 'last_home_tab',
        value_text: 'inbox'
      })
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        `/api/v1/user/${mockUserId}/subscriber-lists?lists=following`
      )
      expect(result).toEqual([
        { id: 123, handle: 'user123' },
        { id: 456, handle: 'user456' },
        { id: 789, handle: 'user789' }
      ])
    })

    it('should return empty array when no following users', async () => {
      const mockUserId = 12345
      const mockSubscriberLists = {
        subscriberLists: [
          {
            id: 'following-list',
            name: 'Following',
            groups: [
              {
                users: []
              }
            ]
          }
        ]
      }

      mockSubstackClient.put.mockResolvedValue({ user_id: mockUserId })
      mockHttpClient.get.mockResolvedValue(mockSubscriberLists)

      const result = await followeeService.getFollowees()

      expect(result).toEqual([])
    })

    it('should throw error when request fails', async () => {
      const mockUserId = 12345
      const error = new Error('Network error')

      mockSubstackClient.put.mockResolvedValue({ user_id: mockUserId })
      mockHttpClient.get.mockRejectedValue(error)

      await expect(followeeService.getFollowees()).rejects.toThrow('Network error')
    })

    it('should handle authentication errors gracefully', async () => {
      const error = new Error('Unauthorized')
      mockSubstackClient.put.mockRejectedValue(error)

      await expect(followeeService.getFollowees()).rejects.toThrow('Unauthorized')
    })
  })
})
