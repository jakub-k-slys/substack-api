import { SubstackClient } from '../../src/substack-client'
import { Profile, FullPost, Note, Comment, OwnProfile } from '../../src/domain'
import { HttpClient } from '../../src/internal/http-client'
import {
  PostService,
  NoteService,
  ProfileService,
  SlugService,
  CommentService,
  FolloweeService,
  ConnectivityService
} from '../../src/internal/services'
import type { SubstackFullProfile } from '../../src/internal'

// Mock the http client and services
jest.mock('../../src/internal/http-client')
jest.mock('../../src/internal/services')

// Mock the global fetch function
global.fetch = jest.fn()

describe('SubstackClient', () => {
  let client: SubstackClient
  let mockHttpClient: jest.Mocked<HttpClient>
  let mockGlobalHttpClient: jest.Mocked<HttpClient>
  let mockPostService: jest.Mocked<PostService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockProfileService: jest.Mocked<ProfileService>
  let mockSlugService: jest.Mocked<SlugService>
  let mockCommentService: jest.Mocked<CommentService>
  let mockFolloweeService: jest.Mocked<FolloweeService>
  let mockConnectivityService: jest.Mocked<ConnectivityService>

  beforeEach(() => {
    jest.clearAllMocks()
    mockHttpClient = new HttpClient('https://test.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()
    mockHttpClient.post = jest.fn()
    mockHttpClient.request = jest.fn()

    mockGlobalHttpClient = new HttpClient('https://substack.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<HttpClient>
    mockGlobalHttpClient.get = jest.fn()
    mockGlobalHttpClient.post = jest.fn()
    mockGlobalHttpClient.request = jest.fn()

    mockPostService = new PostService(
      mockGlobalHttpClient,
      mockHttpClient
    ) as jest.Mocked<PostService>
    mockPostService.getPostById = jest.fn()

    mockNoteService = new NoteService(mockHttpClient) as jest.Mocked<NoteService>
    mockNoteService.getNoteById = jest.fn()

    mockProfileService = new ProfileService(mockHttpClient) as jest.Mocked<ProfileService>
    mockProfileService.getOwnProfile = jest.fn()
    mockProfileService.getProfileById = jest.fn()
    mockProfileService.getProfileBySlug = jest.fn()

    mockSlugService = new SlugService(mockHttpClient) as jest.Mocked<SlugService>
    mockSlugService.getSlugForUserId = jest.fn()
    mockSlugService.getSlugMapping = jest.fn()

    mockCommentService = new CommentService(mockHttpClient) as jest.Mocked<CommentService>
    mockCommentService.getCommentById = jest.fn()
    mockCommentService.getCommentsForPost = jest.fn()

    mockFolloweeService = new FolloweeService(mockHttpClient) as jest.Mocked<FolloweeService>
    mockFolloweeService.getFollowees = jest.fn()

    mockConnectivityService = new ConnectivityService(
      mockHttpClient
    ) as jest.Mocked<ConnectivityService>
    mockConnectivityService.isConnected = jest.fn()

    client = new SubstackClient({
      apiKey: 'test-api-key',
      hostname: 'test.substack.com'
    })
    // Replace the internal http clients and services with our mocks
    ;(client as unknown as { publicationClient: HttpClient }).publicationClient = mockHttpClient
    ;(client as unknown as { substackClient: HttpClient }).substackClient = mockGlobalHttpClient
    ;(client as unknown as { postService: PostService }).postService = mockPostService
    ;(client as unknown as { noteService: NoteService }).noteService = mockNoteService
    ;(client as unknown as { profileService: ProfileService }).profileService = mockProfileService
    ;(client as unknown as { slugService: SlugService }).slugService = mockSlugService
    ;(client as unknown as { commentService: CommentService }).commentService = mockCommentService
    ;(client as unknown as { followeeService: FolloweeService }).followeeService =
      mockFolloweeService
    ;(client as unknown as { connectivityService: ConnectivityService }).connectivityService =
      mockConnectivityService
  })

  describe('testConnectivity', () => {
    it('should return true when API is accessible', async () => {
      mockConnectivityService.isConnected.mockResolvedValue(true)
      const result = await client.testConnectivity()
      expect(result).toBe(true)
      expect(mockConnectivityService.isConnected).toHaveBeenCalled()
    })

    it('should return false when API is not accessible', async () => {
      mockConnectivityService.isConnected.mockResolvedValue(false)
      const result = await client.testConnectivity()
      expect(result).toBe(false)
      expect(mockConnectivityService.isConnected).toHaveBeenCalled()
    })
  })

  describe('ownProfile', () => {
    it('should get own profile when authenticated', async () => {
      const mockSubscription = { user_id: 123 }
      const mockProfile = {
        id: 123,
        name: 'Test User',
        handle: 'testuser',
        photo_url: 'https://example.com/photo.jpg',
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
      mockProfileService.getOwnProfile.mockResolvedValueOnce(mockProfile)
      mockHttpClient.get.mockResolvedValueOnce(mockSubscription) // For getUserId
      mockSlugService.getSlugForUserId.mockResolvedValueOnce('resolved-slug')

      const ownProfile = await client.ownProfile()
      expect(ownProfile).toBeInstanceOf(OwnProfile)
      expect(ownProfile.id).toBe(123)
      expect(ownProfile.name).toBe('Test User')
      expect(mockProfileService.getOwnProfile).toHaveBeenCalled()
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/subscription')
      expect(mockSlugService.getSlugForUserId).toHaveBeenCalledWith(123, 'testuser')
    })

    it('should throw error when authentication fails', async () => {
      mockProfileService.getOwnProfile.mockRejectedValue(new Error('Unauthorized'))

      await expect(client.ownProfile()).rejects.toThrow('Failed to get own profile: Unauthorized')
    })
  })

  describe('profileForId', () => {
    it('should get profile by numeric ID', async () => {
      const mockProfile: Partial<SubstackFullProfile> = {
        id: 123,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg',
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
        primaryPublicationSubscriptionState: 'none',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }
      mockProfileService.getProfileById.mockResolvedValue(mockProfile as any)
      mockSlugService.getSlugForUserId.mockResolvedValueOnce('resolved-slug')

      const profile = await client.profileForId(123)
      expect(profile).toBeInstanceOf(Profile)
      expect(mockProfileService.getProfileById).toHaveBeenCalledWith(123)
      expect(mockSlugService.getSlugForUserId).toHaveBeenCalledWith(123, 'testuser')
    })

    it('should handle API error for profileForId', async () => {
      mockProfileService.getProfileById.mockRejectedValue(new Error('Not found'))

      await expect(client.profileForId(999)).rejects.toThrow(
        'Profile with ID 999 not found: Not found'
      )
    })

    it('should accept large numeric IDs', async () => {
      const mockProfile: Partial<SubstackFullProfile> = {
        id: 9876543210,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg',
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
        primaryPublicationSubscriptionState: 'none',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }
      mockProfileService.getProfileById.mockResolvedValue(mockProfile as any)
      mockSlugService.getSlugForUserId.mockResolvedValueOnce('resolved-slug')

      const profile = await client.profileForId(9876543210)
      expect(profile).toBeInstanceOf(Profile)
      expect(mockProfileService.getProfileById).toHaveBeenCalledWith(9876543210)
      expect(mockSlugService.getSlugForUserId).toHaveBeenCalledWith(9876543210, 'testuser')
    })
  })

  describe('profileForSlug', () => {
    it('should get profile by slug', async () => {
      const mockProfile: Partial<SubstackFullProfile> = {
        id: 123,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg',
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
        primaryPublicationSubscriptionState: 'none',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }
      mockProfileService.getProfileBySlug.mockResolvedValue(mockProfile as any)
      mockSlugService.getSlugForUserId.mockResolvedValueOnce('resolved-slug')

      const profile = await client.profileForSlug('testuser')
      expect(profile).toBeInstanceOf(Profile)
      expect(mockProfileService.getProfileBySlug).toHaveBeenCalledWith('testuser')
      expect(mockSlugService.getSlugForUserId).toHaveBeenCalledWith(123, 'testuser')
    })

    it('should handle empty slug', async () => {
      await expect(client.profileForSlug('')).rejects.toThrow('Profile slug cannot be empty')
      await expect(client.profileForSlug('   ')).rejects.toThrow('Profile slug cannot be empty')
    })

    it('should handle API error for profileForSlug', async () => {
      mockProfileService.getProfileBySlug.mockRejectedValue(new Error('Not found'))

      await expect(client.profileForSlug('nonexistent')).rejects.toThrow(
        // eslint-disable-next-line quotes
        "Profile with slug 'nonexistent' not found: Not found"
      )
    })
  })

  describe('postForId', () => {
    it('should get post by ID', async () => {
      const mockPost = {
        id: 456,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter' as const,
        body_html: '<p>Test post body content</p>'
      }

      // Mock the PostService's getPostById method
      mockPostService.getPostById.mockResolvedValueOnce(mockPost)

      const post = await client.postForId(456)
      expect(post).toBeInstanceOf(FullPost)

      // Verify that PostService was called with the correct ID
      expect(mockPostService.getPostById).toHaveBeenCalledWith(456)
    })

    it('should handle API error for postForId', async () => {
      // Mock PostService to throw an HTTP error
      mockPostService.getPostById.mockRejectedValueOnce(new Error('HTTP 404: Not found'))

      await expect(client.postForId(999999999)).rejects.toThrow(
        'Post with ID 999999999 not found: HTTP 404: Not found'
      )
    })
  })

  describe('noteForId', () => {
    it('should get note by ID', async () => {
      const mockNoteData = {
        entity_key: '789',
        type: 'note',
        context: {
          type: 'feed',
          timestamp: '2023-01-01T00:00:00Z',
          users: [
            {
              id: 123,
              name: 'Test User',
              handle: '',
              photo_url: '',
              bio: '',
              profile_set_up_at: '2023-01-01T00:00:00Z',
              reader_installed_at: '2023-01-01T00:00:00Z'
            }
          ],
          isFresh: false,
          page: null,
          page_rank: 1
        },
        comment: {
          id: 789,
          body: 'Test note',
          type: 'feed',
          date: '2023-01-01T00:00:00Z',
          user_id: 123,
          post_id: null,
          name: 'Test User',
          handle: '',
          photo_url: '',
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
          item_primary_entity_key: '789',
          item_entity_key: '789',
          item_type: 'note',
          item_content_user_id: 123,
          item_context_type: 'feed',
          item_context_type_bucket: 'note',
          item_context_timestamp: '2023-01-01T00:00:00Z',
          item_context_user_id: 123,
          item_context_user_ids: [123],
          item_can_reply: true,
          item_is_fresh: false,
          item_last_impression_at: null,
          item_page: null,
          item_page_rank: 1,
          impression_id: 'generated',
          followed_user_count: 0,
          subscribed_publication_count: 0,
          is_following: false,
          is_explicitly_subscribed: false
        }
      }
      mockNoteService.getNoteById.mockResolvedValue(mockNoteData)

      const note = await client.noteForId(789)
      expect(note).toBeInstanceOf(Note)
      expect(mockNoteService.getNoteById).toHaveBeenCalledWith(789)

      // Verify Note properties are correctly populated
      expect(note.id).toBe('789')
      expect(note.body).toBe('Test note')
      expect(note.author.id).toBe(123)
      expect(note.author.name).toBe('Test User')
    })

    it('should handle API error for noteForId', async () => {
      mockNoteService.getNoteById.mockRejectedValue(new Error('Not found'))

      await expect(client.noteForId(999)).rejects.toThrow('Note with ID 999 not found')
    })
  })

  describe('commentForId', () => {
    it('should get comment by ID', async () => {
      const mockCommentData = {
        id: 999,
        body: 'Test comment',
        created_at: '2023-01-01T00:00:00Z',
        parent_post_id: 456,
        author_id: 123,
        author_name: 'Test User'
      }
      mockCommentService.getCommentById.mockResolvedValue(mockCommentData)

      const comment = await client.commentForId(999)
      expect(comment).toBeInstanceOf(Comment)
      expect(mockCommentService.getCommentById).toHaveBeenCalledWith(999)
    })

    it('should throw TypeError for non-number comment ID', async () => {
      await expect(client.commentForId('not-a-number' as any)).rejects.toThrow(
        new TypeError('Comment ID must be a number')
      )
    })
  })

  describe('Type validation', () => {
    it('should validate postForId parameter type', async () => {
      await expect(client.postForId('not-a-number' as any)).rejects.toThrow(
        new TypeError('Post ID must be a number')
      )
    })

    it('should validate noteForId parameter type', async () => {
      await expect(client.noteForId('not-a-number' as any)).rejects.toThrow(
        new TypeError('Note ID must be a number')
      )
    })

    it('should validate commentForId parameter type', async () => {
      await expect(client.commentForId('not-a-number' as any)).rejects.toThrow(
        new TypeError('Comment ID must be a number')
      )
    })
  })
})
