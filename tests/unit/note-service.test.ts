import { NoteService } from '../../src/internal/services/note-service'
import { HttpClient } from '../../src/internal/http-client'
import type { SubstackNote, SubstackCommentResponse } from '../../src/internal'

// Mock the http client
jest.mock('../../src/internal/http-client')

describe('NoteService', () => {
  let noteService: NoteService
  let mockHttpClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()

    mockHttpClient = new HttpClient('https://test.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()

    noteService = new NoteService(mockHttpClient)
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

      mockHttpClient.get.mockResolvedValueOnce(mockCommentResponse)

      const result = await noteService.getNoteById(123)

      expect(result).toEqual({
        entity_key: '123',
        type: 'note',
        context: {
          type: 'feed',
          timestamp: '2023-01-01T00:00:00Z',
          users: [
            {
              id: 456,
              name: 'Test User',
              handle: '',
              photo_url: '',
              bio: '',
              profile_set_up_at: '2023-01-01T00:00:00Z',
              reader_installed_at: '2023-01-01T00:00:00Z'
            }
          ],
          isFresh: false,
          page: null,
          page_rank: 1
        },
        comment: {
          id: 123,
          body: 'Test note content',
          type: 'feed',
          date: '2023-01-01T00:00:00Z',
          user_id: 456,
          post_id: 789,
          name: 'Test User',
          handle: '',
          photo_url: '',
          ancestor_path: '',
          reply_minimum_role: 'everyone',
          reaction_count: 0,
          reactions: {},
          restacks: 0,
          restacked: false,
          children_count: 0,
          attachments: []
        },
        parentComments: [],
        canReply: true,
        isMuted: false,
        trackingParameters: {
          item_primary_entity_key: '123',
          item_entity_key: '123',
          item_type: 'note',
          item_content_user_id: 456,
          item_context_type: 'feed',
          item_context_type_bucket: 'note',
          item_context_timestamp: '2023-01-01T00:00:00Z',
          item_context_user_id: 456,
          item_context_user_ids: [456],
          item_can_reply: true,
          item_is_fresh: false,
          item_last_impression_at: null,
          item_page: null,
          item_page_rank: 1,
          impression_id: 'generated',
          followed_user_count: 0,
          subscribed_publication_count: 0,
          is_following: false,
          is_explicitly_subscribed: false
        }
      } as SubstackNote)

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/comment/123')
    })

    it('should handle null post_id in comment response', async () => {
      const mockCommentResponse: SubstackCommentResponse = {
        item: {
          comment: {
            id: 123,
            body: 'Test note content',
            user_id: 456,
            name: 'Test User',
            date: '2023-01-01T00:00:00Z',
            post_id: null
          }
        }
      }

      mockHttpClient.get.mockResolvedValueOnce(mockCommentResponse)

      const result = await noteService.getNoteById(123)

      expect(result.comment?.post_id).toBe(null)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/comment/123')
    })

    it('should handle missing post_id in comment response', async () => {
      const mockCommentResponse: SubstackCommentResponse = {
        item: {
          comment: {
            id: 123,
            body: 'Test note content',
            user_id: 456,
            name: 'Test User',
            date: '2023-01-01T00:00:00Z'
            // post_id is undefined
          }
        }
      }

      mockHttpClient.get.mockResolvedValueOnce(mockCommentResponse)

      const result = await noteService.getNoteById(123)

      expect(result.comment?.post_id).toBe(null)
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/comment/123')
    })

    it('should throw error when HTTP request fails', async () => {
      const error = new Error('API Error')
      mockHttpClient.get.mockRejectedValueOnce(error)

      await expect(noteService.getNoteById(123)).rejects.toThrow('API Error')
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/reader/comment/123')
    })
  })
})
