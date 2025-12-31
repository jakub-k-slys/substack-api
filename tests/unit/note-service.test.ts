import { NoteService } from '@substack-api/internal/services/note-service'
import { HttpClient } from '@substack-api/internal/http-client'
import type { SubstackCommentResponse } from '@substack-api/internal'

// Mock the http client
jest.mock('@substack-api/internal/http-client')

describe('NoteService', () => {
  let noteService: NoteService
  let mockPublicationClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockPublicationClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockPublicationClient.get = jest.fn()

    noteService = new NoteService(mockPublicationClient)
  })

  describe('getNoteById', () => {
    it('should return transformed note data from the HTTP client', async () => {
      const mockCommentResponse: SubstackCommentResponse = {
        item: {
          comment: {
            id: 123,
            body: 'Test note content',
            user_id: 456,
            name: 'Test User',
            date: '2023-01-01T00:00:00Z',
            post_id: 789
          }
        }
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockCommentResponse)

      const result = await noteService.getNoteById(123)

      // Verify the minimal SubstackNote structure
      expect(result).toEqual({
        entity_key: '123',
        context: {
          timestamp: '2023-01-01T00:00:00Z',
          users: [
            {
              id: 456,
              name: 'Test User',
              handle: '',
              photo_url: ''
            }
          ]
        },
        comment: {
          id: 123,
          body: 'Test note content',
          reaction_count: 0
        },
        parentComments: []
      })

      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/comment/123')
    })

    it('should throw error when HTTP request fails', async () => {
      const error = new Error('API Error')
      mockPublicationClient.get.mockRejectedValueOnce(error)

      await expect(noteService.getNoteById(123)).rejects.toThrow('API Error')
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/comment/123')
    })
  })

  describe('getNotesForLoggedUser', () => {
    it('should return paginated notes without cursor', async () => {
      const mockResponse = {
        items: [
          {
            entity_key: 'note-1',
            type: 'comment',
            context: {
              type: 'feed',
              timestamp: '2023-01-01T00:00:00Z',
              users: [],
              isFresh: false,
              page_rank: 1
            }
          }
        ],
        nextCursor: 'next-cursor-123'
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await noteService.getNotesForLoggedUser()

      expect(result).toEqual({
        notes: mockResponse.items,
        nextCursor: 'next-cursor-123'
      })
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/notes')
    })

    it('should return paginated notes with cursor', async () => {
      const mockResponse = {
        items: [],
        next_cursor: undefined
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await noteService.getNotesForLoggedUser({ cursor: 'test-cursor' })

      expect(result).toEqual({
        notes: [],
        nextCursor: undefined
      })
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/notes?cursor=test-cursor')
    })

    it('should handle missing items in response', async () => {
      const mockResponse = {
        nextCursor: 'next-cursor'
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await noteService.getNotesForLoggedUser()

      expect(result).toEqual({
        notes: [],
        nextCursor: 'next-cursor'
      })
    })
  })

  describe('getNotesForProfile', () => {
    it('should return paginated notes for profile without cursor', async () => {
      const mockResponse = {
        items: [
          {
            entity_key: 'note-1',
            type: 'comment',
            context: {
              type: 'feed',
              timestamp: '2023-01-01T00:00:00Z',
              users: [],
              isFresh: false,
              page_rank: 1
            }
          }
        ],
        nextCursor: 'next-cursor-456'
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await noteService.getNotesForProfile(123)

      expect(result).toEqual({
        notes: mockResponse.items,
        nextCursor: 'next-cursor-456'
      })
      expect(mockPublicationClient.get).toHaveBeenCalledWith('/reader/feed/profile/123?types=note')
    })

    it('should return paginated notes for profile with cursor', async () => {
      const mockResponse = {
        items: [],
        next_cursor: undefined
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const result = await noteService.getNotesForProfile(456, { cursor: 'profile-cursor' })

      expect(result).toEqual({
        notes: [],
        nextCursor: undefined
      })
      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        '/reader/feed/profile/456?types=note&cursor=profile-cursor'
      )
    })

    it('should handle URL encoding of cursor', async () => {
      const mockResponse = {
        items: [],
        next_cursor: undefined
      }

      mockPublicationClient.get.mockResolvedValueOnce(mockResponse)

      const cursorWithSpecialChars = 'cursor+with special=chars&more'
      await noteService.getNotesForProfile(789, { cursor: cursorWithSpecialChars })

      expect(mockPublicationClient.get).toHaveBeenCalledWith(
        `/reader/feed/profile/789?types=note&cursor=${encodeURIComponent(cursorWithSpecialChars)}`
      )
    })
  })
})
