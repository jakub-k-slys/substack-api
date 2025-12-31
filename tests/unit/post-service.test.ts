import { PostService } from '@substack-api/internal/services/post-service'
import { HttpClient } from '@substack-api/internal/http-client'
import type { SubstackFullPost, SubstackPreviewPost } from '@substack-api/internal'

// Mock the http client
jest.mock('@substack-api/internal/http-client')

describe('PostService', () => {
  let postService: PostService
  let mockSubstackClient: jest.Mocked<HttpClient>
  let mockPublicationClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockSubstackClient = new HttpClient('https://substack.com', 'test') as jest.Mocked<HttpClient>
    mockSubstackClient.get = jest.fn()

    mockPublicationClient = new HttpClient(
      'https://test.substack.com',
      'test'
    ) as jest.Mocked<HttpClient>
    mockPublicationClient.get = jest.fn()

    postService = new PostService(mockSubstackClient)
  })

  describe('getPostById', () => {
    it('should return post data from the global HTTP client', async () => {
      const mockPost: SubstackFullPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        body_html: '<p>Test post body content</p>'
      }

      mockSubstackClient.get.mockResolvedValueOnce({ post: mockPost })

      const result = await postService.getPostById(123)

      expect(result).toEqual(mockPost)
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/posts/by-id/123')
    })

    it('should throw error when global HTTP client fails', async () => {
      const errorMessage = 'HTTP 404: Not found'
      mockSubstackClient.get.mockRejectedValueOnce(new Error(errorMessage))

      await expect(postService.getPostById(999)).rejects.toThrow(errorMessage)
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/posts/by-id/999')
    })

    it('should use global HTTP client instead of publication-specific client', async () => {
      const mockPost: SubstackFullPost = {
        id: 456,
        title: 'Another Test Post',
        slug: 'another-test-post',
        post_date: '2023-02-01T00:00:00Z',
        body_html: '<p>Another test post body content</p>'
      }

      mockSubstackClient.get.mockResolvedValueOnce({ post: mockPost })

      await postService.getPostById(456)

      // Verify that only the global HTTP client is used
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/posts/by-id/456')
    })

    it('should throw error when response is missing post data', async () => {
      // Mock response without post data
      mockSubstackClient.get.mockResolvedValueOnce({})

      await expect(postService.getPostById(123)).rejects.toThrow(
        'Invalid response format: missing post data'
      )
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/posts/by-id/123')
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

      mockSubstackClient.get.mockResolvedValueOnce({ post: mockPost })

      const result = await postService.getPostById(123)

      expect(result.postTags).toEqual(['tech', 'newsletter', 'simple-string-tag'])
    })
  })

  describe('getPostsForProfile', () => {
    it('should return posts for a profile', async () => {
      const mockPosts: SubstackPreviewPost[] = [
        {
          id: 1,
          title: 'Post 1',
          post_date: '2023-01-01T00:00:00Z'
        },
        {
          id: 2,
          title: 'Post 2',
          post_date: '2023-01-02T00:00:00Z'
        }
      ]

      mockSubstackClient.get.mockResolvedValueOnce({ posts: mockPosts })

      const result = await postService.getPostsForProfile(123, { limit: 10, offset: 0 })

      expect(result).toEqual(mockPosts)
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/profile/posts?profile_user_id=123')
    })

    it('should handle empty posts array', async () => {
      mockSubstackClient.get.mockResolvedValueOnce({ posts: [] })

      const result = await postService.getPostsForProfile(456, { limit: 5, offset: 10 })

      expect(result).toEqual([])
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/profile/posts?profile_user_id=456')
    })

    it('should handle missing posts property in response', async () => {
      mockSubstackClient.get.mockResolvedValueOnce({})

      const result = await postService.getPostsForProfile(789, { limit: 20, offset: 5 })

      expect(result).toEqual([])
      expect(mockSubstackClient.get).toHaveBeenCalledWith('/profile/posts?profile_user_id=789')
    })

    it('should throw error when HTTP client fails', async () => {
      const errorMessage = 'HTTP 500: Internal server error'
      mockSubstackClient.get.mockRejectedValueOnce(new Error(errorMessage))

      await expect(postService.getPostsForProfile(123, { limit: 10, offset: 0 })).rejects.toThrow(
        errorMessage
      )
    })

    it('should validate each post in the response', async () => {
      const validPost: SubstackPreviewPost = {
        id: 1,
        title: 'Valid Post',
        post_date: '2023-01-01T00:00:00Z'
      }

      const invalidPost = {
        id: 'invalid-id', // Should be number
        title: 'Invalid Post'
        // Missing required fields
      }

      mockSubstackClient.get.mockResolvedValueOnce({ posts: [validPost, invalidPost] })

      await expect(postService.getPostsForProfile(123, { limit: 10, offset: 0 })).rejects.toThrow(
        /Post 1 in profile response/
      )
    })
  })
})
