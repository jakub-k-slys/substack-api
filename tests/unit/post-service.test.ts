import { PostService } from '../../src/services/post-service'
import { SubstackHttpClient } from '../../src/http-client'
import type { SubstackPost } from '../../src/internal'

// Mock the http client
jest.mock('../../src/http-client')

describe('PostService', () => {
  let postService: PostService
  let mockHttpClient: jest.Mocked<SubstackHttpClient>
  let mockGlobalHttpClient: jest.Mocked<SubstackHttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockHttpClient = new SubstackHttpClient('https://test.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<SubstackHttpClient>
    mockHttpClient.get = jest.fn()

    mockGlobalHttpClient = new SubstackHttpClient('https://substack.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<SubstackHttpClient>
    mockGlobalHttpClient.get = jest.fn()

    postService = new PostService(mockHttpClient, mockGlobalHttpClient)
  })

  describe('getPostById', () => {
    it('should return post data from the global HTTP client', async () => {
      const mockPost: SubstackPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter'
      }

      mockGlobalHttpClient.get.mockResolvedValueOnce(mockPost)

      const result = await postService.getPostById(123)

      expect(result).toEqual(mockPost)
      expect(mockGlobalHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/by-id/123')
      expect(mockHttpClient.get).not.toHaveBeenCalled()
    })

    it('should throw error when global HTTP client fails', async () => {
      const errorMessage = 'HTTP 404: Not found'
      mockGlobalHttpClient.get.mockRejectedValueOnce(new Error(errorMessage))

      await expect(postService.getPostById(999)).rejects.toThrow(errorMessage)
      expect(mockGlobalHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/by-id/999')
    })

    it('should use global HTTP client instead of publication-specific client', async () => {
      const mockPost: SubstackPost = {
        id: 456,
        title: 'Another Test Post',
        slug: 'another-test-post',
        post_date: '2023-02-01T00:00:00Z',
        canonical_url: 'https://example.com/another-post',
        type: 'podcast'
      }

      mockGlobalHttpClient.get.mockResolvedValueOnce(mockPost)

      await postService.getPostById(456)

      // Verify that only the global HTTP client is used
      expect(mockGlobalHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/by-id/456')
      expect(mockHttpClient.get).not.toHaveBeenCalled()
    })
  })
})