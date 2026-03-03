import { Profile } from '@substack-api/domain/profile'
import { PreviewPost } from '@substack-api/domain/post'
import { Note } from '@substack-api/domain/note'
import { PostService, NoteService, CommentService } from '@substack-api/internal/services'

const makeGatewayProfile = (id: number, handle: string, name: string) => ({
  id,
  handle,
  name,
  url: `https://substack.com/@${handle}`,
  avatar_url: `https://example.com/${handle}.jpg`,
  bio: `Bio for ${name}`
})

const makeGatewayPost = (id: number, title: string) => ({
  id,
  title,
  published_at: '2023-01-01T00:00:00Z'
})

const makeGatewayNote = (id: number, body: string) => ({
  id,
  body,
  likes_count: 0,
  author: { id: 123, name: 'Test User', handle: 'testuser', avatar_url: '' },
  published_at: '2023-01-01T00:00:00Z'
})

describe('Profile Entity', () => {
  let mockPostService: jest.Mocked<PostService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockCommentService: jest.Mocked<CommentService>
  let profile: Profile

  beforeEach(() => {
    mockPostService = {
      getPostById: jest.fn(),
      getPostsForProfile: jest.fn()
    } as unknown as jest.Mocked<PostService>

    mockNoteService = {
      getNoteById: jest.fn(),
      getNotesForLoggedUser: jest.fn(),
      getNotesForProfile: jest.fn()
    } as unknown as jest.Mocked<NoteService>

    mockCommentService = {
      getCommentsForPost: jest.fn()
    } as unknown as jest.Mocked<CommentService>

    profile = new Profile(
      makeGatewayProfile(123, 'testuser', 'Test User'),
      mockPostService,
      mockNoteService,
      mockCommentService,
      25
    )
  })

  describe('properties', () => {
    it('should expose id, name, and slug (handle)', () => {
      expect(profile.id).toBe(123)
      expect(profile.name).toBe('Test User')
      expect(profile.slug).toBe('testuser')
    })
  })

  describe('posts()', () => {
    it('should iterate through profile posts', async () => {
      const mockPosts = [makeGatewayPost(1, 'Post 1'), makeGatewayPost(2, 'Post 2')]
      mockPostService.getPostsForProfile.mockResolvedValue(mockPosts)

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(2)
      expect(posts[0]).toBeInstanceOf(PreviewPost)
      expect(posts[0].title).toBe('Post 1')
      expect(posts[1].title).toBe('Post 2')
      expect(mockPostService.getPostsForProfile).toHaveBeenCalledWith(
        'testuser',
        expect.any(Object)
      )
    })

    it('should respect limit parameter', async () => {
      mockPostService.getPostsForProfile.mockResolvedValue([
        makeGatewayPost(1, 'Post 1'),
        makeGatewayPost(2, 'Post 2')
      ])

      const posts = []
      for await (const post of profile.posts({ limit: 1 })) {
        posts.push(post)
      }

      expect(posts).toHaveLength(1)
      expect(posts[0].title).toBe('Post 1')
    })

    it('should handle empty posts response', async () => {
      mockPostService.getPostsForProfile.mockResolvedValue([])

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(0)
    })

    it('should paginate using offset until partial page', async () => {
      const profileWithPerPage2 = new Profile(
        makeGatewayProfile(123, 'testuser', 'Test User'),
        mockPostService,
        mockNoteService,
        mockCommentService,
        2
      )

      mockPostService.getPostsForProfile
        .mockResolvedValueOnce([makeGatewayPost(1, 'Post 1'), makeGatewayPost(2, 'Post 2')])
        .mockResolvedValueOnce([makeGatewayPost(3, 'Post 3')])

      const posts = []
      for await (const post of profileWithPerPage2.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(3)
      expect(mockPostService.getPostsForProfile).toHaveBeenCalledTimes(2)
      expect(mockPostService.getPostsForProfile).toHaveBeenNthCalledWith(1, 'testuser', {
        limit: 2,
        offset: 0
      })
      expect(mockPostService.getPostsForProfile).toHaveBeenNthCalledWith(2, 'testuser', {
        limit: 2,
        offset: 2
      })
    })
  })

  describe('notes()', () => {
    it('should iterate through profile notes', async () => {
      const mockNotes = [makeGatewayNote(10, 'Note 1'), makeGatewayNote(11, 'Note 2')]
      mockNoteService.getNotesForProfile.mockResolvedValue({
        notes: mockNotes,
        nextCursor: undefined
      })

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(2)
      expect(notes[0]).toBeInstanceOf(Note)
      expect(notes[0].body).toBe('Note 1')
      expect(notes[1].body).toBe('Note 2')
      expect(mockNoteService.getNotesForProfile).toHaveBeenCalledWith('testuser', {
        cursor: undefined
      })
    })

    it('should respect limit parameter', async () => {
      const mockNotes = [makeGatewayNote(10, 'Note 1'), makeGatewayNote(11, 'Note 2')]
      mockNoteService.getNotesForProfile.mockResolvedValue({
        notes: mockNotes,
        nextCursor: undefined
      })

      const notes = []
      for await (const note of profile.notes({ limit: 1 })) {
        notes.push(note)
      }

      expect(notes).toHaveLength(1)
      expect(notes[0].body).toBe('Note 1')
    })

    it('should paginate using cursor', async () => {
      mockNoteService.getNotesForProfile
        .mockResolvedValueOnce({
          notes: [makeGatewayNote(1, 'Note 1'), makeGatewayNote(2, 'Note 2')],
          nextCursor: 'cursor1'
        })
        .mockResolvedValueOnce({
          notes: [makeGatewayNote(3, 'Note 3')],
          nextCursor: undefined
        })

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(3)
      expect(mockNoteService.getNotesForProfile).toHaveBeenCalledTimes(2)
      expect(mockNoteService.getNotesForProfile).toHaveBeenNthCalledWith(1, 'testuser', {
        cursor: undefined
      })
      expect(mockNoteService.getNotesForProfile).toHaveBeenNthCalledWith(2, 'testuser', {
        cursor: 'cursor1'
      })
    })

    it('should handle empty notes', async () => {
      mockNoteService.getNotesForProfile.mockResolvedValue({ notes: [], nextCursor: undefined })

      const notes = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(0)
    })
  })
})
