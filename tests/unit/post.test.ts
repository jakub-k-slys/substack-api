import { PreviewPost, FullPost } from '../../src/domain/post'
import { Comment } from '../../src/domain/comment'
import { CommentService } from '../../src/internal/services/comment-service'
import { PostService } from '../../src/internal/services/post-service'
import type { HttpClient } from '../../src/internal/http-client'

describe('PreviewPost Entity', () => {
  let mockHttpClient: jest.Mocked<HttpClient>
  let mockCommentService: jest.Mocked<CommentService>
  let mockPostService: jest.Mocked<PostService>
  let post: PreviewPost

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn()
    } as unknown as jest.Mocked<HttpClient>

    mockCommentService = {
      getCommentsForPost: jest.fn(),
      getCommentById: jest.fn()
    } as unknown as jest.Mocked<CommentService>

    mockPostService = {
      getPostById: jest.fn(),
      getPostsForProfile: jest.fn()
    } as unknown as jest.Mocked<PostService>

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

    post = new PreviewPost(mockPostData, mockHttpClient, mockCommentService, mockPostService)
  })

  describe('comments()', () => {
    it('should iterate through post comments', async () => {
      const mockComments = [
        {
          id: 1,
          body: 'Comment 1',
          created_at: '2023-01-01T00:00:00Z',
          parent_post_id: 456,
          author_id: 123,
          author_name: 'User 1'
        },
        {
          id: 2,
          body: 'Comment 2',
          created_at: '2023-01-02T00:00:00Z',
          parent_post_id: 456,
          author_id: 124,
          author_name: 'User 2'
        }
      ]
      mockCommentService.getCommentsForPost.mockResolvedValue(mockComments)

      const comments = []
      for await (const comment of post.comments({ limit: 2 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(2)
      expect(comments[0]).toBeInstanceOf(Comment)
      expect(comments[0].body).toBe('Comment 1')
      expect(comments[1].body).toBe('Comment 2')
      expect(mockCommentService.getCommentsForPost).toHaveBeenCalledWith(456)
    })

    it('should handle limit parameter', async () => {
      const mockComments = [
        {
          id: 1,
          body: 'Comment 1',
          created_at: '2023-01-01T00:00:00Z',
          parent_post_id: 456,
          author_id: 123,
          author_name: 'User 1'
        },
        {
          id: 2,
          body: 'Comment 2',
          created_at: '2023-01-02T00:00:00Z',
          parent_post_id: 456,
          author_id: 124,
          author_name: 'User 2'
        }
      ]
      mockCommentService.getCommentsForPost.mockResolvedValue(mockComments)

      const comments = []
      for await (const comment of post.comments({ limit: 1 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(1)
      expect(comments[0].body).toBe('Comment 1')
    })

    it('should handle empty comments response', async () => {
      mockCommentService.getCommentsForPost.mockResolvedValue([])

      const comments = []
      for await (const comment of post.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(0)
    })

    it('should handle missing comments property', async () => {
      mockCommentService.getCommentsForPost.mockResolvedValue([])

      const comments = []
      for await (const comment of post.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(0)
    })

    it('should throw error when API fails', async () => {
      mockCommentService.getCommentsForPost.mockRejectedValue(new Error('API error'))

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

  describe('fullPost()', () => {
    it('should fetch full post data and return FullPost instance', async () => {
      const mockFullPostData = {
        id: 456,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter' as const,
        subtitle: 'Test subtitle',
        description: 'Test description',
        truncated_body_text: 'Truncated content',
        body_html: '<p>Full HTML content</p>',
        htmlBody: '<p>Full HTML content</p>' // For backward compatibility
      }

      mockPostService.getPostById.mockResolvedValue(mockFullPostData)

      const fullPost = await post.fullPost()

      expect(fullPost).toBeInstanceOf(FullPost)
      expect(fullPost.id).toBe(456)
      expect(fullPost.title).toBe('Test Post')
      expect(fullPost.htmlBody).toBe('<p>Full HTML content</p>')
      expect(mockPostService.getPostById).toHaveBeenCalledWith(456)
    })

    it('should throw error when PostService fails', async () => {
      mockPostService.getPostById.mockRejectedValue(new Error('API error'))

      await expect(post.fullPost()).rejects.toThrow('Failed to fetch full post 456: API error')
    })
  })
})

describe('FullPost Entity', () => {
  let mockHttpClient: jest.Mocked<HttpClient>
  let mockCommentService: jest.Mocked<CommentService>
  let mockPostService: jest.Mocked<PostService>
  let fullPost: FullPost

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn()
    } as unknown as jest.Mocked<HttpClient>

    mockCommentService = {
      getCommentsForPost: jest.fn(),
      getCommentById: jest.fn()
    } as unknown as jest.Mocked<CommentService>

    mockPostService = {
      getPostById: jest.fn(),
      getPostsForProfile: jest.fn()
    } as unknown as jest.Mocked<PostService>

    const mockFullPostData = {
      id: 789,
      title: 'Full Test Post',
      slug: 'full-test-post',
      post_date: '2023-01-01T00:00:00Z',
      canonical_url: 'https://example.com/full-post',
      type: 'newsletter' as const,
      subtitle: 'Full test subtitle',
      description: 'Full test description',
      truncated_body_text: 'Truncated content',
      body_html: '<p>Full HTML content with <strong>formatting</strong></p>',
      htmlBody: '<p>Full HTML content with <strong>formatting</strong></p>' // For backward compatibility
    }

    fullPost = new FullPost(mockFullPostData, mockHttpClient, mockCommentService, mockPostService)
  })

  describe('properties', () => {
    it('should have all PreviewPost properties', () => {
      expect(fullPost.id).toBe(789)
      expect(fullPost.title).toBe('Full Test Post')
      expect(fullPost.subtitle).toBe('Full test subtitle')
      expect(fullPost.truncatedBody).toBe('Truncated content')
      expect(fullPost.likesCount).toBe(0)
      expect(fullPost.publishedAt).toBeInstanceOf(Date)
    })

    it('should have htmlBody property', () => {
      expect(fullPost.htmlBody).toBe('<p>Full HTML content with <strong>formatting</strong></p>')
    })

    it('should handle missing htmlBody gracefully', () => {
      const mockDataWithoutHtmlBody = {
        id: 999,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter' as const,
        body_html: '<p>Body from body_html field</p>' // body_html is required, but htmlBody is optional
      }

      const postWithoutHtmlBody = new FullPost(
        mockDataWithoutHtmlBody,
        mockHttpClient,
        mockCommentService,
        mockPostService
      )

      expect(postWithoutHtmlBody.htmlBody).toBe('<p>Body from body_html field</p>')
    })
  })

  describe('inheritance', () => {
    it('should inherit all methods from PreviewPost', async () => {
      // Test that fullPost method is available
      expect(typeof fullPost.fullPost).toBe('function')

      // Test that like method is available
      expect(typeof fullPost.like).toBe('function')

      // Test that addComment method is available
      expect(typeof fullPost.addComment).toBe('function')

      // Test that comments method is available
      expect(typeof fullPost.comments).toBe('function')
    })
  })
})
