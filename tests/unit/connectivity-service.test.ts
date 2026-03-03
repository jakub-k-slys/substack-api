import { ConnectivityService } from '@substack-api/internal/services/connectivity-service'
import { HttpClient } from '@substack-api/internal/http-client'

jest.mock('@substack-api/internal/http-client')

describe('ConnectivityService', () => {
  let connectivityService: ConnectivityService
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = new HttpClient('https://test.com', {
      token: 'dummy-token',
      publicationUrl: 'https://pub.com'
    }) as jest.Mocked<HttpClient>
    mockClient.get = jest.fn()
    connectivityService = new ConnectivityService(mockClient)
  })

  describe('isConnected', () => {
    it('should return true when GET /health/ready succeeds', async () => {
      mockClient.get.mockResolvedValue({})

      const result = await connectivityService.isConnected()

      expect(result).toBe(true)
      expect(mockClient.get).toHaveBeenCalledWith('/health/ready')
      expect(mockClient.get).toHaveBeenCalledTimes(1)
    })

    it('should return false when request fails with network error', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'))

      const result = await connectivityService.isConnected()

      expect(result).toBe(false)
      expect(mockClient.get).toHaveBeenCalledWith('/health/ready')
    })

    it('should return false when request fails with HTTP error', async () => {
      mockClient.get.mockRejectedValue(new Error('HTTP 401: Unauthorized'))

      const result = await connectivityService.isConnected()

      expect(result).toBe(false)
    })

    it('should return false when request times out', async () => {
      mockClient.get.mockRejectedValue(new Error('Request timeout'))

      const result = await connectivityService.isConnected()

      expect(result).toBe(false)
    })
  })
})
