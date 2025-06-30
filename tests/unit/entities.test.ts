import { SubstackClient } from '../../src/substack-client'
import { Profile, Post, Note, Comment } from '../../src/entities'

describe('SubstackClient Entity Model', () => {
  let client: SubstackClient

  beforeEach(() => {
    client = new SubstackClient({
      apiKey: 'test-api-key'
    })
    global.fetch = jest.fn()
  })

  describe('SubstackClient', () => {
    it('should create a client instance', () => {
      expect(client).toBeInstanceOf(SubstackClient)
    })

    it('should have all required methods', () => {
      expect(typeof client.ownProfile).toBe('function')
      expect(typeof client.profileForId).toBe('function')
      expect(typeof client.profileForSlug).toBe('function')
      expect(typeof client.postForId).toBe('function')
      expect(typeof client.noteForId).toBe('function')
      expect(typeof client.commentForId).toBe('function')
      expect(typeof client.followees).toBe('function')
      expect(typeof client.testConnectivity).toBe('function')
    })

    it('should test connectivity returning false on error', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const result = await client.testConnectivity()
      expect(result).toBe(false)
    })

    it('should test connectivity returning true on success', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([{ id: 1, title: 'Test Post' }])
      })

      const result = await client.testConnectivity()
      expect(result).toBe(true)
    })

    it('should get profile by slug', async () => {
      const mockProfile = {
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

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockProfile)
      })

      const profile = await client.profileForSlug('testuser')
      expect(profile).toBeInstanceOf(Profile)
      expect(profile.id).toBe(123)
      expect(profile.name).toBe('Test User')
      expect(profile.slug).toBe('testuser')
      expect(profile.avatarUrl).toBe('https://example.com/photo.jpg')
      expect(profile.bio).toBe('Test bio')
    })
  })

  describe('Profile Entity', () => {
    let mockProfileData: any
    let profile: Profile

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
        getPosts: jest.fn(),
        getNotes: jest.fn()
      }

      profile = new Profile(mockProfileData, mockClient as any)
    })

    it('should extract profile data correctly', () => {
      expect(profile.id).toBe(123)
      expect(profile.name).toBe('Test User')
      expect(profile.slug).toBe('testuser')
      expect(profile.url).toBe('https://substack.com/@testuser')
      expect(profile.avatarUrl).toBe('https://example.com/photo.jpg')
      expect(profile.bio).toBe('Test bio')
    })

    it('should have async iterator methods', () => {
      expect(typeof profile.posts).toBe('function')
      expect(typeof profile.notes).toBe('function')
    })
  })

  describe('Post Entity', () => {
    let mockPostData: any
    let post: Post

    beforeEach(() => {
      mockPostData = {
        id: 456,
        title: 'Test Post',
        subtitle: 'Test subtitle',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        description: 'Test description',
        canonical_url: 'https://example.substack.com/p/test-post',
        type: 'newsletter' as const,
        published: true,
        paywalled: false
      }

      const mockClient = {
        getComments: jest.fn()
      }

      post = new Post(mockPostData, mockClient as any)
    })

    it('should extract post data correctly', () => {
      expect(post.id).toBe(456)
      expect(post.title).toBe('Test Post')
      expect(post.body).toBe('Test description')
      expect(post.publishedAt).toEqual(new Date('2023-01-01T00:00:00Z'))
    })

    it('should have async iterator and action methods', () => {
      expect(typeof post.comments).toBe('function')
      expect(typeof post.like).toBe('function')
      expect(typeof post.addComment).toBe('function')
    })
  })

  describe('Note Entity', () => {
    let mockNoteData: any
    let note: Note

    beforeEach(() => {
      mockNoteData = {
        entity_key: 'note_123',
        type: 'note',
        context: {
          type: 'note',
          timestamp: '2023-01-01T00:00:00Z',
          users: [
            {
              id: 789,
              name: 'Note Author',
              handle: 'noteauthor',
              photo_url: 'https://example.com/author.jpg'
            }
          ],
          isFresh: true,
          page_rank: 0
        },
        comment: {
          body: 'Test note content'
        },
        parentComments: []
      }

      const mockClient = {}
      note = new Note(mockNoteData, mockClient as any)
    })

    it('should extract note data correctly', () => {
      expect(note.id).toBe('note_123')
      expect(note.body).toBe('Test note content')
      expect(note.publishedAt).toEqual(new Date('2023-01-01T00:00:00Z'))
      expect(note.author.id).toBe(789)
      expect(note.author.name).toBe('Note Author')
      expect(note.author.handle).toBe('noteauthor')
    })

    it('should have async iterator and action methods', () => {
      expect(typeof note.comments).toBe('function')
      expect(typeof note.like).toBe('function')
      expect(typeof note.addComment).toBe('function')
    })
  })

  describe('Comment Entity', () => {
    let mockCommentData: any
    let comment: Comment

    beforeEach(() => {
      mockCommentData = {
        id: 789,
        body: 'Test comment',
        created_at: '2023-01-01T00:00:00Z',
        parent_post_id: 456,
        author: {
          id: 321,
          name: 'Commenter',
          is_admin: false
        }
      }

      const mockClient = {}
      comment = new Comment(mockCommentData, mockClient as any)
    })

    it('should extract comment data correctly', () => {
      expect(comment.id).toBe(789)
      expect(comment.body).toBe('Test comment')
      expect(comment.createdAt).toEqual(new Date('2023-01-01T00:00:00Z'))
      expect(comment.author.id).toBe(321)
      expect(comment.author.name).toBe('Commenter')
      expect(comment.author.isAdmin).toBe(false)
    })
  })
})
