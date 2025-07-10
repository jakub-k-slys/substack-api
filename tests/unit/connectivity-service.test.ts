import { ConnectivityService } from '../../src/internal/services/connectivity-service'
import { HttpClient } from '../../src/internal/http-client'

// Mock the HttpClient
jest.mock('../../src/internal/http-client')

describe('ConnectivityService', () => {
  let connectivityService: ConnectivityService
  let mockHttpClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockHttpClient = new HttpClient('https://test.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()

    connectivityService = new ConnectivityService(mockHttpClient)
  })

  describe('isConnected', () => {
    it('should return true when API is accessible', async () => {
      // Arrange
      mockHttpClient.get.mockResolvedValue({})

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(true)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/feed/following')
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1)
    })

    it('should return false when API request fails with network error', async () => {
      // Arrange
      mockHttpClient.get.mockRejectedValue(new Error('Network error'))

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(false)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/feed/following')
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1)
    })

    it('should return false when API request fails with HTTP error', async () => {
      // Arrange
      mockHttpClient.get.mockRejectedValue(new Error('HTTP 401: Unauthorized'))

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(false)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/feed/following')
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1)
    })

    it('should return false when API request fails with timeout', async () => {
      // Arrange
      mockHttpClient.get.mockRejectedValue(new Error('Request timeout'))

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(false)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/feed/following')
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1)
    })

    it('should handle successful API response with data', async () => {
      // Arrange
      const mockResponse = [123, 456, 789]
      mockHttpClient.get.mockResolvedValue(mockResponse)

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(true)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/feed/following')
      expect(mockHttpClient.get).toHaveBeenCalledTimes(1)
    })
  })
})
