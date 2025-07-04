/**
 * PostService unit tests
 */

import { PostService } from '../../../src/services/post-service'
import { SubstackHttpClient } from '../../../src/http-client'
import { MemoryCache } from '../../../src/services/memory-cache'
import type { ServiceConfig } from '../../../src/services/types'

// Mock the entities
jest.mock('../../../src/entities')

describe('PostService', () => {
  let postService: PostService
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

    postService = new PostService(serviceConfig)
  })

  describe('getPostById', () => {
    it('should fetch a post by ID successfully', async () => {
      const mockRawPost = {
        id: 456,
        title: 'Test Post',
        subtitle: 'Test subtitle',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        description: 'Test description',
        canonical_url: 'https://example.com/test-post',
        type: 'newsletter' as const,
        published: true
      }

      mockHttpClient.get.mockResolvedValue(mockRawPost)

      const result = await postService.getPostById('456')

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/456')
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Fetching post by ID', { id: '456' })
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Post fetched successfully', {
        id: '456',
        title: 'Test Post'
      })
      expect(result).toBeDefined()
    })

    it('should handle error when post not found', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'))

      await expect(postService.getPostById('999')).rejects.toThrow(
        'Post with ID 999 not found: Not found'
      )
      expect(serviceConfig.logger?.error).toHaveBeenCalledWith('Failed to fetch post by ID', {
        id: '999',
        error: 'Not found'
      })
    })
  })

  describe('getPostsForProfile', () => {
    it('should fetch posts for a profile successfully', async () => {
      const mockRawPosts = [
        {
          id: 1,
          title: 'Post 1',
          slug: 'post-1',
          post_date: '2023-01-01T00:00:00Z',
          canonical_url: 'https://example.com/post-1',
          type: 'newsletter' as const
        },
        {
          id: 2,
          title: 'Post 2',
          slug: 'post-2',
          post_date: '2023-01-02T00:00:00Z',
          canonical_url: 'https://example.com/post-2',
          type: 'newsletter' as const
        }
      ]

      mockHttpClient.get.mockResolvedValue({ posts: mockRawPosts })

      const result = await postService.getPostsForProfile(123)

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/profile/posts?profile_user_id=123&limit=25&offset=0'
      )
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Fetching posts for profile', {
        profileUserId: 123,
        options: {}
      })
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Posts fetched successfully', {
        profileUserId: 123,
        count: 2
      })
      expect(result).toHaveLength(2)
      expect(result[0].id).toBe(1)
      expect(result[1].id).toBe(2)
    })

    it('should handle custom limit and offset', async () => {
      mockHttpClient.get.mockResolvedValue({ posts: [] })

      await postService.getPostsForProfile(123, { limit: 10, offset: 5 })

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/profile/posts?profile_user_id=123&limit=10&offset=5'
      )
    })

    it('should respect perPage limit', async () => {
      mockHttpClient.get.mockResolvedValue({ posts: [] })

      await postService.getPostsForProfile(123, { limit: 100 })

      // Should be capped at perPage (25)
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/profile/posts?profile_user_id=123&limit=25&offset=0'
      )
    })

    it('should handle API error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('API Error'))

      await expect(postService.getPostsForProfile(123)).rejects.toThrow(
        'Failed to fetch posts for profile 123: API Error'
      )
      expect(serviceConfig.logger?.error).toHaveBeenCalledWith(
        'Failed to fetch posts for profile',
        {
          profileUserId: 123,
          options: {},
          error: 'API Error'
        }
      )
    })

    it('should handle missing posts in response', async () => {
      mockHttpClient.get.mockResolvedValue({})

      const result = await postService.getPostsForProfile(123)

      expect(result).toHaveLength(0)
    })
  })
})
