import { SubstackClient } from '@substack-api/substack-client'
import { Profile, PreviewPost, Comment } from '@substack-api/domain'
import {
  PostService,
  ProfileService,
  NoteService,
  CommentService
} from '@substack-api/internal/services'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('SubstackClient Entity Model', () => {
  let client: SubstackClient

  beforeEach(() => {
    client = new SubstackClient({
      token: 'test-api-key',
      publicationUrl: 'test.substack.com'
    })
  })

  describe('SubstackClient', () => {
    it('should create client instance', () => {
      expect(client).toBeInstanceOf(SubstackClient)
    })

    it('should throw error when getting own profile without proper authentication', async () => {
      await expect(client.ownProfile()).rejects.toThrow('Failed to get own profile:')
    })
  })

  describe('Entity Creation', () => {
    it('should create Profile entity', () => {
      const mockData = {
        id: 123,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg',
        profile_set_up_at: new Date().toISOString(),
        reader_installed_at: new Date().toISOString(),
        profile_disabled: false,
        publicationUsers: [],
        userLinks: [],
        subscriptions: [],
        subscriptionsTruncated: false,
        hasGuestPost: false,
        max_pub_tier: 0,
        hasActivity: false,
        hasLikes: false,
        lists: [],
        rough_num_free_subscribers_int: 0,
        rough_num_free_subscribers: '0',
        bestseller_badge_disabled: false,
        subscriberCountString: '0',
        subscriberCount: '0',
        subscriberCountNumber: 0,
        hasHiddenPublicationUsers: false,
        visibleSubscriptionsCount: 0,
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'not_subscribed',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }
      const publicationClient = (client as unknown as { publicationClient: HttpClient })
        .publicationClient

      // Create mock services
      const mockProfileService = {
        getOwnProfile: jest.fn(),
        getProfileById: jest.fn(),
        getProfileBySlug: jest.fn()
      } as unknown as ProfileService

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
        getCommentsForPost: jest.fn(),
        getCommentById: jest.fn()
      } as unknown as CommentService

      const profile = new Profile(
        mockData,
        publicationClient,
        mockProfileService,
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

    it('should create PreviewPost entity', () => {
      const mockData = {
        id: 456,
        title: 'Test Post',
        slug: 'test-slug',
        post_date: '2023-01-01T00:00:00Z',
        type: 'newsletter' as const
      }
      const publicationClient = (client as unknown as { publicationClient: HttpClient })
        .publicationClient

      // Create mock services
      const mockCommentService = {
        getCommentsForPost: jest.fn(),
        getCommentById: jest.fn()
      } as unknown as CommentService

      const mockPostService = {
        getPostById: jest.fn(),
        getPostsForProfile: jest.fn()
      } as unknown as PostService

      const post = new PreviewPost(mockData, publicationClient, mockCommentService, mockPostService)

      expect(post).toBeInstanceOf(PreviewPost)
      expect(post.id).toBe(456)
      expect(post.title).toBe('Test Post')
    })

    it('should create Comment entity', () => {
      const mockData = {
        id: 789,
        body: 'Test comment',
        date: '2023-01-01T00:00:00Z',
        post_id: 456,
        user_id: 123,
        name: 'Test User'
      }
      const publicationClient = (client as unknown as { publicationClient: HttpClient })
        .publicationClient
      const comment = new Comment(mockData, publicationClient)

      expect(comment).toBeInstanceOf(Comment)
      expect(comment.id).toBe(789)
      expect(comment.body).toBe('Test comment')
    })
  })
})
