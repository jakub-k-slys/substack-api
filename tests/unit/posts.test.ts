import { FullPost, PreviewPost } from '@substack-api/domain/post'
import { Comment } from '@substack-api/domain/comment'
import { HttpClient } from '@substack-api/internal/http-client'
import { CommentService } from '@substack-api/internal/services/comment-service'
import { PostService } from '@substack-api/internal/services/post-service'
import {
  createMockHttpClient,
  makeGatewayPost,
  makeGatewayFullPost,
  makeGatewayComment
} from '@test/unit/fixtures'

jest.mock('@substack-api/internal/http-client')

// ---------------------------------------------------------------------------
// PreviewPost entity
// ---------------------------------------------------------------------------

describe('PreviewPost Entity', () => {
  let mockCommentService: jest.Mocked<CommentService>
  let mockPostService: jest.Mocked<PostService>
  let post: PreviewPost

  beforeEach(() => {
    mockCommentService = { getCommentsForPost: jest.fn() } as unknown as jest.Mocked<CommentService>
    mockPostService = {
      getPostById: jest.fn(),
      getPostsForProfile: jest.fn()
    } as unknown as jest.Mocked<PostService>

    post = new PreviewPost(makeGatewayPost(456, 'Test Post'), mockCommentService, mockPostService)
  })

  describe('properties', () => {
    it('should expose id, title, and publishedAt', () => {
      expect(post.id).toBe(456)
      expect(post.title).toBe('Test Post')
      expect(post.publishedAt).toBeInstanceOf(Date)
    })
  })

  describe('comments()', () => {
    it('should iterate through post comments as Comment instances', async () => {
      const mockComments = [makeGatewayComment(1, 'Comment 1'), makeGatewayComment(2, 'Comment 2')]
      mockCommentService.getCommentsForPost.mockResolvedValue(mockComments)

      const comments = []
      for await (const comment of post.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(2)
      expect(comments[0]).toBeInstanceOf(Comment)
      expect(comments[0].body).toBe('Comment 1')
      expect(comments[1].body).toBe('Comment 2')
      expect(mockCommentService.getCommentsForPost).toHaveBeenCalledWith(456)
    })

    it('should respect limit parameter', async () => {
      mockCommentService.getCommentsForPost.mockResolvedValue([
        makeGatewayComment(1, 'Comment 1'),
        makeGatewayComment(2, 'Comment 2')
      ])

      const comments = []
      for await (const comment of post.comments({ limit: 1 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(1)
    })

    it('should handle empty comments', async () => {
      mockCommentService.getCommentsForPost.mockResolvedValue([])

      const comments = []
      for await (const comment of post.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(0)
    })

    it('should throw when API fails', async () => {
      mockCommentService.getCommentsForPost.mockRejectedValue(new Error('API error'))

      await expect(async () => {
        for await (const _ of post.comments()) {
          // consume
        }
      }).rejects.toThrow()
    })
  })

  describe('fullPost()', () => {
    it('should fetch full post and return FullPost instance', async () => {
      const mockFullPost = makeGatewayFullPost(456, 'Test Post')
      mockPostService.getPostById.mockResolvedValue(mockFullPost)

      const fullPost = await post.fullPost()

      expect(fullPost).toBeInstanceOf(FullPost)
      expect(fullPost.id).toBe(456)
      expect(mockPostService.getPostById).toHaveBeenCalledWith(456)
    })

    it('should throw when PostService fails', async () => {
      mockPostService.getPostById.mockRejectedValue(new Error('API error'))
      await expect(post.fullPost()).rejects.toThrow()
    })
  })

  describe('like() and addComment()', () => {
    it('should throw not-implemented error', async () => {
      await expect(post.like()).rejects.toThrow()
      await expect(post.addComment({ body: 'Test' })).rejects.toThrow()
    })
  })
})

// ---------------------------------------------------------------------------
// FullPost entity
// ---------------------------------------------------------------------------

describe('FullPost Entity', () => {
  let mockCommentService: jest.Mocked<CommentService>
  let fullPost: FullPost

  beforeEach(() => {
    mockCommentService = { getCommentsForPost: jest.fn() } as unknown as jest.Mocked<CommentService>
    fullPost = new FullPost(makeGatewayFullPost(789, 'Full Test Post'), mockCommentService)
  })

  describe('properties', () => {
    it('should expose id, title, htmlBody, subtitle, and publishedAt', () => {
      expect(fullPost.id).toBe(789)
      expect(fullPost.title).toBe('Full Test Post')
      expect(fullPost.htmlBody).toBe('<p>Full HTML content with <strong>formatting</strong></p>')
      expect(fullPost.subtitle).toBe('Test subtitle')
      expect(fullPost.publishedAt).toBeInstanceOf(Date)
    })

    it('should have like, addComment, and comments methods', () => {
      expect(typeof fullPost.like).toBe('function')
      expect(typeof fullPost.addComment).toBe('function')
      expect(typeof fullPost.comments).toBe('function')
    })
  })
})

// ---------------------------------------------------------------------------
// PostService
// ---------------------------------------------------------------------------

describe('PostService', () => {
  let postService: PostService
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockHttpClient()
    postService = new PostService(mockClient)
  })

  describe('getPostById', () => {
    it('should return GatewayFullPost from GET /posts/{id}', async () => {
      const mockPost = makeGatewayFullPost(123, 'Test Post')
      mockClient.get.mockResolvedValueOnce(mockPost)

      expect(await postService.getPostById(123)).toEqual(mockPost)
      expect(mockClient.get).toHaveBeenCalledWith('/posts/123')
    })

    it('should throw when request fails', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('HTTP 404: Not found'))
      await expect(postService.getPostById(999)).rejects.toThrow('HTTP 404: Not found')
    })
  })

  describe('getPostsForProfile', () => {
    it('should return posts from GET /profiles/{slug}/posts', async () => {
      const mockPosts = [makeGatewayPost(1, 'Post 1'), makeGatewayPost(2, 'Post 2')]
      mockClient.get.mockResolvedValueOnce({ items: mockPosts })

      const result = await postService.getPostsForProfile('testuser', { limit: 10, offset: 0 })

      expect(result).toEqual(mockPosts)
      expect(mockClient.get).toHaveBeenCalledWith('/profiles/testuser/posts', {
        limit: 10,
        offset: 0
      })
    })

    it('should return empty array when profile has no posts', async () => {
      mockClient.get.mockResolvedValueOnce({ items: [] })
      expect(await postService.getPostsForProfile('testuser', { limit: 5, offset: 0 })).toEqual([])
    })

    it('should throw when request fails', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('HTTP 500: Internal server error'))
      await expect(
        postService.getPostsForProfile('testuser', { limit: 10, offset: 0 })
      ).rejects.toThrow('HTTP 500: Internal server error')
    })
  })
})
