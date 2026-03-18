import { FollowingService } from '@substack-api/internal/services/following-service'
import { HttpClient } from '@substack-api/internal/http-client'

// Mock the http client
jest.mock('@substack-api/internal/http-client')

describe('FollowingService', () => {
  let followingService: FollowingService
  let mockPublicationClient: jest.Mocked<HttpClient>
  let mockSubstackClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockPublicationClient = new HttpClient(
      'https://test.substack.com',
      'test'
    ) as jest.Mocked<HttpClient>
    mockPublicationClient.get = jest.fn()

    mockSubstackClient = new HttpClient('https://substack.com', 'test') as jest.Mocked<HttpClient>
    mockSubstackClient.put = jest.fn()

    followingService = new FollowingService(mockPublicationClient, mockSubstackClient)
  })

  describe('getFollowing', () => {
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
      mockPublicationClient.get.mockResolvedValue(mockSubscriberLists)

      const result = await followingService.getFollowing()

      expect(mockSubstackClient.put).toHaveBeenCalledWith('/user-setting', {
        type: 'last_home_tab',
        value_text: 'inbox'
      })
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        `/user/${mockUserId}/subscriber-lists?lists=following`
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
      mockPublicationClient.get.mockResolvedValue(mockSubscriberLists)

      const result = await followingService.getFollowing()

      expect(result).toEqual([])
    })

    it('should throw error when request fails', async () => {
      const mockUserId = 12345
      const error = new Error('Network error')

      mockSubstackClient.put.mockResolvedValue({ user_id: mockUserId })
      mockPublicationClient.get.mockRejectedValue(error)

      await expect(followingService.getFollowing()).rejects.toThrow('Network error')
    })

    it('should handle authentication errors gracefully', async () => {
      const error = new Error('Unauthorized')
      mockSubstackClient.put.mockRejectedValue(error)

      await expect(followingService.getFollowing()).rejects.toThrow('Unauthorized')
    })
  })
})
