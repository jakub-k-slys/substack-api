import { PostService } from '../../src/internal/services/post-service'
import { HttpClient } from '../../src/internal/http-client'
import type { SubstackFullPost } from '../../src/internal'

// Mock the http client
jest.mock('../../src/internal/http-client')

describe('PostService', () => {
  let postService: PostService
  let mockGlobalHttpClient: jest.Mocked<HttpClient>
  let mockHttpClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockGlobalHttpClient = new HttpClient('https://substack.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<HttpClient>
    mockGlobalHttpClient.get = jest.fn()

    mockHttpClient = new HttpClient('https://test.substack.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()

    postService = new PostService(mockGlobalHttpClient, mockHttpClient)
  })

  describe('getPostById', () => {
    it('should return post data from the global HTTP client', async () => {
      const mockPost: SubstackFullPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter',
        body_html: '<p>Test post body content</p>'
      }

      mockGlobalHttpClient.get.mockResolvedValueOnce({ post: mockPost })

      const result = await postService.getPostById(123)

      expect(result).toEqual(mockPost)
      expect(mockGlobalHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/by-id/123')
    })

    it('should throw error when global HTTP client fails', async () => {
      const errorMessage = 'HTTP 404: Not found'
      mockGlobalHttpClient.get.mockRejectedValueOnce(new Error(errorMessage))

      await expect(postService.getPostById(999)).rejects.toThrow(errorMessage)
      expect(mockGlobalHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/by-id/999')
    })

    it('should use global HTTP client instead of publication-specific client', async () => {
      const mockPost: SubstackFullPost = {
        id: 456,
        title: 'Another Test Post',
        slug: 'another-test-post',
        post_date: '2023-02-01T00:00:00Z',
        canonical_url: 'https://example.com/another-post',
        type: 'podcast',
        body_html: '<p>Another test post body content</p>'
      }

      mockGlobalHttpClient.get.mockResolvedValueOnce({ post: mockPost })

      await postService.getPostById(456)

      // Verify that only the global HTTP client is used
      expect(mockGlobalHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/by-id/456')
    })
  })
})
