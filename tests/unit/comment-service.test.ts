import { CommentService } from '@substack-api/internal/services/comment-service'
import { HttpClient } from '@substack-api/internal/http-client'
import type { SubstackComment, SubstackCommentResponse } from '@substack-api/internal'

// Mock the http client
jest.mock('@substack-api/internal/http-client')

describe('CommentService', () => {
  let commentService: CommentService
  let mockPublicationClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockPublicationClient = new HttpClient(
      'https://test.substack.com',
      'test'
    ) as jest.Mocked<HttpClient>
    mockPublicationClient.get = jest.fn()

    commentService = new CommentService(mockPublicationClient)
  })

  describe('getCommentsForPost', () => {
    it('should fetch comments for a post successfully', async () => {
      const mockComments: SubstackComment[] = [
        {
          id: 1,
          body: 'Test comment 1',
          author_is_admin: false
        },
        {
          id: 2,
          body: 'Test comment 2',
          author_is_admin: true
        }
      ]

      const mockResponse = { comments: mockComments }
      mockPublicationClient.get.mockResolvedValue(mockResponse)

      const result = await commentService.getCommentsForPost(123)

      expect(mockPublicationClient.get).toHaveBeenCalledWith('/post/123/comments')
      expect(result).toEqual(mockComments)
    })

    it('should return empty array when no comments exist', async () => {
      const mockResponse = { comments: undefined }
      mockPublicationClient.get.mockResolvedValue(mockResponse)

      const result = await commentService.getCommentsForPost(123)

      expect(mockPublicationClient.get).toHaveBeenCalledWith('/post/123/comments')
      expect(result).toEqual([])
    })

    it('should return empty array when comments field is null', async () => {
      const mockResponse = { comments: null }
      mockPublicationClient.get.mockResolvedValue(mockResponse)

      const result = await commentService.getCommentsForPost(123)

      expect(mockPublicationClient.get).toHaveBeenCalledWith('/post/123/comments')
      expect(result).toEqual([])
    })

    it('should throw error when request fails', async () => {
      const error = new Error('Network error')
      mockPublicationClient.get.mockRejectedValue(error)

      await expect(commentService.getCommentsForPost(123)).rejects.toThrow('Network error')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/post/123/comments')
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

      mockPublicationClient.get.mockResolvedValue(mockCommentResponse)

      const result = await commentService.getCommentById(123)

      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/comment/123')
      expect(result).toEqual({
        id: 123,
        body: 'Test comment body',
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

      mockPublicationClient.get.mockResolvedValue(mockCommentResponse)

      const result = await commentService.getCommentById(123)

      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/comment/123')
      expect(result.id).toBe(123)
      expect(result.body).toBe('Test comment body')
      expect(result.author_is_admin).toBe(false)
    })

    it('should throw error when comment is not found', async () => {
      const error = new Error('Comment not found')
      mockPublicationClient.get.mockRejectedValue(error)

      await expect(commentService.getCommentById(123)).rejects.toThrow('Comment not found')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/comment/123')
    })
  })
})
