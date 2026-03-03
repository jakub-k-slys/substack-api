import { ConnectivityService } from '@substack-api/internal/services/connectivity-service'
import { HttpClient } from '@substack-api/internal/http-client'
import { createMockHttpClient } from '@test/unit/fixtures'

jest.mock('@substack-api/internal/http-client')

describe('ConnectivityService', () => {
  let connectivityService: ConnectivityService
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockHttpClient()
    connectivityService = new ConnectivityService(mockClient)
  })

  describe('isConnected', () => {
    it('should return true when GET /health/ready succeeds', async () => {
      mockClient.get.mockResolvedValue({})

      const result = await connectivityService.isConnected()

      expect(result).toBe(true)
      expect(mockClient.get).toHaveBeenCalledWith('/health/ready')
    })

    it('should return false when request fails', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'))
      expect(await connectivityService.isConnected()).toBe(false)
    })
  })
})
