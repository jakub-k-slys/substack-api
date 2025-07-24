import { PostService } from '../../src/internal/services/post-service'
import { HttpClient } from '../../src/internal/http-client'
import type { SubstackFullPost, SubstackPost } from '../../src/internal'

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

    it('should throw error when response is missing post data', async () => {
      // Mock response without post data
      mockGlobalHttpClient.get.mockResolvedValueOnce({})

      await expect(postService.getPostById(123)).rejects.toThrow(
        'Invalid response format: missing post data'
      )
      expect(mockGlobalHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/by-id/123')
    })

    it('should transform postTags from objects to strings', async () => {
      const mockPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter',
        body_html: '<p>Test post body content</p>',
        postTags: [{ name: 'tech', id: 1 }, { name: 'newsletter', id: 2 }, 'simple-string-tag']
      }

      mockGlobalHttpClient.get.mockResolvedValueOnce({ post: mockPost })

      const result = await postService.getPostById(123)

      expect(result.postTags).toEqual(['tech', 'newsletter', 'simple-string-tag'])
    })
  })

  describe('getPostsForProfile', () => {
    it('should return posts for a profile', async () => {
      const mockPosts: SubstackPost[] = [
        {
          id: 1,
          title: 'Post 1',
          slug: 'post-1',
          post_date: '2023-01-01T00:00:00Z',
          canonical_url: 'https://example.com/post1',
          type: 'newsletter'
        },
        {
          id: 2,
          title: 'Post 2',
          slug: 'post-2',
          post_date: '2023-01-02T00:00:00Z',
          canonical_url: 'https://example.com/post2',
          type: 'podcast'
        }
      ]

      mockHttpClient.get.mockResolvedValueOnce({ posts: mockPosts })

      const result = await postService.getPostsForProfile(123, { limit: 10, offset: 0 })

      expect(result).toEqual(mockPosts)
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/profile/posts?profile_user_id=123&limit=10&offset=0'
      )
    })

    it('should handle empty posts array', async () => {
      mockHttpClient.get.mockResolvedValueOnce({ posts: [] })

      const result = await postService.getPostsForProfile(456, { limit: 5, offset: 10 })

      expect(result).toEqual([])
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/profile/posts?profile_user_id=456&limit=5&offset=10'
      )
    })

    it('should handle missing posts property in response', async () => {
      mockHttpClient.get.mockResolvedValueOnce({})

      const result = await postService.getPostsForProfile(789, { limit: 20, offset: 5 })

      expect(result).toEqual([])
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/profile/posts?profile_user_id=789&limit=20&offset=5'
      )
    })

    it('should throw error when HTTP client fails', async () => {
      const errorMessage = 'HTTP 500: Internal server error'
      mockHttpClient.get.mockRejectedValueOnce(new Error(errorMessage))

      await expect(postService.getPostsForProfile(123, { limit: 10, offset: 0 })).rejects.toThrow(
        errorMessage
      )
    })

    it('should validate each post in the response', async () => {
      const validPost: SubstackPost = {
        id: 1,
        title: 'Valid Post',
        slug: 'valid-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/valid',
        type: 'newsletter'
      }

      const invalidPost = {
        id: 'invalid-id', // Should be number
        title: 'Invalid Post'
        // Missing required fields
      }

      mockHttpClient.get.mockResolvedValueOnce({ posts: [validPost, invalidPost] })

      await expect(postService.getPostsForProfile(123, { limit: 10, offset: 0 })).rejects.toThrow(
        /Post 1 in profile response/
      )
    })
  })
})
