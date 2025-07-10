import { Profile } from '../../src/domain/profile'
import { PreviewPost, Note } from '../../src/domain'
import {
  ProfileService,
  PostService,
  NoteService,
  CommentService
} from '../../src/internal/services'
import type { HttpClient } from '../../src/internal/http-client'

describe('Profile Entity', () => {
  let mockHttpClient: jest.Mocked<HttpClient>
  let mockProfileService: jest.Mocked<ProfileService>
  let mockPostService: jest.Mocked<PostService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockCommentService: jest.Mocked<CommentService>
  let profile: Profile

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    } as unknown as jest.Mocked<HttpClient>

    mockProfileService = {
      getOwnProfile: jest.fn(),
      getProfileById: jest.fn(),
      getProfileBySlug: jest.fn()
    } as unknown as jest.Mocked<ProfileService>

    mockPostService = {
      getPostById: jest.fn(),
      getPostsForProfile: jest.fn()
    } as unknown as jest.Mocked<PostService>

    mockNoteService = {
      getNoteById: jest.fn(),
      getNotesForLoggedUser: jest.fn(),
      getNotesForProfile: jest.fn()
    } as unknown as jest.Mocked<NoteService>

    mockCommentService = {
      getCommentsForPost: jest.fn(),
      getCommentById: jest.fn()
    } as unknown as jest.Mocked<CommentService>

    const mockProfileData = {
      id: 123,
      handle: 'testuser',
      name: 'Test User',
      photo_url: 'https://example.com/photo.jpg',
      bio: 'Test bio',
      profile_set_up_at: '2023-01-01T00:00:00Z',
      reader_installed_at: '2023-01-01T00:00:00Z',
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
      slug: 'testuser',
      primaryPublicationIsPledged: false,
      primaryPublicationSubscriptionState: 'not_subscribed',
      isSubscribed: false,
      isFollowing: false,
      followsViewer: false,
      can_dm: false,
      dm_upgrade_options: []
    }

    profile = new Profile(
      mockProfileData,
      mockHttpClient,
      mockProfileService,
      mockPostService,
      mockNoteService,
      mockCommentService
    )
  })

  describe('posts()', () => {
    it('should iterate through profile posts', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Post 1',
          slug: 'post-1',
          post_date: '2023-01-01T00:00:00Z',
          canonical_url: 'https://example.com/post1',
          type: 'newsletter' as const
        },
        {
          id: 2,
          title: 'Post 2',
          slug: 'post-2',
          post_date: '2023-01-02T00:00:00Z',
          canonical_url: 'https://example.com/post2',
          type: 'newsletter' as const
        }
      ]
      mockPostService.getPostsForProfile.mockResolvedValue(mockPosts)

      const posts = []
      for await (const post of profile.posts({ limit: 2 })) {
        posts.push(post)
      }

      expect(posts).toHaveLength(2)
      expect(posts[0]).toBeInstanceOf(PreviewPost)
      expect(posts[0].title).toBe('Post 1')
      expect(posts[1].title).toBe('Post 2')
      expect(mockPostService.getPostsForProfile).toHaveBeenCalledWith(123, {
        limit: 25,
        offset: 0
      })
    })

    it('should handle limit parameter', async () => {
      const mockPosts = [
        {
          id: 1,
          title: 'Post 1',
          slug: 'post-1',
          post_date: '2023-01-01T00:00:00Z',
          canonical_url: 'https://example.com/post1',
          type: 'newsletter' as const
        },
        {
          id: 2,
          title: 'Post 2',
          slug: 'post-2',
          post_date: '2023-01-02T00:00:00Z',
          canonical_url: 'https://example.com/post2',
          type: 'newsletter' as const
        }
      ]
      mockPostService.getPostsForProfile.mockResolvedValue(mockPosts)

      const posts = []
      for await (const post of profile.posts({ limit: 1 })) {
        posts.push(post)
      }

      expect(posts).toHaveLength(1)
      expect(posts[0].title).toBe('Post 1')
    })

    it('should handle empty posts response', async () => {
      const mockResponse = { posts: [] }
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(0)
    })

    it('should handle missing posts property', async () => {
      const mockResponse = {}
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(0)
    })

    it('should handle API error gracefully', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('API error'))

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(0)
    })

    it('should use perPage configuration from client', async () => {
      // Mock a different perPage value
      mockHttpClient.getPerPage.mockReturnValue(10)

      const mockPosts = [
        {
          id: 1,
          title: 'Post 1',
          slug: 'post-1',
          post_date: '2023-01-01T00:00:00Z',
          canonical_url: 'https://example.com/post1',
          type: 'newsletter' as const
        }
      ]
      mockPostService.getPostsForProfile.mockResolvedValue(mockPosts)

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(1)
      expect(mockPostService.getPostsForProfile).toHaveBeenCalledWith(123, {
        limit: 10,
        offset: 0
      })
    })

    it('should implement pagination with offset for multiple pages', async () => {
      // Reset the mock to avoid interference from other tests
      mockPostService.getPostsForProfile.mockReset()
      mockHttpClient.getPerPage.mockReturnValue(2) // Set perPage to 2 for this test

      // Mock first page response (full page)
      const firstPagePosts = [
        {
          id: 1,
          title: 'Post 1',
          slug: 'post-1',
          post_date: '2023-01-01T00:00:00Z',
          canonical_url: 'https://example.com/post1',
          type: 'newsletter' as const
        },
        {
          id: 2,
          title: 'Post 2',
          slug: 'post-2',
          post_date: '2023-01-02T00:00:00Z',
          canonical_url: 'https://example.com/post2',
          type: 'newsletter' as const
        }
      ]

      // Mock second page response (full page)
      const secondPagePosts = [
        {
          id: 3,
          title: 'Post 3',
          slug: 'post-3',
          post_date: '2023-01-03T00:00:00Z',
          canonical_url: 'https://example.com/post3',
          type: 'newsletter' as const
        },
        {
          id: 4,
          title: 'Post 4',
          slug: 'post-4',
          post_date: '2023-01-04T00:00:00Z',
          canonical_url: 'https://example.com/post4',
          type: 'newsletter' as const
        }
      ]

      // Mock third page response (partial page - should trigger end of pagination)
      const thirdPagePosts = [
        {
          id: 5,
          title: 'Post 5',
          slug: 'post-5',
          post_date: '2023-01-05T00:00:00Z',
          canonical_url: 'https://example.com/post5',
          type: 'newsletter' as const
        }
      ]

      // Setup sequential responses for pagination
      mockPostService.getPostsForProfile
        .mockResolvedValueOnce(firstPagePosts) // offset=0, returns 2 posts (full page)
        .mockResolvedValueOnce(secondPagePosts) // offset=2, returns 2 posts (full page)
        .mockResolvedValueOnce(thirdPagePosts) // offset=4, returns 1 post (partial page - end)

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(5)
      expect(posts[0].title).toBe('Post 1')
      expect(posts[1].title).toBe('Post 2')
      expect(posts[2].title).toBe('Post 3')
      expect(posts[3].title).toBe('Post 4')
      expect(posts[4].title).toBe('Post 5')

      // Verify all three service calls were made with correct offsets
      expect(mockPostService.getPostsForProfile).toHaveBeenCalledTimes(3)
      expect(mockPostService.getPostsForProfile).toHaveBeenNthCalledWith(1, 123, {
        limit: 2,
        offset: 0
      })
      expect(mockPostService.getPostsForProfile).toHaveBeenNthCalledWith(2, 123, {
        limit: 2,
        offset: 2
      })
      expect(mockPostService.getPostsForProfile).toHaveBeenNthCalledWith(3, 123, {
        limit: 2,
        offset: 4
      })
    })
  })

  describe('notes()', () => {
    it('should iterate through profile notes', async () => {
      const mockResponse = [
        {
          entity_key: 'c-123',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-01T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 1
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 123,
            body: 'Test note content',
            type: 'feed',
            user_id: 123,
            date: '2023-01-01T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 5,
            reactions: { '❤️': 5 },
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-123',
            item_entity_key: 'c-123',
            item_type: 'comment',
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: '',
            item_context_timestamp: '2023-01-01T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 1,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        },
        {
          entity_key: 'c-124',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-02T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 2
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 124,
            body: 'Another test note',
            type: 'feed',
            user_id: 123,
            date: '2023-01-02T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 3,
            reactions: { '❤️': 3 },
            restacks: 1,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-124',
            item_entity_key: 'c-124',
            item_type: 'comment',
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: '',
            item_context_timestamp: '2023-01-02T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 2,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        }
      ]
      mockNoteService.getNotesForProfile.mockResolvedValue({
        notes: mockResponse,
        nextCursor: undefined
      })

      const notes = []
      for await (const note of profile.notes({ limit: 2 })) {
        notes.push(note)
      }

      expect(notes).toHaveLength(2)
      expect(notes[0]).toBeInstanceOf(Note)
      expect(notes[0].body).toBe('Test note content')
      expect(notes[1].body).toBe('Another test note')
      expect(mockNoteService.getNotesForProfile).toHaveBeenCalledWith(123, {
        cursor: undefined
      })
    })

    it('should handle limit parameter', async () => {
      const mockResponse = [
        {
          entity_key: 'c-125',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-01T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 1
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 125,
            body: 'Limited note',
            type: 'feed',
            user_id: 123,
            date: '2023-01-01T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 2,
            reactions: { '❤️': 2 },
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-125',
            item_entity_key: 'c-125',
            item_type: 'comment',
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: '',
            item_context_timestamp: '2023-01-01T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 1,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        },
        {
          entity_key: 'c-126',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-02T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 2
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 126,
            body: 'Second note',
            type: 'feed',
            user_id: 123,
            date: '2023-01-02T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 1,
            reactions: { '❤️': 1 },
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-126',
            item_entity_key: 'c-126',
            item_type: 'comment',
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: '',
            item_context_timestamp: '2023-01-02T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 2,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        }
      ]
      mockNoteService.getNotesForProfile.mockResolvedValue({
        notes: mockResponse,
        nextCursor: undefined
      })

      const notes = []
      for await (const note of profile.notes({ limit: 1 })) {
        notes.push(note)
      }

      expect(notes).toHaveLength(1)
      expect(notes[0].body).toBe('Limited note')
    })

    it('should filter out non-note items', async () => {
      const mockResponse = [
        {
          entity_key: 'c-128',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-01T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 1
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 128,
            body: 'Actual note',
            type: 'feed', // This is a note
            user_id: 123,
            date: '2023-01-01T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 0,
            reactions: {},
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-128',
            item_entity_key: 'c-128',
            item_type: 'comment',
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: '',
            item_context_timestamp: '2023-01-01T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 1,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        }
      ]
      mockNoteService.getNotesForProfile.mockResolvedValue({
        notes: mockResponse,
        nextCursor: undefined
      })

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(1)
      expect(notes[0].body).toBe('Actual note')
    })

    it('should handle empty notes response', async () => {
      const mockResponse = { items: [] }
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(0)
    })

    it('should handle missing items property', async () => {
      const mockResponse = {}
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(0)
    })

    it('should handle API error gracefully', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('API error'))

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(0)
    })

    it('should use perPage configuration from client', async () => {
      // Mock a different perPage value
      mockHttpClient.getPerPage.mockReturnValue(10)

      const mockResponse = [
        {
          entity_key: 'c-129',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-01T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 1
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 129,
            body: 'PerPage test note',
            type: 'feed',
            user_id: 123,
            date: '2023-01-01T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 0,
            reactions: {},
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-129',
            item_entity_key: 'c-129',
            item_type: 'comment',
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: '',
            item_context_timestamp: '2023-01-01T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 1,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        }
      ]
      mockNoteService.getNotesForProfile.mockResolvedValue({
        notes: mockResponse,
        nextCursor: undefined
      })

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(1)
      expect(mockNoteService.getNotesForProfile).toHaveBeenCalledWith(123, {
        cursor: undefined
      })
    })

    it('should implement pagination with cursor for multiple pages', async () => {
      // Reset the mock to avoid interference from other tests
      mockNoteService.getNotesForProfile.mockReset()
      mockHttpClient.getPerPage.mockReturnValue(2) // Set perPage to 2 for this test

      // Mock first page response (full page)
      const firstPageResponse = [
        {
          entity_key: 'c-130',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-01T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 1
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 130,
            body: 'Note 1',
            type: 'feed',
            user_id: 123,
            date: '2023-01-01T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 0,
            reactions: {},
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-130',
            item_entity_key: 'c-130',
            item_type: 'comment',
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: '',
            item_context_timestamp: '2023-01-01T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 1,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        },
        {
          entity_key: 'c-131',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-02T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 2
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 131,
            body: 'Note 2',
            type: 'feed',
            user_id: 123,
            date: '2023-01-02T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 0,
            reactions: {},
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-131',
            item_entity_key: 'c-131',
            item_type: 'comment',
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: '',
            item_context_timestamp: '2023-01-02T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 2,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        }
      ]

      // Mock second page response (partial page - should trigger end of pagination)
      const secondPageResponse = [
        {
          entity_key: 'c-132',
          type: 'comment',
          context: {
            type: 'note',
            timestamp: '2023-01-03T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 3
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 132,
            body: 'Note 3',
            type: 'feed',
            user_id: 123,
            date: '2023-01-03T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 0,
            reactions: {},
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: 'c-132',
            item_entity_key: 'c-132',
            item_type: 'comment',
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: '',
            item_context_timestamp: '2023-01-03T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 3,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        }
      ]

      // Setup sequential responses for pagination
      mockNoteService.getNotesForProfile
        .mockResolvedValueOnce({
          notes: firstPageResponse,
          nextCursor: 'cursor1'
        }) // offset=0, returns 2 notes (full page)
        .mockResolvedValueOnce({
          notes: secondPageResponse,
          nextCursor: undefined
        }) // offset=2, returns 1 note (partial page - end)

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(3)
      expect(notes[0].body).toBe('Note 1')
      expect(notes[1].body).toBe('Note 2')
      expect(notes[2].body).toBe('Note 3')

      // Verify both service calls were made with correct offsets
      expect(mockNoteService.getNotesForProfile).toHaveBeenCalledTimes(2)
      expect(mockNoteService.getNotesForProfile).toHaveBeenNthCalledWith(1, 123, {
        cursor: undefined
      })
      expect(mockNoteService.getNotesForProfile).toHaveBeenNthCalledWith(2, 123, {
        cursor: 'cursor1'
      })
    })
  })
})
