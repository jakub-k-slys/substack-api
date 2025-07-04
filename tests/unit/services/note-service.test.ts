/**
 * NoteService unit tests
 */

import { NoteService } from '../../../src/services/note-service'
import { SubstackHttpClient } from '../../../src/http-client'
import { MemoryCache } from '../../../src/services/memory-cache'
import type { ServiceConfig } from '../../../src/services/types'

// Mock the entities
jest.mock('../../../src/entities')

describe('NoteService', () => {
  let noteService: NoteService
  let mockHttpClient: jest.Mocked<SubstackHttpClient>
  let mockCache: jest.Mocked<MemoryCache>
  let serviceConfig: ServiceConfig

  beforeEach(() => {
    jest.clearAllMocks()

    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    } as unknown as jest.Mocked<SubstackHttpClient>

    mockCache = {
      get: jest.fn(),
      set: jest.fn(),
      delete: jest.fn(),
      clear: jest.fn(),
      size: jest.fn()
    } as unknown as jest.Mocked<MemoryCache>

    serviceConfig = {
      httpClient: mockHttpClient,
      cache: mockCache,
      logger: {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn()
      }
    }

    noteService = new NoteService(serviceConfig)
  })

  describe('getNoteById', () => {
    it('should fetch a note by ID successfully', async () => {
      const mockRawNote = {
        entity_key: '789',
        type: 'note',
        context: {
          type: 'note',
          timestamp: '2023-01-01T00:00:00Z',
          users: [
            {
              id: 123,
              name: 'Test User',
              handle: 'testuser',
              photo_url: 'https://example.com/photo.jpg',
              bio: 'Test bio',
              profile_set_up_at: '2023-01-01T00:00:00Z',
              reader_installed_at: '2023-01-01T00:00:00Z'
            }
          ],
          isFresh: true,
          source: 'test',
          page_rank: 1
        },
        comment: {
          id: 789,
          body: 'Test note content',
          reaction_count: 5
        },
        canReply: true,
        isMuted: false,
        trackingParameters: {
          item_primary_entity_key: '789',
          item_entity_key: '789',
          item_type: 'note',
          item_comment_id: 789,
          item_content_user_id: 123,
          item_context_type: 'note',
          item_context_type_bucket: 'note',
          item_context_timestamp: '2023-01-01T00:00:00Z',
          item_context_user_id: 123,
          item_context_user_ids: [123],
          item_can_reply: true,
          item_is_fresh: true,
          item_last_impression_at: null,
          item_source: 'test',
          item_page: null,
          item_page_rank: 1,
          impression_id: 'test-impression',
          followed_user_count: 0,
          subscribed_publication_count: 0,
          is_following: false,
          is_explicitly_subscribed: false
        }
      }

      mockHttpClient.get.mockResolvedValue(mockRawNote)

      const result = await noteService.getNoteById('789')

      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/notes/789')
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Fetching note by ID', { id: '789' })
      expect(result).toBeDefined()
    })

    it('should handle error when note not found', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('Not found'))

      await expect(noteService.getNoteById('999')).rejects.toThrow(
        'Note with ID 999 not found: Not found'
      )
      expect(serviceConfig.logger?.error).toHaveBeenCalledWith('Failed to fetch note by ID', {
        id: '999',
        error: 'Not found'
      })
    })
  })

  describe('getNotesForProfile', () => {
    it('should fetch notes for a profile successfully', async () => {
      const mockRawNotes = [
        {
          entity_key: '1',
          type: 'note',
          context: {
            type: 'note',
            timestamp: '2023-01-01T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                bio: 'Test bio',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: true,
            source: 'test',
            page_rank: 1
          },
          comment: {
            id: 1,
            body: 'Note 1',
            reaction_count: 2
          },
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: '1',
            item_entity_key: '1',
            item_type: 'note',
            item_comment_id: 1,
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: 'note',
            item_context_timestamp: '2023-01-01T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: true,
            item_last_impression_at: null,
            item_source: 'test',
            item_page: null,
            item_page_rank: 1,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        }
      ]

      mockHttpClient.get.mockResolvedValue({ items: mockRawNotes })

      const result = await noteService.getNotesForProfile(123)

      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/reader/feed/profile/123?limit=25&offset=0'
      )
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Fetching notes for profile', {
        profileUserId: 123,
        options: {}
      })
      expect(result).toHaveLength(1)
    })

    it('should filter only note types', async () => {
      const mockItems = [
        {
          entity_key: '1',
          type: 'note',
          context: {
            type: 'note',
            timestamp: '2023-01-01T00:00:00Z',
            users: [],
            isFresh: true,
            source: 'test',
            page_rank: 1
          },
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: '1',
            item_entity_key: '1',
            item_type: 'note',
            item_comment_id: 1,
            item_content_user_id: 123,
            item_context_type: 'note',
            item_context_type_bucket: 'note',
            item_context_timestamp: '2023-01-01T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: true,
            item_last_impression_at: null,
            item_source: 'test',
            item_page: null,
            item_page_rank: 1,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        },
        {
          entity_key: '2',
          type: 'post',
          context: {
            type: 'post',
            timestamp: '2023-01-02T00:00:00Z',
            users: [],
            isFresh: true,
            source: 'test',
            page_rank: 2
          },
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: '2',
            item_entity_key: '2',
            item_type: 'post',
            item_comment_id: 2,
            item_content_user_id: 123,
            item_context_type: 'post',
            item_context_type_bucket: 'post',
            item_context_timestamp: '2023-01-02T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: true,
            item_last_impression_at: null,
            item_source: 'test',
            item_page: null,
            item_page_rank: 2,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        }
      ]

      mockHttpClient.get.mockResolvedValue({ items: mockItems })

      const result = await noteService.getNotesForProfile(123)

      expect(result).toHaveLength(1) // Only the note, not the post
      expect(result[0].entity_key).toBe('1')
    })

    it('should handle API error', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('API Error'))

      await expect(noteService.getNotesForProfile(123)).rejects.toThrow(
        'Failed to fetch notes for profile 123: API Error'
      )
    })
  })

  describe('createNote', () => {
    it('should create a note successfully', async () => {
      const mockRawNote = {
        entity_key: 'new-note-123',
        type: 'note',
        context: {
          type: 'feed',
          timestamp: '2023-01-01T00:00:00Z',
          users: [
            {
              id: 123,
              name: 'Test User',
              handle: 'testuser',
              photo_url: 'https://example.com/photo.jpg',
              bio: 'Test bio',
              profile_set_up_at: '2023-01-01T00:00:00Z',
              reader_installed_at: '2023-01-01T00:00:00Z'
            }
          ],
          isFresh: true,
          source: 'create',
          page_rank: 1
        },
        comment: {
          id: 123,
          body: 'This is a new note',
          reaction_count: 0
        },
        canReply: true,
        isMuted: false,
        trackingParameters: {
          item_primary_entity_key: 'new-note-123',
          item_entity_key: 'new-note-123',
          item_type: 'note',
          item_comment_id: 123,
          item_content_user_id: 123,
          item_context_type: 'feed',
          item_context_type_bucket: 'feed',
          item_context_timestamp: '2023-01-01T00:00:00Z',
          item_context_user_id: 123,
          item_context_user_ids: [123],
          item_can_reply: true,
          item_is_fresh: true,
          item_last_impression_at: null,
          item_source: 'create',
          item_page: null,
          item_page_rank: 1,
          impression_id: 'test-impression',
          followed_user_count: 0,
          subscribed_publication_count: 0,
          is_following: false,
          is_explicitly_subscribed: false
        }
      }

      mockHttpClient.post.mockResolvedValue(mockRawNote)

      const result = await noteService.createNote('This is a new note')

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/comment/feed', {
        body: 'This is a new note',
        context: {
          type: 'feed'
        }
      })
      expect(serviceConfig.logger?.debug).toHaveBeenCalledWith('Creating note', { bodyLength: 18 })
      expect(result).toBeDefined()
    })

    it('should handle creation error', async () => {
      mockHttpClient.post.mockRejectedValue(new Error('Creation failed'))

      await expect(noteService.createNote('Test note')).rejects.toThrow(
        'Failed to create note: Creation failed'
      )
      expect(serviceConfig.logger?.error).toHaveBeenCalledWith('Failed to create note', {
        body: 'Test note',
        error: 'Creation failed'
      })
    })
  })
})
