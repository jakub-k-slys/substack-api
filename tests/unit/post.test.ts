import { Post } from '../../src/entities/post'
import { Comment } from '../../src/entities/comment'
import type { SubstackHttpClient } from '../../src/http-client'

describe('Post Entity', () => {
  let mockHttpClient: jest.Mocked<SubstackHttpClient>
  let post: Post

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn()
    } as unknown as jest.Mocked<SubstackHttpClient>

    const mockPostData = {
      id: 456,
      title: 'Test Post',
      slug: 'test-post',
      post_date: '2023-01-01T00:00:00Z',
      canonical_url: 'https://example.com/post',
      type: 'newsletter' as const,
      subtitle: 'Test subtitle',
      description: 'Test description',
      publishedAt: '2023-01-01T00:00:00Z',
      audience: 'everyone' as const,
      write_comment_permissions: 'everyone' as const,
      should_send_email: true,
      draft: false,
      likes: 10,
      comments: 5,
      restacks: 2,
      cover_image: 'https://example.com/cover.jpg',
      podcast_url: '',
      videoUpload: null,
      podcastUpload: null,
      postTags: [],
      pin_comment: false,
      free_unlock: false,
      default_comment_sort: 'best_first' as const,
      reactions: {
        '❤️': 5,
        '👍': 3,
        '👎': 1
      },
      section_id: null,
      hasCashtag: false,
      body: 'Test post content',
      voiceover_id: null,
      theme: { background_pop: 'blue' }
    }

    post = new Post(mockPostData, mockHttpClient)
  })

  describe('comments()', () => {
    it('should iterate through post comments', async () => {
      const mockResponse = {
        comments: [
          {
            id: 1,
            body: 'Comment 1',
            created_at: '2023-01-01T00:00:00Z',
            parent_post_id: 456,
            author: { id: 123, name: 'User 1' }
          },
          {
            id: 2,
            body: 'Comment 2',
            created_at: '2023-01-02T00:00:00Z',
            parent_post_id: 456,
            author: { id: 124, name: 'User 2' }
          }
        ]
      }
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const comments = []
      for await (const comment of post.comments({ limit: 2 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(2)
      expect(comments[0]).toBeInstanceOf(Comment)
      expect(comments[0].body).toBe('Comment 1')
      expect(comments[1].body).toBe('Comment 2')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/post/456/comments')
    })

    it('should handle limit parameter', async () => {
      const mockResponse = {
        comments: [
          {
            id: 1,
            body: 'Comment 1',
            created_at: '2023-01-01T00:00:00Z',
            parent_post_id: 456,
            author: { id: 123, name: 'User 1' }
          },
          {
            id: 2,
            body: 'Comment 2',
            created_at: '2023-01-02T00:00:00Z',
            parent_post_id: 456,
            author: { id: 124, name: 'User 2' }
          }
        ]
      }
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const comments = []
      for await (const comment of post.comments({ limit: 1 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(1)
      expect(comments[0].body).toBe('Comment 1')
    })

    it('should handle empty comments response', async () => {
      const mockResponse = { comments: [] }
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const comments = []
      for await (const comment of post.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(0)
    })

    it('should handle missing comments property', async () => {
      const mockResponse = {}
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const comments = []
      for await (const comment of post.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(0)
    })

    it('should throw error when API fails', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('API error'))

      const comments = []
      await expect(async () => {
        for await (const comment of post.comments()) {
          comments.push(comment)
        }
      }).rejects.toThrow('Failed to get comments for post 456: API error')
    })
  })

  describe('like()', () => {
    it('should throw error for unimplemented like functionality', async () => {
      await expect(post.like()).rejects.toThrow(
        'Post liking not implemented yet - requires like API'
      )
    })
  })

  describe('addComment()', () => {
    it('should throw error for unimplemented comment functionality', async () => {
      await expect(post.addComment({ body: 'Test comment' })).rejects.toThrow(
        'Comment creation not implemented yet - requires comment creation API'
      )
    })
  })

  describe('properties', () => {
    it('should have correct property values', () => {
      expect(post.id).toBe(456)
      expect(post.title).toBe('Test Post')
      expect(post.likesCount).toBe(0) // Currently hardcoded to 0
      expect(post.publishedAt).toBeInstanceOf(Date)
    })
  })
})
