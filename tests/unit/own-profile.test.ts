import { OwnProfile } from '@substack-api/domain/own-profile'
import { Note } from '@substack-api/domain/note'
import { Profile } from '@substack-api/domain/profile'
import {
  ProfileService,
  PostService,
  NoteService,
  CommentService,
  FollowingService,
  NewNoteService
} from '@substack-api/internal/services'
const makeGatewayProfile = (id: number, handle: string, name: string) => ({
  id,
  handle,
  name,
  url: `https://substack.com/@${handle}`,
  avatar_url: `https://example.com/${handle}.jpg`,
  bio: `Bio for ${name}`
})

const makeGatewayNote = (id: number, body: string) => ({
  id,
  body,
  likes_count: 0,
  author: { id: 123, name: 'Test User', handle: 'testuser', avatar_url: '' },
  published_at: '2023-01-01T00:00:00Z'
})

describe('OwnProfile Entity', () => {
  let mockProfileService: jest.Mocked<ProfileService>
  let mockPostService: jest.Mocked<PostService>
  let mockCommentService: jest.Mocked<CommentService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockFollowingService: jest.Mocked<FollowingService>
  let mockNewNoteService: jest.Mocked<NewNoteService>
  let ownProfile: OwnProfile

  beforeEach(() => {
    mockProfileService = {
      getOwnProfile: jest.fn(),
      getProfileBySlug: jest.fn()
    } as unknown as jest.Mocked<ProfileService>

    mockPostService = {
      getPostById: jest.fn(),
      getPostsForProfile: jest.fn()
    } as unknown as jest.Mocked<PostService>

    mockCommentService = {
      getCommentsForPost: jest.fn()
    } as unknown as jest.Mocked<CommentService>

    mockNoteService = {
      getNoteById: jest.fn(),
      getNotesForLoggedUser: jest.fn(),
      getNotesForProfile: jest.fn()
    } as unknown as jest.Mocked<NoteService>

    mockFollowingService = {
      getFollowing: jest.fn()
    } as unknown as jest.Mocked<FollowingService>

    mockNewNoteService = {
      publishNote: jest.fn().mockResolvedValue({ id: 42 })
    } as unknown as jest.Mocked<NewNoteService>

    ownProfile = new OwnProfile(
      makeGatewayProfile(123, 'testuser', 'Test User'),
      mockPostService,
      mockNoteService,
      mockCommentService,
      mockProfileService,
      mockFollowingService,
      mockNewNoteService,
      25
    )
  })

  it('should inherit Profile properties', () => {
    expect(ownProfile.id).toBe(123)
    expect(ownProfile.name).toBe('Test User')
    expect(ownProfile.slug).toBe('testuser')
  })

  it('should have publishNote, following, and notes methods', () => {
    expect(typeof ownProfile.publishNote).toBe('function')
    expect(typeof ownProfile.following).toBe('function')
    expect(typeof ownProfile.notes).toBe('function')
  })

  describe('publishNote()', () => {
    it('should delegate to newNoteService.publishNote with content', async () => {
      const result = await ownProfile.publishNote('Hello **world**')
      expect(mockNewNoteService.publishNote).toHaveBeenCalledWith('Hello **world**', undefined)
      expect(result).toEqual({ id: 42 })
    })

    it('should pass attachment when provided', async () => {
      await ownProfile.publishNote('Check this out', { attachment: 'https://example.com' })
      expect(mockNewNoteService.publishNote).toHaveBeenCalledWith(
        'Check this out',
        'https://example.com'
      )
    })
  })

  describe('following()', () => {
    it('should iterate through following users as Profile instances', async () => {
      mockFollowingService.getFollowing.mockResolvedValue([
        { id: 1, handle: 'user1' },
        { id: 2, handle: 'user2' }
      ])
      mockProfileService.getProfileBySlug
        .mockResolvedValueOnce(makeGatewayProfile(1, 'user1', 'User One'))
        .mockResolvedValueOnce(makeGatewayProfile(2, 'user2', 'User Two'))

      const following = []
      for await (const p of ownProfile.following()) {
        following.push(p)
      }

      expect(following).toHaveLength(2)
      expect(following[0]).toBeInstanceOf(Profile)
      expect(following[0].name).toBe('User One')
      expect(following[1].name).toBe('User Two')
      expect(mockProfileService.getProfileBySlug).toHaveBeenCalledWith('user1')
      expect(mockProfileService.getProfileBySlug).toHaveBeenCalledWith('user2')
    })

    it('should handle empty following list', async () => {
      mockFollowingService.getFollowing.mockResolvedValue([])

      const following = []
      for await (const p of ownProfile.following()) {
        following.push(p)
      }

      expect(following).toHaveLength(0)
      expect(mockProfileService.getProfileBySlug).not.toHaveBeenCalled()
    })

    it('should skip profiles that fail to load', async () => {
      mockFollowingService.getFollowing.mockResolvedValue([
        { id: 1, handle: 'user1' },
        { id: 2, handle: 'user2' },
        { id: 3, handle: 'user3' }
      ])
      mockProfileService.getProfileBySlug.mockImplementation((slug: string) => {
        if (slug === 'user2') return Promise.reject(new Error('Not found'))
        const id = slug === 'user1' ? 1 : 3
        return Promise.resolve(makeGatewayProfile(id, slug, `User ${id}`))
      })

      const following = []
      for await (const p of ownProfile.following()) {
        following.push(p)
      }

      expect(following).toHaveLength(2)
      expect(following[0].slug).toBe('user1')
      expect(following[1].slug).toBe('user3')
    })
  })

  describe('notes()', () => {
    it('should use getNotesForLoggedUser instead of getNotesForProfile', async () => {
      const mockNotes = [makeGatewayNote(1, 'Note 1'), makeGatewayNote(2, 'Note 2')]
      mockNoteService.getNotesForLoggedUser.mockResolvedValue({
        notes: mockNotes,
        nextCursor: undefined
      })

      const notes = []
      for await (const note of ownProfile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(2)
      expect(notes[0]).toBeInstanceOf(Note)
      expect(notes[0].body).toBe('Note 1')
      expect(notes[1].body).toBe('Note 2')
      expect(mockNoteService.getNotesForLoggedUser).toHaveBeenCalled()
      expect(mockNoteService.getNotesForProfile).not.toHaveBeenCalled()
    })

    it('should respect limit parameter', async () => {
      mockNoteService.getNotesForLoggedUser.mockResolvedValue({
        notes: [makeGatewayNote(1, 'Note 1'), makeGatewayNote(2, 'Note 2')],
        nextCursor: undefined
      })

      const notes = []
      for await (const note of ownProfile.notes({ limit: 1 })) {
        notes.push(note)
      }

      expect(notes).toHaveLength(1)
      expect(notes[0].body).toBe('Note 1')
    })

    it('should handle empty notes', async () => {
      mockNoteService.getNotesForLoggedUser.mockResolvedValue({ notes: [], nextCursor: undefined })

      const notes = []
      for await (const note of ownProfile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(0)
    })
  })
})
