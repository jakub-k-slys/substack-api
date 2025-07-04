/**
 * CommentService unit tests
 */

import { CommentService } from '../../../src/services/comment-service'
import { SubstackHttpClient } from '../../../src/http-client'
import { MemoryCache } from '../../../src/services/memory-cache'
import type { ServiceConfig } from '../../../src/services/types'

// Mock the entities
jest.mock('../../../src/entities')

describe('CommentService', () => {
  let commentService: CommentService
  let mockHttpClient: jest.Mocked<SubstackHttpClient>
  let mockCache: jest.Mocked<MemoryCache>
  let serviceConfig: ServiceConfig

  beforeEach(() => {
    jest.clearAllMocks()

    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    } as unknown as jest.Mocked<SubstackHttpClient>

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      size: jest.fn()
    } as unknown as jest.Mocked<MemoryCache>

    serviceConfig = {
      httpClient: mockHttpClient,
      cache: mockCache,
      logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      }
    }

    commentService = new CommentService(serviceConfig)
  })

  describe('getCommentById', () => {
    it('should fetch a comment by ID successfully', async () => {
      const mockResponse = {
        item: {
          comment: {
            id: 999,
            body: 'Test comment',
            user_id: 123,
            name: 'Test User',
            date: '2023-01-01T00:00:00Z',
            post_id: 456
          }
        }
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await commentService.getCommentById('999')

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/comment/999')
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Fetching comment by ID', {
        id: '999'
      })
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Comment fetched successfully', {
        id: '999',
        authorName: 'Test User'
      })
      expect(result).toBeDefined()
    })

    it('should throw error for invalid comment ID', async () => {
      await expect(commentService.getCommentById('abc')).rejects.toThrow(
        'Invalid comment ID - must be numeric'
      )
      await expect(commentService.getCommentById('123abc')).rejects.toThrow(
        'Invalid comment ID - must be numeric'
      )
    })

    it('should handle error when comment not found', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'))

      await expect(commentService.getCommentById('999')).rejects.toThrow(
        'Comment with ID 999 not found: Not found'
      )
      expect(serviceConfig.logger?.error).toHaveBeenCalledWith('Failed to fetch comment by ID', {
        id: '999',
        error: 'Not found'
      })
    })

    it('should handle missing post_id in response', async () => {
      const mockResponse = {
        item: {
          comment: {
            id: 999,
            body: 'Test comment',
            user_id: 123,
            name: 'Test User',
            date: '2023-01-01T00:00:00Z'
            // No post_id
          }
        }
      }

      mockHttpClient.get.mockResolvedValue(mockResponse)

      const result = await commentService.getCommentById('999')
      expect(result).toBeDefined()
    })
  })

  describe('getCommentsForPost', () => {
    it('should fetch comments for a post successfully', async () => {
      const mockRawComments = [
        {
          id: 1,
          body: 'Comment 1',
          created_at: '2023-01-01T00:00:00Z',
          parent_post_id: 456,
          author: {
            id: 123,
            name: 'User 1',
            is_admin: false
          }
        },
        {
          id: 2,
          body: 'Comment 2',
          created_at: '2023-01-02T00:00:00Z',
          parent_post_id: 456,
          author: {
            id: 124,
            name: 'User 2',
            is_admin: true
          }
        }
      ]

      mockHttpClient.get.mockResolvedValue({ comments: mockRawComments })

      const result = await commentService.getCommentsForPost(456)

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/post/456/comments')
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Fetching comments for post', {
        postId: 456,
        options: {}
      })
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Comments fetched successfully', {
        postId: 456,
        count: 2
      })
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(2)
    })

    it('should handle custom limit', async () => {
      const mockRawComments = [
        {
          id: 1,
          body: 'Comment 1',
          created_at: '2023-01-01T00:00:00Z',
          parent_post_id: 456,
          author: { id: 123, name: 'User 1', is_admin: false }
        },
        {
          id: 2,
          body: 'Comment 2',
          created_at: '2023-01-02T00:00:00Z',
          parent_post_id: 456,
          author: { id: 124, name: 'User 2', is_admin: false }
        },
        {
          id: 3,
          body: 'Comment 3',
          created_at: '2023-01-03T00:00:00Z',
          parent_post_id: 456,
          author: { id: 125, name: 'User 3', is_admin: false }
        }
      ]

      mockHttpClient.get.mockResolvedValue({ comments: mockRawComments })

      const result = await commentService.getCommentsForPost(456, { limit: 2 })

      expect(result).toHaveLength(2) // Limited to 2
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(2)
    })

    it('should handle API error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('API Error'))

      await expect(commentService.getCommentsForPost(456)).rejects.toThrow(
        'Failed to fetch comments for post 456: API Error'
      )
      expect(serviceConfig.logger?.error).toHaveBeenCalledWith(
        'Failed to fetch comments for post',
        {
          postId: 456,
          options: {},
          error: 'API Error'
        }
      )
    })

    it('should handle missing comments in response', async () => {
      mockHttpClient.get.mockResolvedValue({})

      const result = await commentService.getCommentsForPost(456)

      expect(result).toHaveLength(0)
    })
  })
})
