import { FullPost } from '@substack-api/domain'
import { SubstackClient } from '@substack-api/substack-client'
import axios from 'axios'
import type { AxiosInstance } from 'axios'

jest.mock('axios')
jest.mock('axios-rate-limit', () => (instance: AxiosInstance) => instance)

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('SubstackClient - Post Endpoint via Gateway', () => {
  let client: SubstackClient
  let mockAxiosInstance: jest.Mocked<AxiosInstance>

  const gatewayConfig = {
    gatewayUrl: 'http://localhost:5001',
    publicationUrl: 'https://test.substack.com',
    token: 'dummy-token'
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    } as unknown as jest.Mocked<AxiosInstance>

    mockedAxios.create.mockReturnValue(mockAxiosInstance)

    client = new SubstackClient(gatewayConfig)
  })

  describe('postForId', () => {
    it('should fetch post by ID from GET /posts/{id} with no wrapper', async () => {
      const mockPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        url: 'https://example.com/post',
        published_at: '2023-01-01T00:00:00Z',
        html_body: '<p>Test post body</p>'
      }

      mockAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        data: mockPost
      })

      const post = await client.postForId(123)

      expect(post).toBeInstanceOf(FullPost)
      expect(post.title).toBe('Test Post')
      // HTTP client passes { params: undefined } as second arg to axios
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/posts/123', { params: undefined })
    })

    it('should handle 404 errors and wrap in friendly message', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: { status: 404, statusText: 'Not Found' },
        message: 'Request failed with status code 404'
      })

      await expect(client.postForId(999)).rejects.toThrow('Post with ID 999 not found')
    })
  })
})
