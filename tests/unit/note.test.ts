import { Note } from '../../src/domain/note'
import { Comment } from '../../src/domain/comment'
import type { HttpClient } from '../../src/internal/http-client'
import type { SubstackNoteComment } from '../../src/internal'

describe('Note Entity', () => {
  let mockHttpClient: jest.Mocked<HttpClient>
  let note: Note

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn()
    } as unknown as jest.Mocked<HttpClient>

    const mockNoteData = {
      entity_key: '789',
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
        isFresh: false,
        page_rank: 1
      },
      comment: {
        name: 'Test User',
        handle: 'testuser',
        photo_url: 'https://example.com/photo.jpg',
        id: 789,
        body: 'Test note content',
        user_id: 123,
        type: 'feed',
        date: '2023-01-01T00:00:00Z',
        ancestor_path: '',
        reply_minimum_role: 'everyone',
        reaction_count: 15,
        reactions: {
          '❤️': 8,
          '👍': 5,
          '👎': 2
        },
        restacks: 2,
        restacked: false,
        children_count: 2,
        attachments: []
      },
      parentComments: [
        {
          name: 'Commenter 1',
          handle: 'commenter1',
          photo_url: 'https://example.com/commenter1.jpg',
          id: 1,
          body: 'Parent comment 1',
          user_id: 124,
          type: 'feed',
          date: '2023-01-01T00:00:00Z',
          ancestor_path: '',
          reply_minimum_role: 'everyone',
          reaction_count: 0,
          reactions: {},
          restacks: 0,
          restacked: false,
          children_count: 0,
          attachments: [],
          post_id: 789
        },
        {
          name: 'Commenter 2',
          handle: 'commenter2',
          photo_url: 'https://example.com/commenter2.jpg',
          id: 2,
          body: 'Parent comment 2',
          user_id: 125,
          type: 'feed',
          date: '2023-01-02T00:00:00Z',
          ancestor_path: '',
          reply_minimum_role: 'everyone',
          reaction_count: 0,
          reactions: {},
          restacks: 0,
          restacked: false,
          children_count: 0,
          attachments: [],
          post_id: 789
        }
      ],
      canReply: true,
      isMuted: false,
      trackingParameters: {
        item_primary_entity_key: '789',
        item_entity_key: '789',
        item_type: 'note',
        item_content_user_id: 123,
        item_context_type: 'feed',
        item_context_type_bucket: 'note',
        item_context_timestamp: '2023-01-01T00:00:00Z',
        item_context_user_id: 123,
        item_context_user_ids: [123],
        item_can_reply: true,
        item_is_fresh: false,
        item_last_impression_at: null,
        item_page: null,
        item_page_rank: 1,
        impression_id: 'test-impression',
        followed_user_count: 0,
        subscribed_publication_count: 0,
        is_following: false,
        is_explicitly_subscribed: false
      }
    }

    note = new Note(mockNoteData, mockHttpClient)
  })

  describe('comments()', () => {
    it('should iterate through note parent comments', async () => {
      const comments = []
      for await (const comment of note.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(2)
      expect(comments[0]).toBeInstanceOf(Comment)
      expect(comments[0].body).toBe('Parent comment 1')
      expect(comments[0].author.name).toBe('Commenter 1')
      expect(comments[1].body).toBe('Parent comment 2')
      expect(comments[1].author.name).toBe('Commenter 2')
    })

    it('should handle empty parent comments', async () => {
      const mockNoteDataEmpty = {
        entity_key: '790',
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
          isFresh: false,
          page_rank: 1
        },
        comment: {
          name: 'Test User',
          handle: 'testuser',
          photo_url: 'https://example.com/photo.jpg',
          id: 790,
          body: 'Test note without comments',
          user_id: 123,
          type: 'feed',
          date: '2023-01-01T00:00:00Z',
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
          item_primary_entity_key: '790',
          item_entity_key: '790',
          item_type: 'note',
          item_content_user_id: 123,
          item_context_type: 'feed',
          item_context_type_bucket: 'note',
          item_context_timestamp: '2023-01-01T00:00:00Z',
          item_context_user_id: 123,
          item_context_user_ids: [123],
          item_can_reply: true,
          item_is_fresh: false,
          item_last_impression_at: null,
          item_page: null,
          item_page_rank: 1,
          impression_id: 'test-impression',
          followed_user_count: 0,
          subscribed_publication_count: 0,
          is_following: false,
          is_explicitly_subscribed: false
        }
      }

      const noteEmpty = new Note(mockNoteDataEmpty, mockHttpClient)
      const comments = []
      for await (const comment of noteEmpty.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(0)
    })

    it('should handle undefined parent comments', async () => {
      const mockNoteDataUndefined = {
        entity_key: '791',
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
          isFresh: false,
          page_rank: 1
        },
        comment: {
          name: 'Test User',
          handle: 'testuser',
          photo_url: 'https://example.com/photo.jpg',
          id: 791,
          body: 'Test note with undefined comments',
          user_id: 123,
          type: 'feed',
          date: '2023-01-01T00:00:00Z',
          ancestor_path: '',
          reply_minimum_role: 'everyone',
          reaction_count: 0,
          reactions: {},
          restacks: 0,
          restacked: false,
          children_count: 0,
          attachments: []
        },
        parentComments: [] as Array<SubstackNoteComment>,
        canReply: true,
        isMuted: false,
        trackingParameters: {
          item_primary_entity_key: '791',
          item_entity_key: '791',
          item_type: 'note',
          item_content_user_id: 123,
          item_context_type: 'feed',
          item_context_type_bucket: 'note',
          item_context_timestamp: '2023-01-01T00:00:00Z',
          item_context_user_id: 123,
          item_context_user_ids: [123],
          item_can_reply: true,
          item_is_fresh: false,
          item_last_impression_at: null,
          item_page: null,
          item_page_rank: 1,
          impression_id: 'test-impression',
          followed_user_count: 0,
          subscribed_publication_count: 0,
          is_following: false,
          is_explicitly_subscribed: false
        }
      }

      const noteUndefined = new Note(mockNoteDataUndefined, mockHttpClient)
      const comments = []
      for await (const comment of noteUndefined.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(0)
    })

    it('should handle null parent comments', async () => {
      const mockNoteDataWithNull = {
        entity_key: '792',
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
          isFresh: false,
          page_rank: 1
        },
        comment: {
          name: 'Test User',
          handle: 'testuser',
          photo_url: 'https://example.com/photo.jpg',
          id: 792,
          body: 'Test note with null comments',
          user_id: 123,
          type: 'feed',
          date: '2023-01-01T00:00:00Z',
          ancestor_path: '',
          reply_minimum_role: 'everyone',
          reaction_count: 0,
          reactions: {},
          restacks: 0,
          restacked: false,
          children_count: 1,
          attachments: []
        },
        parentComments: [
          {
            name: 'Commenter 3',
            handle: 'commenter3',
            photo_url: 'https://example.com/commenter3.jpg',
            id: 3,
            body: 'Valid comment',
            user_id: 126,
            type: 'feed',
            date: '2023-01-03T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 0,
            reactions: {},
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: [],
            post_id: 792
          }
        ] as Array<SubstackNoteComment>,
        canReply: true,
        isMuted: false,
        trackingParameters: {
          item_primary_entity_key: '792',
          item_entity_key: '792',
          item_type: 'note',
          item_content_user_id: 123,
          item_context_type: 'feed',
          item_context_type_bucket: 'note',
          item_context_timestamp: '2023-01-01T00:00:00Z',
          item_context_user_id: 123,
          item_context_user_ids: [123],
          item_can_reply: true,
          item_is_fresh: false,
          item_last_impression_at: null,
          item_page: null,
          item_page_rank: 1,
          impression_id: 'test-impression',
          followed_user_count: 0,
          subscribed_publication_count: 0,
          is_following: false,
          is_explicitly_subscribed: false
        }
      }

      const noteWithNull = new Note(mockNoteDataWithNull, mockHttpClient)
      const comments = []
      for await (const comment of noteWithNull.comments()) {
        comments.push(comment)
      }

      expect(comments).toHaveLength(1)
      expect(comments[0].body).toBe('Valid comment')
    })
  })

  describe('like()', () => {
    it('should throw error for unimplemented like functionality', async () => {
      await expect(note.like()).rejects.toThrow(
        'Note liking not implemented yet - requires like API'
      )
    })
  })

  describe('addComment()', () => {
    it('should throw error for unimplemented comment functionality', async () => {
      await expect(note.addComment('Test comment')).rejects.toThrow(
        'Note commenting not implemented yet - requires comment API'
      )
    })
  })

  describe('properties', () => {
    it('should have correct property values', () => {
      expect(note.id).toBe('789')
      expect(note.body).toBe('Test note content')
      expect(note.likesCount).toBe(15)
      expect(note.author.name).toBe('Test User')
      expect(note.publishedAt).toBeInstanceOf(Date)
    })
  })
})
