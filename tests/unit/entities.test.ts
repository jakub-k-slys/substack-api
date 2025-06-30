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
      const mockClient = client as any
      // Mock getPosts to throw an error when called
      mockClient.legacyClient.getPosts = jest.fn().mockImplementation(() => {
        throw new Error('Network error')
      })

      const result = await client.testConnectivity()
      expect(result).toBe(false)
    })

    it('should test connectivity returning true on success', async () => {
      const mockClient = client as any
      mockClient.legacyClient.getPosts = jest.fn().mockReturnValue({
        async *[Symbol.asyncIterator]() {
          yield { id: 1, title: 'Test Post' }
        }
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

      const mockClient = client as any
      mockClient.legacyClient.getPublicProfile = jest.fn().mockResolvedValue(mockProfile)

      const profile = await client.profileForSlug('testuser')
      expect(profile).toBeInstanceOf(Profile)
      expect(profile.id).toBe(123)
      expect(profile.name).toBe('Test User')
      expect(profile.slug).toBe('testuser')
      expect(profile.avatarUrl).toBe('https://example.com/photo.jpg')
      expect(profile.bio).toBe('Test bio')
    })

    it('should get profile by id', async () => {
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

      const mockClient = client as any
      mockClient.legacyClient.getFullProfileById = jest.fn().mockResolvedValue(mockProfile)

      const profile = await client.profileForId('123')
      expect(profile).toBeInstanceOf(Profile)
      expect(profile.id).toBe(123)
    })

    it('should handle invalid profile id', async () => {
      await expect(client.profileForId('invalid')).rejects.toThrow(
        'Invalid user ID - must be numeric'
      )
    })

    it('should handle profile not found by id', async () => {
      const mockClient = client as any
      mockClient.legacyClient.getFullProfileById = jest
        .fn()
        .mockRejectedValue(new Error('Not found'))

      await expect(client.profileForId('999')).rejects.toThrow('Profile with ID 999 not found')
    })

    it('should get post by id', async () => {
      const mockPost = {
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

      const mockClient = client as any
      mockClient.legacyClient.getPost = jest.fn().mockResolvedValue(mockPost)

      const post = await client.postForId('test-post')
      expect(post).toBeInstanceOf(Post)
      expect(post.id).toBe(456)
    })

    it('should get comment by id', async () => {
      const mockComment = {
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

      const mockClient = client as any
      mockClient.legacyClient.getComment = jest.fn().mockResolvedValue(mockComment)

      const comment = await client.commentForId('789')
      expect(comment).toBeInstanceOf(Comment)
      expect(comment.id).toBe(789)
    })

    it('should handle invalid comment id', async () => {
      await expect(client.commentForId('invalid')).rejects.toThrow(
        'Invalid comment ID - must be numeric'
      )
    })

    it('should get note by id', async () => {
      const mockNote = {
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

      // Mock the getNotes iterator
      const mockClient = client as any
      mockClient.legacyClient.getNotes = jest.fn().mockImplementation(function* () {
        yield mockNote
      })

      const note = await client.noteForId('note_123')
      expect(note).toBeInstanceOf(Note)
      expect(note.id).toBe('note_123')
    })

    it('should handle note not found', async () => {
      // Mock empty iterator
      const mockClient = client as any
      mockClient.legacyClient.getNotes = jest.fn().mockImplementation(function* () {
        // Empty iterator
      })

      await expect(client.noteForId('nonexistent')).rejects.toThrow(
        'Note with ID nonexistent not found'
      )
    })

    it('should get followees', async () => {
      const mockFollowing = [
        {
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
      ]

      const mockClient = client as any
      mockClient.legacyClient.getFollowingProfiles = jest.fn().mockResolvedValue(mockFollowing)

      const followees = []
      for await (const profile of client.followees({ limit: 1 })) {
        followees.push(profile)
      }

      expect(followees).toHaveLength(1)
      expect(followees[0]).toBeInstanceOf(Profile)
      expect(followees[0].id).toBe(123)
    })

    it('should get own profile with following profiles fallback', async () => {
      const mockFollowing = [
        {
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
      ]

      const mockClient = client as any
      mockClient.legacyClient.getFollowingProfiles = jest.fn().mockResolvedValue(mockFollowing)

      const ownProfile = await client.ownProfile()
      expect(ownProfile.id).toBe(123)
    })

    it('should get own profile with mock fallback when no following profiles', async () => {
      const mockClient = client as any
      mockClient.legacyClient.getFollowingProfiles = jest.fn().mockResolvedValue([])

      const ownProfile = await client.ownProfile()
      expect(ownProfile.id).toBe(0)
      expect(ownProfile.name).toBe('Unknown User')
    })

    it('should get own profile with mock fallback on error', async () => {
      const mockClient = client as any
      mockClient.legacyClient.getFollowingProfiles = jest
        .fn()
        .mockRejectedValue(new Error('API Error'))

      const ownProfile = await client.ownProfile()
      expect(ownProfile.id).toBe(0)
      expect(ownProfile.name).toBe('Unknown User')
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

    it('should iterate over posts', async () => {
      const mockPost = {
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

      const mockClient = profile as any
      mockClient.client.getPosts = jest.fn().mockImplementation(function* () {
        yield mockPost
      })

      const posts = []
      for await (const post of profile.posts({ limit: 1 })) {
        posts.push(post)
      }

      expect(posts).toHaveLength(1)
      expect(posts[0]).toBeInstanceOf(Post)
    })

    it('should iterate over notes filtering by user id', async () => {
      const mockNote = {
        entity_key: 'note_123',
        type: 'note',
        context: {
          type: 'note',
          timestamp: '2023-01-01T00:00:00Z',
          users: [
            {
              id: 123, // Matches profile id
              name: 'Test User',
              handle: 'testuser',
              photo_url: 'https://example.com/photo.jpg'
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

      const mockClient = profile as any
      mockClient.client.getNotes = jest.fn().mockImplementation(function* () {
        yield mockNote
      })

      const notes = []
      for await (const note of profile.notes({ limit: 1 })) {
        notes.push(note)
      }

      expect(notes).toHaveLength(1)
      expect(notes[0]).toBeInstanceOf(Note)
    })

    it('should skip notes from other users', async () => {
      const mockNote = {
        entity_key: 'note_123',
        type: 'note',
        context: {
          type: 'note',
          timestamp: '2023-01-01T00:00:00Z',
          users: [
            {
              id: 999, // Different user id
              name: 'Other User',
              handle: 'other',
              photo_url: 'https://example.com/other.jpg'
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

      const mockClient = profile as any
      mockClient.client.getNotes = jest.fn().mockImplementation(function* () {
        yield mockNote
      })

      const notes = []
      for await (const note of profile.notes({ limit: 1 })) {
        notes.push(note)
      }

      expect(notes).toHaveLength(0)
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

    it('should iterate over comments', async () => {
      const mockComment = {
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

      const mockClient = post as any
      mockClient.client.getComments = jest.fn().mockImplementation(function* () {
        yield mockComment
      })

      const comments = []
      for await (const comment of post.comments({ limit: 1 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(1)
      expect(comments[0]).toBeInstanceOf(Comment)
    })

    it('should throw error when liking (not implemented)', async () => {
      await expect(post.like()).rejects.toThrow(
        'Post liking not implemented yet - requires like API'
      )
    })

    it('should throw error when adding comment (not implemented)', async () => {
      await expect(post.addComment({ body: 'test' })).rejects.toThrow(
        'Comment creation not implemented yet - requires comment creation API'
      )
    })

    it('should use subtitle as body when description is empty', () => {
      const mockDataWithSubtitle = {
        ...mockPostData,
        description: '',
        subtitle: 'Test subtitle'
      }

      const mockClient = {
        getComments: jest.fn()
      }

      const postWithSubtitle = new Post(mockDataWithSubtitle, mockClient as any)
      expect(postWithSubtitle.body).toBe('Test subtitle')
    })

    it('should use empty string as body when both description and subtitle are empty', () => {
      const mockDataEmpty = {
        ...mockPostData,
        description: '',
        subtitle: ''
      }

      const mockClient = {
        getComments: jest.fn()
      }

      const postEmpty = new Post(mockDataEmpty, mockClient as any)
      expect(postEmpty.body).toBe('')
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

    it('should iterate over parent comments', async () => {
      const mockNoteWithComments = {
        ...mockNoteData,
        parentComments: [
          {
            id: 999,
            body: 'Parent comment',
            date: '2023-01-01T01:00:00Z',
            user_id: 111,
            name: 'Parent Commenter',
            post_id: 456
          }
        ]
      }

      const mockClient = {}
      const noteWithComments = new Note(mockNoteWithComments, mockClient as any)

      const comments = []
      for await (const comment of noteWithComments.comments({ limit: 1 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(1)
      expect(comments[0]).toBeInstanceOf(Comment)
      expect(comments[0].id).toBe(999)
      expect(comments[0].body).toBe('Parent comment')
    })

    it('should handle empty parent comments', async () => {
      const comments = []
      for await (const comment of note.comments({ limit: 1 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(0)
    })

    it('should handle null parent comments', async () => {
      const mockNoteWithNullComments = {
        ...mockNoteData,
        parentComments: [null]
      }

      const mockClient = {}
      const noteWithNullComments = new Note(mockNoteWithNullComments, mockClient as any)

      const comments = []
      for await (const comment of noteWithNullComments.comments({ limit: 1 })) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(0)
    })

    it('should throw error when liking (not implemented)', async () => {
      await expect(note.like()).rejects.toThrow(
        'Note liking not implemented yet - requires like API'
      )
    })

    it('should throw error when adding comment (not implemented)', async () => {
      await expect(note.addComment({ body: 'test' })).rejects.toThrow(
        'Comment creation not implemented yet - requires comment creation API'
      )
    })

    it('should handle missing comment body', () => {
      const mockNoteWithoutBody = {
        ...mockNoteData,
        comment: null
      }

      const mockClient = {}
      const noteWithoutBody = new Note(mockNoteWithoutBody, mockClient as any)
      expect(noteWithoutBody.body).toBe('')
    })

    it('should handle missing users in context', () => {
      const mockNoteWithoutUsers = {
        ...mockNoteData,
        context: {
          ...mockNoteData.context,
          users: []
        }
      }

      const mockClient = {}
      const noteWithoutUsers = new Note(mockNoteWithoutUsers, mockClient as any)
      expect(noteWithoutUsers.author.id).toBe(0)
      expect(noteWithoutUsers.author.name).toBe('Unknown')
      expect(noteWithoutUsers.author.handle).toBe('unknown')
      expect(noteWithoutUsers.author.avatarUrl).toBe('')
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
