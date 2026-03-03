import { Note } from '@substack-api/domain/note'
import { HttpClient } from '@substack-api/internal/http-client'
import { NoteService } from '@substack-api/internal/services/note-service'
import { NewNoteService } from '@substack-api/internal/services/new-note-service'
import { createMockHttpClient, makeGatewayNote } from '@test/unit/fixtures'

jest.mock('@substack-api/internal/http-client')

// ---------------------------------------------------------------------------
// Note entity
// ---------------------------------------------------------------------------

describe('Note Entity', () => {
  describe('properties', () => {
    it('should expose id, body, and likesCount', () => {
      const note = new Note(makeGatewayNote(789, 'Test note content', 15))
      expect(note.id).toBe(789)
      expect(note.body).toBe('Test note content')
      expect(note.likesCount).toBe(15)
    })

    it('should expose author fields', () => {
      const note = new Note(makeGatewayNote(1, 'body'))
      expect(note.author.id).toBe(123)
      expect(note.author.name).toBe('Test User')
      expect(note.author.handle).toBe('testuser')
      expect(note.author.avatarUrl).toBe('https://example.com/photo.jpg')
    })

    it('should expose publishedAt as Date', () => {
      const note = new Note(makeGatewayNote(1, 'body'))
      expect(note.publishedAt).toBeInstanceOf(Date)
      expect(note.publishedAt.toISOString()).toContain('2023-01-01')
    })

    it('should handle zero likesCount', () => {
      expect(new Note(makeGatewayNote(1, 'body', 0)).likesCount).toBe(0)
    })
  })
})

// ---------------------------------------------------------------------------
// NoteService
// ---------------------------------------------------------------------------

describe('NoteService', () => {
  let noteService: NoteService
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockHttpClient()
    noteService = new NoteService(mockClient)
  })

  describe('getNoteById', () => {
    it('should return note data from GET /notes/{id}', async () => {
      const mockNote = makeGatewayNote(123, 'Test note content')
      mockClient.get.mockResolvedValueOnce(mockNote)

      expect(await noteService.getNoteById(123)).toEqual(mockNote)
      expect(mockClient.get).toHaveBeenCalledWith('/notes/123')
    })

    it('should throw when request fails', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('API Error'))
      await expect(noteService.getNoteById(123)).rejects.toThrow('API Error')
    })
  })

  describe('getNotesForLoggedUser', () => {
    it('should return notes from GET /me/notes without cursor', async () => {
      const notes = [makeGatewayNote(1, 'Note 1'), makeGatewayNote(2, 'Note 2')]
      mockClient.get.mockResolvedValueOnce({ items: notes, next_cursor: 'cursor-abc' })

      const result = await noteService.getNotesForLoggedUser()

      expect(result).toEqual({ notes, nextCursor: 'cursor-abc' })
      expect(mockClient.get).toHaveBeenCalledWith('/me/notes', {})
    })

    it('should pass cursor in params when provided', async () => {
      mockClient.get.mockResolvedValueOnce({ items: [], next_cursor: undefined })

      const result = await noteService.getNotesForLoggedUser({ cursor: 'test-cursor' })

      expect(result).toEqual({ notes: [], nextCursor: undefined })
      expect(mockClient.get).toHaveBeenCalledWith('/me/notes', { cursor: 'test-cursor' })
    })

    it('should throw when response is missing required items field', async () => {
      mockClient.get.mockResolvedValueOnce({ next_cursor: 'next' })
      await expect(noteService.getNotesForLoggedUser()).rejects.toThrow('Invalid GatewayNotesPage')
    })
  })

  describe('getNotesForProfile', () => {
    it('should return notes from GET /profiles/{slug}/notes', async () => {
      const notes = [makeGatewayNote(10, 'Profile note')]
      mockClient.get.mockResolvedValueOnce({ items: notes, next_cursor: 'cursor-xyz' })

      const result = await noteService.getNotesForProfile('testuser')

      expect(result).toEqual({ notes, nextCursor: 'cursor-xyz' })
      expect(mockClient.get).toHaveBeenCalledWith('/profiles/testuser/notes', {})
    })

    it('should pass cursor in params when provided', async () => {
      mockClient.get.mockResolvedValueOnce({ items: [], next_cursor: undefined })

      const result = await noteService.getNotesForProfile('testuser', { cursor: 'profile-cursor' })

      expect(result).toEqual({ notes: [], nextCursor: undefined })
      expect(mockClient.get).toHaveBeenCalledWith('/profiles/testuser/notes', {
        cursor: 'profile-cursor'
      })
    })
  })
})

// ---------------------------------------------------------------------------
// NewNoteService
// ---------------------------------------------------------------------------

describe('NewNoteService', () => {
  let service: NewNoteService
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = createMockHttpClient()
    service = new NewNoteService(mockClient)
  })

  describe('publishNote', () => {
    it('should POST /notes with content and return the note id', async () => {
      mockClient.post.mockResolvedValueOnce({ id: 42 })

      const result = await service.publishNote('Hello world')

      expect(mockClient.post).toHaveBeenCalledWith('/notes', { content: 'Hello world' })
      expect(result).toEqual({ id: 42 })
    })

    it('should include attachment when provided', async () => {
      mockClient.post.mockResolvedValueOnce({ id: 99 })

      await service.publishNote('Check this out', 'https://example.com/article')

      expect(mockClient.post).toHaveBeenCalledWith('/notes', {
        content: 'Check this out',
        attachment: 'https://example.com/article'
      })
    })

    it('should not include attachment key when attachment is undefined', async () => {
      mockClient.post.mockResolvedValueOnce({ id: 1 })

      await service.publishNote('No attachment here')

      const body = mockClient.post.mock.calls[0][1] as Record<string, string>
      expect('attachment' in body).toBe(false)
    })

    it('should throw when response is missing id', async () => {
      mockClient.post.mockResolvedValueOnce({ other: 'field' })
      await expect(service.publishNote('Bad response')).rejects.toThrow(
        'Invalid GatewayCreateNoteResponse'
      )
    })
  })
})
