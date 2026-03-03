import { SubstackClient } from '@substack-api/substack-client'
import { Profile, PreviewPost, Comment } from '@substack-api/domain'
import { PostService, NoteService, CommentService } from '@substack-api/internal/services'

describe('SubstackClient Entity Model', () => {
  let client: SubstackClient

  beforeEach(() => {
    client = new SubstackClient({
      gatewayUrl: 'http://localhost:5001',
      publicationUrl: 'https://test.substack.com',
      token: 'dummy-token'
    })
  })

  describe('SubstackClient', () => {
    it('should create client instance', () => {
      expect(client).toBeInstanceOf(SubstackClient)
    })

    it('should throw error when getting own profile without proper authentication', async () => {
      await expect(client.ownProfile()).rejects.toThrow()
    })
  })

  describe('Entity Creation', () => {
    it('should create Profile entity from GatewayProfile', () => {
      const mockData = {
        id: 123,
        handle: 'testuser',
        name: 'Test User',
        url: 'https://substack.com/@testuser',
        avatar_url: 'https://example.com/photo.jpg',
        bio: 'Test bio'
      }

      const mockPostService = {
        getPostById: jest.fn(),
        getPostsForProfile: jest.fn()
      } as unknown as PostService

      const mockNoteService = {
        getNoteById: jest.fn(),
        getNotesForLoggedUser: jest.fn(),
        getNotesForProfile: jest.fn()
      } as unknown as NoteService

      const mockCommentService = {
        getCommentsForPost: jest.fn()
      } as unknown as CommentService

      const profile = new Profile(
        mockData,
        mockPostService,
        mockNoteService,
        mockCommentService,
        25
      )

      expect(profile).toBeInstanceOf(Profile)
      expect(profile.id).toBe(123)
      expect(profile.name).toBe('Test User')
      expect(profile.slug).toBe('testuser')
    })

    it('should create PreviewPost entity from GatewayPost', () => {
      const mockData = {
        id: 456,
        title: 'Test Post',
        published_at: '2023-01-01T00:00:00Z'
      }

      const mockCommentService = {
        getCommentsForPost: jest.fn()
      } as unknown as CommentService

      const mockPostService = {
        getPostById: jest.fn(),
        getPostsForProfile: jest.fn()
      } as unknown as PostService

      const post = new PreviewPost(mockData, mockCommentService, mockPostService)

      expect(post).toBeInstanceOf(PreviewPost)
      expect(post.id).toBe(456)
      expect(post.title).toBe('Test Post')
    })

    it('should create Comment entity from GatewayComment', () => {
      const mockData = {
        id: 789,
        body: 'Test comment',
        is_admin: false
      }

      const comment = new Comment(mockData)

      expect(comment).toBeInstanceOf(Comment)
      expect(comment.id).toBe(789)
      expect(comment.body).toBe('Test comment')
    })
  })
})
