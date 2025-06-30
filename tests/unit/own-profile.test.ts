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
      request: jest.fn()
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
    expect(typeof ownProfile.followers).toBe('function')
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
      request: jest.fn()
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
      request: jest.fn()
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
    // Mock successful API response
    const mockNoteResponse = {
      id: 456,
      body: 'Test note content',
      created_at: '2023-01-01T00:00:00Z'
    }

    const mockClient = {
      post: jest.fn().mockResolvedValue(mockNoteResponse),
      get: jest.fn(),
      request: jest.fn()
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

  it('should create a mock note when API is not available', async () => {
    // Mock failed API response (fallback to mock)
    const mockClient = {
      post: jest.fn().mockRejectedValue(new Error('API not available')),
      get: jest.fn(),
      request: jest.fn()
    } as unknown as jest.Mocked<SubstackHttpClient>

    const ownProfile = new OwnProfile(mockProfileData, mockClient)
    const note = await ownProfile.createNote({
      body: 'Test note content'
    })

    expect(note).toBeInstanceOf(Note)
    expect(note.body).toBe('Test note content')
    expect(note.author.name).toBe('Test User')
  })

  it('should create a note with formatting when API fails', async () => {
    // Mock failed API response (fallback to mock)
    const mockClient = {
      post: jest.fn().mockRejectedValue(new Error('API not available')),
      get: jest.fn(),
      request: jest.fn()
    } as unknown as jest.Mocked<SubstackHttpClient>

    const ownProfile = new OwnProfile(mockProfileData, mockClient)
    const note = await ownProfile.createNote({
      body: 'Test note content',
      formatting: [{ start: 0, end: 4, type: 'bold' }]
    })

    expect(note).toBeInstanceOf(Note)
    expect(note.body).toBe('Test note content')
  })

  it('should return empty followers iterator', async () => {
    const followers = []
    for await (const follower of ownProfile.followers({ limit: 1 })) {
      followers.push(follower)
    }

    expect(followers).toHaveLength(0)
  })

  it('should iterate through followees', async () => {
    const mockResponse = {
      users: [
        {
          id: 1,
          handle: 'user1',
          name: 'User One',
          photo_url: 'https://example.com/user1.jpg'
        },
        {
          id: 2,
          handle: 'user2',
          name: 'User Two',
          photo_url: 'https://example.com/user2.jpg'
        }
      ]
    }
    const mockClient = ownProfile['client'] as jest.Mocked<any>
    mockClient.get.mockResolvedValue(mockResponse)

    const followees = []
    for await (const profile of ownProfile.followees()) {
      followees.push(profile)
    }

    expect(followees).toHaveLength(2)
    expect(followees[0]).toBeInstanceOf(Profile)
    expect(followees[0].name).toBe('User One')
    expect(followees[1].name).toBe('User Two')
    expect(mockClient.get).toHaveBeenCalledWith('/api/v1/reader/user_following')
  })

  it('should handle empty followees response', async () => {
    const mockResponse = { users: [] }
    const mockClient = ownProfile['client'] as jest.Mocked<any>
    mockClient.get.mockResolvedValue(mockResponse)

    const followees = []
    for await (const profile of ownProfile.followees()) {
      followees.push(profile)
    }

    expect(followees).toHaveLength(0)
  })
})
