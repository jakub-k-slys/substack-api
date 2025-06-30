import { OwnProfile } from '../../src/entities/own-profile'
import { Note } from '../../src/entities/note'

describe('OwnProfile Entity', () => {
  let mockProfileData: any
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
      userLinks: []
    }

    // Mock the legacy client
    const mockClient = {
      publishNote: jest.fn()
    }

    ownProfile = new OwnProfile(mockProfileData, mockClient as any)
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
      get: jest.fn()
    }

    const ownProfile = new OwnProfile(mockProfileData, mockClient as any)
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
      get: jest.fn()
    }

    const ownProfile = new OwnProfile(mockProfileData, mockClient as any)

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
      get: jest.fn()
    }

    const ownProfile = new OwnProfile(mockProfileData, mockClient as any)
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
      get: jest.fn()
    }

    const ownProfile = new OwnProfile(mockProfileData, mockClient as any)
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
      get: jest.fn()
    }

    const ownProfile = new OwnProfile(mockProfileData, mockClient as any)
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
})
