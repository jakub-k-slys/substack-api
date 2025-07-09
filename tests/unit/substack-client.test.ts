import { SubstackClient } from '../../src/substack-client'
import { Profile, Post, Note, Comment, OwnProfile } from '../../src/domain'
import { SubstackHttpClient } from '../../src/http-client'
import { PostService, NoteService, ProfileService } from '../../src/services'

// Mock the http client and services
jest.mock('../../src/http-client')
jest.mock('../../src/services')

// Mock the global fetch function
global.fetch = jest.fn()

describe('SubstackClient', () => {
  let client: SubstackClient
  let mockHttpClient: jest.Mocked<SubstackHttpClient>
  let mockGlobalHttpClient: jest.Mocked<SubstackHttpClient>
  let mockPostService: jest.Mocked<PostService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockProfileService: jest.Mocked<ProfileService>

  beforeEach(() => {
    jest.clearAllMocks()
    mockHttpClient = new SubstackHttpClient('https://test.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<SubstackHttpClient>
    mockHttpClient.get = jest.fn()
    mockHttpClient.post = jest.fn()
    mockHttpClient.request = jest.fn()

    mockGlobalHttpClient = new SubstackHttpClient('https://substack.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<SubstackHttpClient>
    mockGlobalHttpClient.get = jest.fn()
    mockGlobalHttpClient.post = jest.fn()
    mockGlobalHttpClient.request = jest.fn()

    mockPostService = new PostService(
      mockHttpClient,
      mockGlobalHttpClient
    ) as jest.Mocked<PostService>
    mockPostService.getPostById = jest.fn()

    mockNoteService = new NoteService(
      mockHttpClient,
      mockGlobalHttpClient
    ) as jest.Mocked<NoteService>
    mockNoteService.getNoteById = jest.fn()

    mockProfileService = new ProfileService(
      mockHttpClient,
      mockGlobalHttpClient
    ) as jest.Mocked<ProfileService>
    mockProfileService.getOwnProfile = jest.fn()
    mockProfileService.getProfileById = jest.fn()
    mockProfileService.getProfileBySlug = jest.fn()

    client = new SubstackClient({
      apiKey: 'test-api-key',
      hostname: 'test.substack.com'
    })
    // Replace the internal http clients and services with our mocks
    ;(client as unknown as { httpClient: SubstackHttpClient }).httpClient = mockHttpClient
    ;(client as unknown as { globalHttpClient: SubstackHttpClient }).globalHttpClient =
      mockGlobalHttpClient
    ;(client as unknown as { postService: PostService }).postService = mockPostService
    ;(client as unknown as { noteService: NoteService }).noteService = mockNoteService
    ;(client as unknown as { profileService: ProfileService }).profileService = mockProfileService
  })

  describe('testConnectivity', () => {
    it('should return true when API is accessible', async () => {
      mockHttpClient.get.mockResolvedValue({})
      const result = await client.testConnectivity()
      expect(result).toBe(true)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/feed/following')
    })

    it('should return false when API is not accessible', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Network error'))
      const result = await client.testConnectivity()
      expect(result).toBe(false)
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
      mockHttpClient.get.mockResolvedValueOnce(mockSubscription) // For slug resolution

      const ownProfile = await client.ownProfile()
      expect(ownProfile).toBeInstanceOf(OwnProfile)
      expect(ownProfile.id).toBe(123)
      expect(ownProfile.name).toBe('Test User')
      expect(mockProfileService.getOwnProfile).toHaveBeenCalled()
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/subscription')
    })

    it('should throw error when authentication fails', async () => {
      mockProfileService.getOwnProfile.mockRejectedValue(new Error('Unauthorized'))

      await expect(client.ownProfile()).rejects.toThrow('Failed to get own profile: Unauthorized')
    })
  })

  describe('profileForId', () => {
    it('should get profile by numeric ID', async () => {
      const mockProfile = {
        id: 123,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getProfileById.mockResolvedValue(mockProfile)

      const profile = await client.profileForId(123)
      expect(profile).toBeInstanceOf(Profile)
      expect(mockProfileService.getProfileById).toHaveBeenCalledWith(123)
    })

    it('should handle API error for profileForId', async () => {
      mockProfileService.getProfileById.mockRejectedValue(new Error('Not found'))

      await expect(client.profileForId(999)).rejects.toThrow(
        'Profile with ID 999 not found: Not found'
      )
    })

    it('should accept large numeric IDs', async () => {
      const mockProfile = {
        id: 9876543210,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getProfileById.mockResolvedValue(mockProfile)

      const profile = await client.profileForId(9876543210)
      expect(profile).toBeInstanceOf(Profile)
      expect(mockProfileService.getProfileById).toHaveBeenCalledWith(9876543210)
    })
  })

  describe('profileForSlug', () => {
    it('should get profile by slug', async () => {
      const mockProfile = {
        id: 123,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getProfileBySlug.mockResolvedValue(mockProfile)

      const profile = await client.profileForSlug('testuser')
      expect(profile).toBeInstanceOf(Profile)
      expect(mockProfileService.getProfileBySlug).toHaveBeenCalledWith('testuser')
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
        type: 'newsletter' as const
      }

      // Mock the PostService's getPostById method
      mockPostService.getPostById.mockResolvedValueOnce(mockPost)

      const post = await client.postForId(456)
      expect(post).toBeInstanceOf(Post)

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
      const mockCommentResponse = {
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
      mockHttpClient.get.mockResolvedValue(mockCommentResponse)

      const comment = await client.commentForId(999)
      expect(comment).toBeInstanceOf(Comment)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/comment/999')
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
