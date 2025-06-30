import { SubstackHttpClient } from '../../src/http-client'

// Mock fetch globally
global.fetch = jest.fn()

describe('SubstackHttpClient', () => {
  let client: SubstackHttpClient
  const mockFetch = fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()
    client = new SubstackHttpClient({
      apiKey: 'test-api-key',
      hostname: 'test.substack.com'
    })
  })

  describe('constructor', () => {
    it('should throw error when apiKey is missing', () => {
      expect(() => new SubstackHttpClient({ apiKey: '', hostname: 'test.com' })).toThrow(
        'apiKey is required in SubstackConfig'
      )
    })

    it('should use default hostname when not provided', () => {
      const clientWithoutHostname = new SubstackHttpClient({
        apiKey: 'test-key',
        hostname: 'default.substack.com'
      })
      expect(clientWithoutHostname).toBeDefined()
    })

    it('should set up correct base URL and cookie', () => {
      const clientInstance = client as unknown as { baseUrl: string; cookie: string }
      expect(clientInstance.baseUrl).toBe('https://test.substack.com')
      expect(clientInstance.cookie).toBe('connect.sid=s%3Atest-api-key')
    })
  })

  describe('request', () => {
    it('should make successful request', async () => {
      const mockResponse = { data: 'test' }
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      } as unknown as Response)

      const result = await client.request('/test')

      expect(mockFetch).toHaveBeenCalledWith('https://test.substack.com/test', {
        headers: {
          Cookie: 'connect.sid=s%3Atest-api-key',
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should handle HTTP error responses', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as unknown as Response)

      await expect(client.request('/test')).rejects.toThrow('HTTP 404: Not Found')
    })

    it('should include custom headers', async () => {
      const mockResponse = { data: 'test' }
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      } as unknown as Response)

      await client.request('/test', {
        headers: {
          'Custom-Header': 'custom-value'
        }
      })

      // Verify that fetch was called with the custom header
      expect(mockFetch).toHaveBeenCalledTimes(1)
      const [url, options] = mockFetch.mock.calls[0]
      expect(url).toBe('https://test.substack.com/test')
      expect(options?.headers).toHaveProperty('Custom-Header', 'custom-value')
    })
  })

  describe('get', () => {
    it('should make GET request', async () => {
      const mockResponse = { data: 'test' }
      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      } as unknown as Response)

      const result = await client.get('/test')

      expect(mockFetch).toHaveBeenCalledWith('https://test.substack.com/test', {
        headers: {
          Cookie: 'connect.sid=s%3Atest-api-key',
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('post', () => {
    it('should make POST request with data', async () => {
      const mockResponse = { success: true }
      const postData = { title: 'Test Post' }

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      } as unknown as Response)

      const result = await client.post('/test', postData)

      expect(mockFetch).toHaveBeenCalledWith('https://test.substack.com/test', {
        method: 'POST',
        body: JSON.stringify(postData),
        headers: {
          Cookie: 'connect.sid=s%3Atest-api-key',
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockResponse)
    })

    it('should make POST request without data', async () => {
      const mockResponse = { success: true }

      mockFetch.mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      } as unknown as Response)

      const result = await client.post('/test')

      expect(mockFetch).toHaveBeenCalledWith('https://test.substack.com/test', {
        method: 'POST',
        body: undefined,
        headers: {
          Cookie: 'connect.sid=s%3Atest-api-key',
          'Content-Type': 'application/json'
        }
      })
      expect(result).toEqual(mockResponse)
    })
  })
})
