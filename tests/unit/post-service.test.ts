import { PostService } from '../../src/internal/services/post-service'
import { SubstackHttpClient } from '../../src/http-client'
import type { SubstackPost, SubstackComment } from '../../src/internal'

// Mock the http client
jest.mock('../../src/http-client')

describe('PostService', () => {
  let postService: PostService
  let mockGlobalHttpClient: jest.Mocked<SubstackHttpClient>
  let mockHttpClient: jest.Mocked<SubstackHttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockGlobalHttpClient = new SubstackHttpClient('https://substack.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<SubstackHttpClient>
    mockGlobalHttpClient.get = jest.fn()

    mockHttpClient = new SubstackHttpClient('https://test.substack.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<SubstackHttpClient>
    mockHttpClient.get = jest.fn()

    postService = new PostService(mockGlobalHttpClient, mockHttpClient)
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
    })
  })

  describe('getCommentsForPost', () => {
    it('should return comments for a post', async () => {
      const mockComments: SubstackComment[] = [
        {
          id: 1,
          body: 'Great post!',
          user_id: 123,
          post_id: 456,
          date: '2023-01-01T00:00:00Z',
          name: 'John Doe',
          handle: 'johndoe',
          photo_url: 'https://example.com/avatar.jpg',
          ancestor_path: '',
          reply_minimum_role: 'everyone',
          reaction_count: 5,
          reactions: {},
          restacks: 2,
          restacked: false,
          children_count: 0,
          attachments: []
        }
      ]

      mockHttpClient.get.mockResolvedValueOnce({ comments: mockComments })

      const result = await postService.getCommentsForPost(456)

      expect(result).toEqual(mockComments)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/post/456/comments')
    })

    it('should return empty array when no comments', async () => {
      mockHttpClient.get.mockResolvedValueOnce({})

      const result = await postService.getCommentsForPost(456)

      expect(result).toEqual([])
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/post/456/comments')
    })

    it('should throw error when HTTP client fails', async () => {
      const errorMessage = 'HTTP 404: Not found'
      mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage))

      await expect(postService.getCommentsForPost(999)).rejects.toThrow(errorMessage)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/post/999/comments')
    })
  })
})
