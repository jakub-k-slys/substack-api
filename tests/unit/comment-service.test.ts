import { CommentService } from '../../src/internal/services/comment-service'
import { HttpClient } from '../../src/internal/http-client'
import type { SubstackComment, SubstackCommentResponse } from '../../src/internal'

// Mock the http client
jest.mock('../../src/internal/http-client')

describe('CommentService', () => {
  let commentService: CommentService
  let mockHttpClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockHttpClient = new HttpClient('https://test.substack.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()

    commentService = new CommentService(mockHttpClient)
  })

  describe('getCommentsForPost', () => {
    it('should fetch comments for a post successfully', async () => {
      const mockComments: SubstackComment[] = [
        {
          id: 1,
          body: 'Test comment 1',
          created_at: '2023-01-01T00:00:00Z',
          parent_post_id: 123,
          author_id: 456,
          author_name: 'Test Author',
          author_is_admin: false
        },
        {
          id: 2,
          body: 'Test comment 2',
          created_at: '2023-01-02T00:00:00Z',
          parent_post_id: 123,
          author_id: 789,
          author_name: 'Another Author',
          author_is_admin: true
        }
      ]

      const mockResponse = { comments: mockComments }
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await commentService.getCommentsForPost(123)

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/post/123/comments')
      expect(result).toEqual(mockComments)
    })

    it('should return empty array when no comments exist', async () => {
      const mockResponse = { comments: undefined }
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await commentService.getCommentsForPost(123)

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/post/123/comments')
      expect(result).toEqual([])
    })

    it('should return empty array when comments field is null', async () => {
      const mockResponse = { comments: null }
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await commentService.getCommentsForPost(123)

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/post/123/comments')
      expect(result).toEqual([])
    })

    it('should throw error when request fails', async () => {
      const error = new Error('Network error')
      mockHttpClient.get.mockRejectedValue(error)

      await expect(commentService.getCommentsForPost(123)).rejects.toThrow('Network error')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/post/123/comments')
    })
  })

  describe('getCommentById', () => {
    it('should fetch a comment by ID successfully', async () => {
      const mockCommentResponse: SubstackCommentResponse = {
        item: {
          comment: {
            id: 123,
            body: 'Test comment body',
            user_id: 456,
            name: 'Test Author',
            date: '2023-01-01T00:00:00Z',
            post_id: 789
          }
        }
      }

      mockHttpClient.get.mockResolvedValue(mockCommentResponse)

      const result = await commentService.getCommentById(123)

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/comment/123')
      expect(result).toEqual({
        id: 123,
        body: 'Test comment body',
        created_at: '2023-01-01T00:00:00Z',
        parent_post_id: 789,
        author_id: 456,
        author_name: 'Test Author',
        author_is_admin: false
      })
    })

    it('should handle comment with null post_id', async () => {
      const mockCommentResponse: SubstackCommentResponse = {
        item: {
          comment: {
            id: 123,
            body: 'Test comment body',
            user_id: 456,
            name: 'Test Author',
            date: '2023-01-01T00:00:00Z',
            post_id: null
          }
        }
      }

      mockHttpClient.get.mockResolvedValue(mockCommentResponse)

      const result = await commentService.getCommentById(123)

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/comment/123')
      expect(result.parent_post_id).toBe(0)
    })

    it('should throw error when comment is not found', async () => {
      const error = new Error('Comment not found')
      mockHttpClient.get.mockRejectedValue(error)

      await expect(commentService.getCommentById(123)).rejects.toThrow('Comment not found')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/comment/123')
    })
  })
})
