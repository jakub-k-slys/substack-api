import { SubstackClient } from '../../src/substack-client'
import { Profile, Post, Note, Comment, OwnProfile } from '../../src/entities'
import { SubstackHttpClient } from '../../src/http-client'

// Mock the http client
jest.mock('../../src/http-client')

describe('SubstackClient', () => {
  let client: SubstackClient
  let mockHttpClient: jest.Mocked<SubstackHttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockHttpClient = new SubstackHttpClient({
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<SubstackHttpClient>
    mockHttpClient.get = jest.fn()
    mockHttpClient.post = jest.fn()
    mockHttpClient.request = jest.fn()

    client = new SubstackClient({
      apiKey: 'test-api-key',
      hostname: 'test.substack.com'
    })
    // Replace the internal http client with our mock
    ;(client as unknown as { httpClient: SubstackHttpClient }).httpClient = mockHttpClient
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
      mockHttpClient.get
        .mockResolvedValueOnce(mockSubscription) // First call to /api/v1/subscription
        .mockResolvedValueOnce(mockProfile) // Second call to /api/v1/user/{id}/profile

      const ownProfile = await client.ownProfile()
      expect(ownProfile).toBeInstanceOf(OwnProfile)
      expect(ownProfile.id).toBe(123)
      expect(ownProfile.name).toBe('Test User')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/subscription')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/123/profile')
    })

    it('should throw error when authentication fails', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Unauthorized'))

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
      mockHttpClient.get.mockResolvedValue(mockProfile)

      const profile = await client.profileForId(123)
      expect(profile).toBeInstanceOf(Profile)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/123/profile')
    })

    it('should handle API error for profileForId', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'))

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
      mockHttpClient.get.mockResolvedValue(mockProfile)

      const profile = await client.profileForId(9876543210)
      expect(profile).toBeInstanceOf(Profile)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/9876543210/profile')
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
      mockHttpClient.get.mockResolvedValue(mockProfile)

      const profile = await client.profileForSlug('testuser')
      expect(profile).toBeInstanceOf(Profile)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/user/testuser/public_profile')
    })

    it('should handle empty slug', async () => {
      await expect(client.profileForSlug('')).rejects.toThrow('Profile slug cannot be empty')
      await expect(client.profileForSlug('   ')).rejects.toThrow('Profile slug cannot be empty')
    })

    it('should handle API error for profileForSlug', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'))

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
      mockHttpClient.get.mockResolvedValue(mockPost)

      const post = await client.postForId('456')
      expect(post).toBeInstanceOf(Post)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/456')
    })
  })

  describe('noteForId', () => {
    it('should get note by ID', async () => {
      const mockNote = {
        entity_key: '789',
        type: 'note',
        context: {
          type: 'feed',
          timestamp: '2023-01-01T00:00:00Z',
          users: [
            {
              id: 123,
              name: 'Test User',
              handle: 'testuser',
              photo_url: 'https://example.com/photo.jpg',
              bio: 'Test bio',
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
          id: 789,
          body: 'Test note',
          user_id: 123,
          type: 'feed',
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
          impression_id: 'test-impression',
          followed_user_count: 0,
          subscribed_publication_count: 0,
          is_following: false,
          is_explicitly_subscribed: false
        }
      }
      mockHttpClient.get.mockResolvedValue(mockNote)

      const note = await client.noteForId('789')
      expect(note).toBeInstanceOf(Note)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/notes/789')
    })

    it('should handle API error for noteForId', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'))

      await expect(client.noteForId('999')).rejects.toThrow('Note with ID 999 not found')
    })
  })

  describe('commentForId', () => {
    it('should get comment by ID', async () => {
      const mockComment = {
        id: 999,
        body: 'Test comment',
        created_at: '2023-01-01T00:00:00Z',
        parent_post_id: 456,
        author: { id: 123, name: 'Test User' }
      }
      mockHttpClient.get.mockResolvedValue(mockComment)

      const comment = await client.commentForId('999')
      expect(comment).toBeInstanceOf(Comment)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/comment/999')
    })
  })
})
