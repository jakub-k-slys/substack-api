import { NoteService } from '@substack-api/internal/services/note-service'
import { HttpClient } from '@substack-api/internal/http-client'

jest.mock('@substack-api/internal/http-client')

const makeGatewayNote = (id: number, body: string) => ({
  id,
  body,
  likes_count: 0,
  author: { id: 1, name: 'Test User', handle: 'testuser', avatar_url: '' },
  published_at: '2023-01-01T00:00:00Z'
})

describe('NoteService', () => {
  let noteService: NoteService
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = new HttpClient('https://test.com', {
      token: 'dummy-token',
      publicationUrl: 'https://pub.com'
    }) as jest.Mocked<HttpClient>
    mockClient.get = jest.fn()
    noteService = new NoteService(mockClient)
  })

  describe('getNoteById', () => {
    it('should return note data from GET /notes/{id}', async () => {
      const mockNote = makeGatewayNote(123, 'Test note content')
      mockClient.get.mockResolvedValueOnce(mockNote)

      const result = await noteService.getNoteById(123)

      expect(result).toEqual(mockNote)
      expect(mockClient.get).toHaveBeenCalledWith('/notes/123')
    })

    it('should throw error when HTTP request fails', async () => {
      mockClient.get.mockRejectedValueOnce(new Error('API Error'))

      await expect(noteService.getNoteById(123)).rejects.toThrow('API Error')
    })
  })

  describe('getNotesForLoggedUser', () => {
    it('should return notes from GET /me/notes without cursor', async () => {
      const notes = [makeGatewayNote(1, 'Note 1'), makeGatewayNote(2, 'Note 2')]
      // Response shape from gateway: { items, next_cursor }
      mockClient.get.mockResolvedValueOnce({ items: notes, next_cursor: 'cursor-abc' })

      const result = await noteService.getNotesForLoggedUser()

      // Service maps { items, next_cursor } -> { notes, nextCursor }
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
    it('should return notes from GET /profiles/{slug}/notes without cursor', async () => {
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
