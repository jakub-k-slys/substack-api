import { PostService } from '@substack-api/internal/services/post-service'
import { HttpClient } from '@substack-api/internal/http-client'

jest.mock('@substack-api/internal/http-client')

const makeGatewayPost = (id: number, title: string) => ({
  id,
  title,
  published_at: '2023-01-01T00:00:00Z'
})

const makeGatewayFullPost = (id: number, title: string) => ({
  id,
  title,
  slug: `post-${id}`,
  url: `https://example.com/post-${id}`,
  published_at: '2023-01-01T00:00:00Z',
  html_body: '<p>Body content</p>'
})

describe('PostService', () => {
  let postService: PostService
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = new HttpClient('https://test.com', {
      token: 'dummy-token',
      publicationUrl: 'https://pub.com'
    }) as jest.Mocked<HttpClient>
    mockClient.get = jest.fn()
    postService = new PostService(mockClient)
  })

  describe('getPostById', () => {
    it('should return GatewayFullPost directly from GET /posts/{id}', async () => {
      const mockPost = makeGatewayFullPost(123, 'Test Post')
      mockClient.get.mockResolvedValueOnce(mockPost)

      const result = await postService.getPostById(123)

      expect(result).toEqual(mockPost)
      expect(mockClient.get).toHaveBeenCalledWith('/posts/123')
    })

    it('should throw error when request fails', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('HTTP 404: Not found'))

      await expect(postService.getPostById(999)).rejects.toThrow('HTTP 404: Not found')
      expect(mockClient.get).toHaveBeenCalledWith('/posts/999')
    })
  })

  describe('getPostsForProfile', () => {
    it('should return posts from GET /profiles/{slug}/posts using params', async () => {
      const mockPosts = [makeGatewayPost(1, 'Post 1'), makeGatewayPost(2, 'Post 2')]
      // Response shape: { items: [...] }
      mockClient.get.mockResolvedValueOnce({ items: mockPosts })

      const result = await postService.getPostsForProfile('testuser', { limit: 10, offset: 0 })

      expect(result).toEqual(mockPosts)
      expect(mockClient.get).toHaveBeenCalledWith('/profiles/testuser/posts', {
        limit: 10,
        offset: 0
      })
    })

    it('should handle empty posts array', async () => {
      mockClient.get.mockResolvedValueOnce({ items: [] })

      const result = await postService.getPostsForProfile('testuser', { limit: 5, offset: 0 })

      expect(result).toEqual([])
    })

    it('should throw error when request fails', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('HTTP 500: Internal server error'))

      await expect(
        postService.getPostsForProfile('testuser', { limit: 10, offset: 0 })
      ).rejects.toThrow('HTTP 500: Internal server error')
    })
  })
})
