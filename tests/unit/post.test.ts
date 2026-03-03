import { FullPost, PreviewPost } from '@substack-api/domain/post'
import { Comment } from '@substack-api/domain/comment'
import { CommentService } from '@substack-api/internal/services/comment-service'
import { PostService } from '@substack-api/internal/services/post-service'

const makeGatewayPost = (id: number, title: string) => ({
  id,
  title,
  subtitle: 'Test subtitle',
  truncated_body: 'Truncated...',
  published_at: '2023-01-01T00:00:00Z'
})

const makeGatewayFullPost = (id: number, title: string) => ({
  id,
  title,
  slug: `post-${id}`,
  subtitle: 'Test subtitle',
  url: `https://example.com/post-${id}`,
  published_at: '2023-01-01T00:00:00Z',
  html_body: '<p>Full HTML content with <strong>formatting</strong></p>',
  truncated_body: 'Truncated content',
  reactions: { '❤️': 5 },
  restacks: 2,
  tags: ['tag1'],
  cover_image: 'https://example.com/cover.jpg'
})

const makeGatewayComment = (id: number, body: string) => ({
  id,
  body,
  is_admin: false
})

describe('PreviewPost Entity', () => {
  let mockCommentService: jest.Mocked<CommentService>
  let mockPostService: jest.Mocked<PostService>
  let post: PreviewPost

  beforeEach(() => {
    mockCommentService = {
      getCommentsForPost: jest.fn()
    } as unknown as jest.Mocked<CommentService>

    mockPostService = {
      getPostById: jest.fn(),
      getPostsForProfile: jest.fn()
    } as unknown as jest.Mocked<PostService>

    post = new PreviewPost(makeGatewayPost(456, 'Test Post'), mockCommentService, mockPostService)
  })

  describe('properties', () => {
    it('should expose id', () => {
      expect(post.id).toBe(456)
    })

    it('should expose title', () => {
      expect(post.title).toBe('Test Post')
    })

    it('should expose publishedAt as Date', () => {
      expect(post.publishedAt).toBeInstanceOf(Date)
    })
  })

  describe('comments()', () => {
    it('should iterate through post comments', async () => {
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
      expect(comments[0].body).toBe('Comment 1')
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
      expect(fullPost.title).toBe('Test Post')
      expect(mockPostService.getPostById).toHaveBeenCalledWith(456)
    })

    it('should throw when PostService fails', async () => {
      mockPostService.getPostById.mockRejectedValue(new Error('API error'))
      await expect(post.fullPost()).rejects.toThrow()
    })
  })

  describe('like()', () => {
    it('should throw not-implemented error', async () => {
      await expect(post.like()).rejects.toThrow()
    })
  })

  describe('addComment()', () => {
    it('should throw not-implemented error', async () => {
      await expect(post.addComment({ body: 'Test' })).rejects.toThrow()
    })
  })
})

describe('FullPost Entity', () => {
  let mockCommentService: jest.Mocked<CommentService>
  let fullPost: FullPost

  beforeEach(() => {
    mockCommentService = {
      getCommentsForPost: jest.fn()
    } as unknown as jest.Mocked<CommentService>

    fullPost = new FullPost(makeGatewayFullPost(789, 'Full Test Post'), mockCommentService)
  })

  describe('properties', () => {
    it('should expose id', () => {
      expect(fullPost.id).toBe(789)
    })

    it('should expose title', () => {
      expect(fullPost.title).toBe('Full Test Post')
    })

    it('should expose htmlBody', () => {
      expect(fullPost.htmlBody).toBe('<p>Full HTML content with <strong>formatting</strong></p>')
    })

    it('should expose subtitle', () => {
      expect(fullPost.subtitle).toBe('Test subtitle')
    })

    it('should expose publishedAt as Date', () => {
      expect(fullPost.publishedAt).toBeInstanceOf(Date)
    })
  })

  describe('Post interface', () => {
    it('should have like, addComment, and comments methods', () => {
      expect(typeof fullPost.like).toBe('function')
      expect(typeof fullPost.addComment).toBe('function')
      expect(typeof fullPost.comments).toBe('function')
    })
  })
})
