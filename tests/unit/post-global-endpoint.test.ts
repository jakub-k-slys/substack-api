import { FullPost } from '@substack-api/domain'
import { SubstackClient } from '@substack-api/substack-client'
import axios from 'axios'
import type { AxiosInstance } from 'axios'

jest.mock('axios')
jest.mock('axios-rate-limit', () => (instance: AxiosInstance) => instance)

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('SubstackClient - Global Post Endpoint', () => {
  let client: SubstackClient
  let mockAxiosInstance: jest.Mocked<AxiosInstance>

  beforeEach(() => {
    jest.clearAllMocks()

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    } as unknown as jest.Mocked<AxiosInstance>

    mockedAxios.create.mockReturnValue(mockAxiosInstance)

    // Configure client with a publication-specific hostname
    client = new SubstackClient({
      token: 'test-api-key',
      publicationUrl: 'https://someuser.substack.com' // Publication-specific hostname
    })
  })

  describe('postForId', () => {
    it('should fetch post by ID successfully', async () => {
      const mockPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter' as const,
        body_html: '<p>Test post body content</p>'
      }

      // Mock successful response from substackClient (global endpoint)
      mockAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        data: { post: mockPost }
      })

      const post = await client.postForId(123)

      expect(post).toBeInstanceOf(FullPost)
      expect(post.title).toBe('Test Post')
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/posts/by-id/123')
    })

    it('should work with different publication hostnames', async () => {
      // Test with another publication-specific hostname
      const anotherClient = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'https://anotherpub.substack.com'
      })

      const mockPost = {
        id: 456,
        title: 'Another Test Post',
        slug: 'another-test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter' as const,
        body_html: '<p>Another test post body content</p>'
      }

      mockAxiosInstance.get.mockResolvedValueOnce({
        status: 200,
        data: { post: mockPost }
      })

      const post = await anotherClient.postForId(456)

      expect(post).toBeInstanceOf(FullPost)
      expect(post.title).toBe('Another Test Post')
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/posts/by-id/456')
    })

    it('should handle errors from endpoint properly', async () => {
      mockAxiosInstance.get.mockRejectedValueOnce({
        response: {
          status: 404,
          statusText: 'Not Found'
        },
        message: 'Request failed with status code 404'
      })

      await expect(client.postForId(999999999)).rejects.toThrow('Post with ID 999999999 not found')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/posts/by-id/999999999')
    })
  })
})
