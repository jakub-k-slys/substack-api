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

  it('should throw error when creating post (not implemented)', async () => {
    await expect(
      ownProfile.createPost({
        title: 'Test Post',
        body: 'Test content'
      })
    ).rejects.toThrow('Post creation not implemented yet - requires post creation API')
  })

  it('should create a note', async () => {
    const note = await ownProfile.createNote({
      body: 'Test note content'
    })

    expect(note).toBeInstanceOf(Note)
    expect(note.body).toBe('Test note content')
    expect(note.author.name).toBe('Test User')
  })

  it('should create a note with formatting', async () => {
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
