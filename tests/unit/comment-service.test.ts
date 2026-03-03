import { CommentService } from '@substack-api/internal/services/comment-service'
import { HttpClient } from '@substack-api/internal/http-client'

jest.mock('@substack-api/internal/http-client')

const makeGatewayComment = (id: number, body: string, isAdmin = false) => ({
  id,
  body,
  is_admin: isAdmin
})

describe('CommentService', () => {
  let commentService: CommentService
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = new HttpClient('https://test.com', {
      token: 'dummy-token',
      publicationUrl: 'https://pub.com'
    }) as jest.Mocked<HttpClient>
    mockClient.get = jest.fn()
    commentService = new CommentService(mockClient)
  })

  describe('getCommentsForPost', () => {
    it('should return comments from GET /posts/{id}/comments with { items } response shape', async () => {
      const mockComments = [
        makeGatewayComment(1, 'Test comment 1'),
        makeGatewayComment(2, 'Test comment 2', true)
      ]
      mockClient.get.mockResolvedValue({ items: mockComments })

      const result = await commentService.getCommentsForPost(123)

      expect(mockClient.get).toHaveBeenCalledWith('/posts/123/comments')
      expect(result).toEqual(mockComments)
    })

    it('should return empty array when items is empty', async () => {
      mockClient.get.mockResolvedValue({ items: [] })

      const result = await commentService.getCommentsForPost(123)

      expect(result).toEqual([])
    })

    it('should throw error when request fails', async () => {
      mockClient.get.mockRejectedValue(new Error('Network error'))

      await expect(commentService.getCommentsForPost(123)).rejects.toThrow('Network error')
      expect(mockClient.get).toHaveBeenCalledWith('/posts/123/comments')
    })
  })
})
