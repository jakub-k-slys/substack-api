import { OwnProfile } from '../../src/entities/own-profile'
import { Note } from '../../src/entities/note'
import { Profile } from '../../src/entities/profile'
import type { SubstackFullProfile } from '../../src/types'
import type { SubstackHttpClient } from '../../src/http-client'

describe('OwnProfile Entity', () => {
  let mockProfileData: SubstackFullProfile
  let ownProfile: OwnProfile

  beforeEach(() => {
    mockProfileData = {
      id: 123,
      name: 'Test User',
      handle: 'testuser',
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
      max_pub_tier: 1,
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
    } as SubstackFullProfile

    // Mock the legacy client
    const mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    } as unknown as jest.Mocked<SubstackHttpClient>

    ownProfile = new OwnProfile(mockProfileData, mockClient)
  })

  it('should inherit from Profile', () => {
    expect(ownProfile.id).toBe(123)
    expect(ownProfile.name).toBe('Test User')
    expect(ownProfile.slug).toBe('testuser')
  })

  it('should have additional write methods', () => {
    expect(typeof ownProfile.createPost).toBe('function')
    expect(typeof ownProfile.createNote).toBe('function')
    expect(typeof ownProfile.followees).toBe('function')
  })

  it('should create post when API is available', async () => {
    // Mock successful API response
    const mockPost = {
      id: 123,
      title: 'Test Post',
      slug: 'test-post',
      post_date: '2023-01-01T00:00:00Z',
      canonical_url: 'https://example.com/post',
      type: 'newsletter' as const
    }

    // Mock the post method to return a successful response
    const mockClient = {
      post: jest.fn().mockResolvedValue(mockPost),
      get: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    } as unknown as jest.Mocked<SubstackHttpClient>

    const ownProfile = new OwnProfile(mockProfileData, mockClient)
    const post = await ownProfile.createPost({
      title: 'Test Post',
      body: 'Test content'
    })

    expect(post).toBeDefined()
    expect(post.title).toBe('Test Post')
    expect(mockClient.post).toHaveBeenCalledWith('/api/v1/posts', {
      title: 'Test Post',
      body: 'Test content',
      subtitle: '',
      draft: false,
      type: 'newsletter'
    })
  })

  it('should handle post creation failure gracefully', async () => {
    // Mock failed API response
    const mockClient = {
      post: jest.fn().mockRejectedValue(new Error('API Error')),
      get: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    } as unknown as jest.Mocked<SubstackHttpClient>

    const ownProfile = new OwnProfile(mockProfileData, mockClient)

    await expect(
      ownProfile.createPost({
        title: 'Test Post',
        body: 'Test content'
      })
    ).rejects.toThrow('Failed to create post: API Error')
  })

  it('should create a note via API when available', async () => {
    // Mock successful API response with proper SubstackNote structure
    const mockNoteResponse = {
      entity_key: '456',
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
        id: 456,
        body: 'Test note content',
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
        item_primary_entity_key: '456',
        item_entity_key: '456',
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

    const mockClient = {
      post: jest.fn().mockResolvedValue(mockNoteResponse),
      get: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    } as unknown as jest.Mocked<SubstackHttpClient>

    const ownProfile = new OwnProfile(mockProfileData, mockClient)
    const note = await ownProfile.createNote({
      body: 'Test note content'
    })

    expect(note).toBeInstanceOf(Note)
    expect(mockClient.post).toHaveBeenCalledWith('/api/v1/notes', {
      body: 'Test note content',
      formatting: [],
      type: 'note'
    })
  })

  it('should throw error when note creation API is not available', async () => {
    // Mock failed API response
    const mockClient = {
      post: jest.fn().mockRejectedValue(new Error('API not available')),
      get: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    } as unknown as jest.Mocked<SubstackHttpClient>

    const ownProfile = new OwnProfile(mockProfileData, mockClient)

    await expect(
      ownProfile.createNote({
        body: 'Test note content'
      })
    ).rejects.toThrow('Failed to create note: API not available')
  })

  it('should throw error when note creation with formatting fails', async () => {
    // Mock failed API response
    const mockClient = {
      post: jest.fn().mockRejectedValue(new Error('API not available')),
      get: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    } as unknown as jest.Mocked<SubstackHttpClient>

    const ownProfile = new OwnProfile(mockProfileData, mockClient)

    await expect(
      ownProfile.createNote({
        body: 'Test note content',
        formatting: [{ start: 0, end: 4, type: 'bold' }]
      })
    ).rejects.toThrow('Failed to create note: API not available')
  })

  it('should iterate through followees using correct endpoint chain', async () => {
    // Mock the response from /api/v1/feed/following (returns array of user IDs)
    const mockFollowingIds = [1, 2]

    // Mock the responses from /api/v1/user/{id}/profile
    const mockProfile1 = {
      id: 1,
      handle: 'user1',
      name: 'User One',
      photo_url: 'https://example.com/user1.jpg',
      bio: 'Bio for User One',
      profile_set_up_at: '2023-01-01T00:00:00Z',
      reader_installed_at: '2023-01-01T00:00:00Z',
      profile_disabled: false,
      publicationUsers: [],
      userLinks: [],
      subscriptions: [],
      subscriptionsTruncated: false,
      hasGuestPost: false,
      max_pub_tier: 1,
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
      slug: 'user1',
      primaryPublicationIsPledged: false,
      primaryPublicationSubscriptionState: 'none',
      isSubscribed: false,
      isFollowing: false,
      followsViewer: false,
      can_dm: false,
      dm_upgrade_options: []
    } as SubstackFullProfile

    const mockProfile2 = {
      id: 2,
      handle: 'user2',
      name: 'User Two',
      photo_url: 'https://example.com/user2.jpg',
      bio: 'Bio for User Two',
      profile_set_up_at: '2023-01-01T00:00:00Z',
      reader_installed_at: '2023-01-01T00:00:00Z',
      profile_disabled: false,
      publicationUsers: [],
      userLinks: [],
      subscriptions: [],
      subscriptionsTruncated: false,
      hasGuestPost: false,
      max_pub_tier: 1,
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
      slug: 'user2',
      primaryPublicationIsPledged: false,
      primaryPublicationSubscriptionState: 'none',
      isSubscribed: false,
      isFollowing: false,
      followsViewer: false,
      can_dm: false,
      dm_upgrade_options: []
    } as SubstackFullProfile

    const mockClient = ownProfile['client'] as jest.Mocked<SubstackHttpClient>

    // Setup mock to return different responses based on the endpoint
    mockClient.get.mockImplementation((url: string) => {
      if (url === '/api/v1/feed/following') {
        return Promise.resolve(mockFollowingIds)
      } else if (url === '/api/v1/user/1/profile') {
        return Promise.resolve(mockProfile1)
      } else if (url === '/api/v1/user/2/profile') {
        return Promise.resolve(mockProfile2)
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`))
    })

    const followees = []
    for await (const profile of ownProfile.followees()) {
      followees.push(profile)
    }

    expect(followees).toHaveLength(2)
    expect(followees[0]).toBeInstanceOf(Profile)
    expect(followees[0].name).toBe('User One')
    expect(followees[1].name).toBe('User Two')

    // Verify correct API calls were made
    expect(mockClient.get).toHaveBeenCalledWith('/api/v1/feed/following')
    expect(mockClient.get).toHaveBeenCalledWith('/api/v1/user/1/profile')
    expect(mockClient.get).toHaveBeenCalledWith('/api/v1/user/2/profile')
    expect(mockClient.get).toHaveBeenCalledTimes(3)
  })

  it('should handle empty followees response', async () => {
    const mockClient = ownProfile['client'] as jest.Mocked<SubstackHttpClient>
    mockClient.get.mockResolvedValue([]) // Empty array of user IDs

    const followees = []
    for await (const profile of ownProfile.followees()) {
      followees.push(profile)
    }

    expect(followees).toHaveLength(0)
    expect(mockClient.get).toHaveBeenCalledWith('/api/v1/feed/following')
    expect(mockClient.get).toHaveBeenCalledTimes(1) // Only the first call should be made
  })

  it('should handle profile fetch errors gracefully', async () => {
    // Mock the first call to return user IDs
    const mockFollowingIds = [1, 2, 3]

    const mockClient = ownProfile['client'] as jest.Mocked<SubstackHttpClient>

    // Setup mock where one profile fetch fails
    mockClient.get.mockImplementation((url: string) => {
      if (url === '/api/v1/feed/following') {
        return Promise.resolve(mockFollowingIds)
      } else if (url === '/api/v1/user/1/profile') {
        return Promise.resolve({
          id: 1,
          handle: 'user1',
          name: 'User One',
          photo_url: 'https://example.com/user1.jpg',
          bio: 'Bio for User One',
          profile_set_up_at: '2023-01-01T00:00:00Z',
          reader_installed_at: '2023-01-01T00:00:00Z',
          profile_disabled: false,
          publicationUsers: [],
          userLinks: [],
          subscriptions: [],
          subscriptionsTruncated: false,
          hasGuestPost: false,
          max_pub_tier: 1,
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
          slug: 'user1',
          primaryPublicationIsPledged: false,
          primaryPublicationSubscriptionState: 'none',
          isSubscribed: false,
          isFollowing: false,
          followsViewer: false,
          can_dm: false,
          dm_upgrade_options: []
        } as SubstackFullProfile)
      } else if (url === '/api/v1/user/2/profile') {
        // This one fails (e.g., deleted account)
        return Promise.reject(new Error('Profile not found'))
      } else if (url === '/api/v1/user/3/profile') {
        return Promise.resolve({
          id: 3,
          handle: 'user3',
          name: 'User Three',
          photo_url: 'https://example.com/user3.jpg',
          bio: 'Bio for User Three',
          profile_set_up_at: '2023-01-01T00:00:00Z',
          reader_installed_at: '2023-01-01T00:00:00Z',
          profile_disabled: false,
          publicationUsers: [],
          userLinks: [],
          subscriptions: [],
          subscriptionsTruncated: false,
          hasGuestPost: false,
          max_pub_tier: 1,
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
          slug: 'user3',
          primaryPublicationIsPledged: false,
          primaryPublicationSubscriptionState: 'none',
          isSubscribed: false,
          isFollowing: false,
          followsViewer: false,
          can_dm: false,
          dm_upgrade_options: []
        } as SubstackFullProfile)
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`))
    })

    const followees = []
    for await (const profile of ownProfile.followees()) {
      followees.push(profile)
    }

    // Should get 2 profiles (skipping the failed one)
    expect(followees).toHaveLength(2)
    expect(followees[0].name).toBe('User One')
    expect(followees[1].name).toBe('User Three')

    // Verify all API calls were attempted
    expect(mockClient.get).toHaveBeenCalledWith('/api/v1/feed/following')
    expect(mockClient.get).toHaveBeenCalledWith('/api/v1/user/1/profile')
    expect(mockClient.get).toHaveBeenCalledWith('/api/v1/user/2/profile')
    expect(mockClient.get).toHaveBeenCalledWith('/api/v1/user/3/profile')
    expect(mockClient.get).toHaveBeenCalledTimes(4)
  })

  it('should use slug resolver for followees when available', async () => {
    // Create a mock slug resolver
    const mockSlugResolver = jest.fn()

    // Setup mock slug resolver to return different slugs than the handle
    mockSlugResolver.mockImplementation((userId: number, fallbackHandle?: string) => {
      if (userId === 1) return Promise.resolve('resolved-slug-1')
      if (userId === 2) return Promise.resolve('resolved-slug-2')
      return Promise.resolve(fallbackHandle)
    })

    // Create OwnProfile with the slug resolver
    const ownProfileWithResolver = new OwnProfile(
      mockProfileData,
      {
        get: jest.fn(),
        post: jest.fn(),
        request: jest.fn(),
        getPerPage: jest.fn().mockReturnValue(25)
      } as unknown as jest.Mocked<SubstackHttpClient>,
      'resolved-own-slug',
      mockSlugResolver
    )

    const mockClient = ownProfileWithResolver['client'] as jest.Mocked<SubstackHttpClient>

    // Mock the following endpoint and profile endpoints
    const mockFollowingIds = [1, 2]
    mockClient.get.mockImplementation((url: string) => {
      if (url === '/api/v1/feed/following') {
        return Promise.resolve(mockFollowingIds)
      } else if (url === '/api/v1/user/1/profile') {
        return Promise.resolve({
          id: 1,
          handle: 'user1',
          name: 'User One',
          photo_url: 'https://example.com/user1.jpg'
        } as SubstackFullProfile)
      } else if (url === '/api/v1/user/2/profile') {
        return Promise.resolve({
          id: 2,
          handle: 'user2',
          name: 'User Two',
          photo_url: 'https://example.com/user2.jpg'
        } as SubstackFullProfile)
      }
      return Promise.reject(new Error(`Unexpected URL: ${url}`))
    })

    const followees = []
    for await (const profile of ownProfileWithResolver.followees()) {
      followees.push(profile)
    }

    expect(followees).toHaveLength(2)

    // Check that the slug resolver was called for each user
    expect(mockSlugResolver).toHaveBeenCalledWith(1, 'user1')
    expect(mockSlugResolver).toHaveBeenCalledWith(2, 'user2')
    expect(mockSlugResolver).toHaveBeenCalledTimes(2)

    // Check that the resolved slugs are used
    expect(followees[0].slug).toBe('resolved-slug-1')
    expect(followees[1].slug).toBe('resolved-slug-2')
  })
})
