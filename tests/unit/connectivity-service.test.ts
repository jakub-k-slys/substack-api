import { ConnectivityService } from '@substack-api/internal/services/connectivity-service'
import { HttpClient } from '@substack-api/internal/http-client'

// Mock the HttpClient
jest.mock('@substack-api/internal/http-client')

describe('ConnectivityService', () => {
  let connectivityService: ConnectivityService
  let mockPublicationClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockPublicationClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockPublicationClient.get = jest.fn()

    connectivityService = new ConnectivityService(mockPublicationClient)
  })

  describe('isConnected', () => {
    it('should return true when API is accessible', async () => {
      // Arrange
      mockPublicationClient.get.mockResolvedValue({})

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(true)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/feed/following')
      expect(mockPublicationClient.get).toHaveBeenCalledTimes(1)
    })

    it('should return false when API request fails with network error', async () => {
      // Arrange
      mockPublicationClient.get.mockRejectedValue(new Error('Network error'))

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(false)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/feed/following')
      expect(mockPublicationClient.get).toHaveBeenCalledTimes(1)
    })

    it('should return false when API request fails with HTTP error', async () => {
      // Arrange
      mockPublicationClient.get.mockRejectedValue(new Error('HTTP 401: Unauthorized'))

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(false)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/feed/following')
      expect(mockPublicationClient.get).toHaveBeenCalledTimes(1)
    })

    it('should return false when API request fails with timeout', async () => {
      // Arrange
      mockPublicationClient.get.mockRejectedValue(new Error('Request timeout'))

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(false)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/feed/following')
      expect(mockPublicationClient.get).toHaveBeenCalledTimes(1)
    })

    it('should handle successful API response with data', async () => {
      // Arrange
      const mockResponse = [123, 456, 789]
      mockPublicationClient.get.mockResolvedValue(mockResponse)

      // Act
      const result = await connectivityService.isConnected()

      // Assert
      expect(result).toBe(true)
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/feed/following')
      expect(mockPublicationClient.get).toHaveBeenCalledTimes(1)
    })
  })
})
