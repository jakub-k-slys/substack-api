import { ConnectivityService } from '@substack-api/internal/services/connectivity-service'
import { HttpClient } from '@substack-api/internal/http-client'

// Mock the HttpClient
jest.mock('@substack-api/internal/http-client')

describe('ConnectivityService', () => {
  let connectivityService: ConnectivityService
  let mockSubstackClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockSubstackClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockSubstackClient.put = jest.fn()

    connectivityService = new ConnectivityService(mockSubstackClient)
  })

  describe('isConnected', () => {
    it('should return true when API is accessible', async () => {
      // Arrange
      mockSubstackClient.put.mockResolvedValue({})

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(true)
      expect(mockSubstackClient.put).toHaveBeenCalledWith('/user-setting', {
        type: 'last_home_tab',
        value_text: 'inbox'
      })
      expect(mockSubstackClient.put).toHaveBeenCalledTimes(1)
    })

    it('should return false when API request fails with network error', async () => {
      // Arrange
      mockSubstackClient.put.mockRejectedValue(new Error('Network error'))

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(false)
      expect(mockSubstackClient.put).toHaveBeenCalledWith('/user-setting', {
        type: 'last_home_tab',
        value_text: 'inbox'
      })
      expect(mockSubstackClient.put).toHaveBeenCalledTimes(1)
    })

    it('should return false when API request fails with HTTP error', async () => {
      // Arrange
      mockSubstackClient.put.mockRejectedValue(new Error('HTTP 401: Unauthorized'))

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(false)
      expect(mockSubstackClient.put).toHaveBeenCalledWith('/user-setting', {
        type: 'last_home_tab',
        value_text: 'inbox'
      })
      expect(mockSubstackClient.put).toHaveBeenCalledTimes(1)
    })

    it('should return false when API request fails with timeout', async () => {
      // Arrange
      mockSubstackClient.put.mockRejectedValue(new Error('Request timeout'))

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(false)
      expect(mockSubstackClient.put).toHaveBeenCalledWith('/user-setting', {
        type: 'last_home_tab',
        value_text: 'inbox'
      })
      expect(mockSubstackClient.put).toHaveBeenCalledTimes(1)
    })

    it('should handle successful API response with data', async () => {
      // Arrange
      const mockResponse = { success: true }
      mockSubstackClient.put.mockResolvedValue(mockResponse)

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(true)
      expect(mockSubstackClient.put).toHaveBeenCalledWith('/user-setting', {
        type: 'last_home_tab',
        value_text: 'inbox'
      })
      expect(mockSubstackClient.put).toHaveBeenCalledTimes(1)
    })
  })
})
