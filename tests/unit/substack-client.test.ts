import { SubstackClient } from '../../src/substack-client'
import { Profile, Post, Note, Comment, OwnProfile } from '../../src/domain'
import { SubstackHttpClient } from '../../src/http-client'

// Mock the http client
jest.mock('../../src/http-client')

// Mock the global fetch function
global.fetch = jest.fn()

describe('SubstackClient', () => {
  let client: SubstackClient
  let mockHttpClient: jest.Mocked<SubstackHttpClient>
  let mockGlobalHttpClient: jest.Mocked<SubstackHttpClient>

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

    client = new SubstackClient({
      apiKey: 'test-api-key',
      hostname: 'test.substack.com'
    })
    // Replace the internal http clients with our mocks
    ;(client as unknown as { httpClient: SubstackHttpClient }).httpClient = mockHttpClient
    ;(client as unknown as { globalHttpClient: SubstackHttpClient }).globalHttpClient =
      mockGlobalHttpClient
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

      // Mock the global HTTP client's get method for postForId
      mockGlobalHttpClient.get.mockResolvedValueOnce(mockPost)

      const post = await client.postForId('456')
      expect(post).toBeInstanceOf(Post)

      // Verify that global HTTP client was called with the correct path
      expect(mockGlobalHttpClient.get).toHaveBeenCalledWith('/api/v1/posts/by-id/456')
    })

    it('should handle API error for postForId', async () => {
      // Mock global HTTP client to throw an HTTP error
      mockGlobalHttpClient.get.mockRejectedValueOnce(new Error('HTTP 404: Not found'))

      await expect(client.postForId('nonexistent')).rejects.toThrow(
        'Post with ID nonexistent not found: HTTP 404: Not found'
      )
    })
  })

  describe('noteForId', () => {
    it('should get note by ID', async () => {
      const mockNoteResponse = {
        item: {
          comment: {
            id: 789,
            body: 'Test note',
            user_id: 123,
            name: 'Test User',
            date: '2023-01-01T00:00:00Z',
            post_id: null
          }
        }
      }
      mockHttpClient.get.mockResolvedValue(mockNoteResponse)

      const note = await client.noteForId('789')
      expect(note).toBeInstanceOf(Note)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/comment/789')

      // Verify Note properties are correctly populated
      expect(note.id).toBe('789')
      expect(note.body).toBe('Test note')
      expect(note.author.id).toBe(123)
      expect(note.author.name).toBe('Test User')
    })

    it('should handle API error for noteForId', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'))

      await expect(client.noteForId('999')).rejects.toThrow('Note with ID 999 not found')
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

      const comment = await client.commentForId('999')
      expect(comment).toBeInstanceOf(Comment)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/comment/999')
    })
  })
})
