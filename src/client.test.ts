import { Substack } from './client'
import { PublishNoteResponse, SubstackConfig } from './types'

describe('Substack', () => {
  let client: Substack

  beforeEach(() => {
    client = new Substack({
      apiKey: 'test-api-key'
    })
    global.fetch = jest.fn()
  })

  describe('constructor', () => {
    it('should throw error if apiKey is not provided', () => {
      expect(() => new Substack({} as unknown as SubstackConfig)).toThrow(
        'apiKey is required in SubstackConfig'
      )
    })

    it('should use default hostname if not provided', () => {
      const client = new Substack({ apiKey: 'test' })
      expect(client['baseUrl']).toBe('https://substack.com')
    })

    it('should use custom hostname if provided', () => {
      const client = new Substack({ apiKey: 'test', hostname: 'test.com' })
      expect(client['baseUrl']).toBe('https://test.com')
    })

    it('should use custom apiVersion if provided', () => {
      const client = new Substack({ apiKey: 'test', apiVersion: 'v2' })
      expect(client['apiVersion']).toBe('v2')
    })
  })

  describe('request handling', () => {
    it('should build URL with query parameters', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      await client.getPosts({ offset: 10, limit: 20 })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('?offset=10&limit=20'),
        expect.any(Object)
      )
    })

    it('should handle undefined query parameters', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      await client.getPosts({ offset: undefined, limit: 20 })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining('offset'),
        expect.any(Object)
      )
    })
  })

  describe('note publishing', () => {
    it('should publish a simple note using publishNote', async () => {
      const mockResponse: PublishNoteResponse = {
        user_id: 254824415,
        body: 'Test test test',
        body_json: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Test test test'
                }
              ]
            }
          ]
        },
        post_id: null,
        publication_id: null,
        media_clip_id: null,
        ancestor_path: '',
        type: 'feed',
        status: 'published',
        reply_minimum_role: 'everyone',
        id: 126991702,
        deleted: false,
        date: '2025-06-18T09:25:18.957Z',
        name: 'Test User',
        photo_url: 'https://example.com/photo.png',
        reactions: { '❤': 0 },
        children: [],
        user_bestseller_tier: null,
        isFirstFeedCommentByUser: false,
        reaction_count: 0,
        restacks: 0,
        restacked: false,
        children_count: 0,
        attachments: []
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.publishNote('Test test test')
      expect(result).toEqual(mockResponse)

      expect(global.fetch).toHaveBeenCalledWith('https://substack.com/api/v1/comment/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'connect.sid=s%3Atest-api-key'
        },
        body: JSON.stringify({
          bodyJson: {
            type: 'doc',
            attrs: { schemaVersion: 'v1' },
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Test test test'
                  }
                ]
              }
            ]
          },
          replyMinimumRole: 'everyone'
        })
      })
    })

    it('should publish a note with formatting using builder pattern', async () => {
      const mockResponse: PublishNoteResponse = {
        user_id: 254824415,
        body: '🧠 test Qwen LLM today.',
        body_json: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: '🧠 test ' },
                { type: 'text', text: 'Qwen LLM', marks: [{ type: 'bold' }] },
                { type: 'text', text: ' today.' }
              ]
            }
          ]
        },
        post_id: null,
        publication_id: null,
        media_clip_id: null,
        ancestor_path: '',
        type: 'feed',
        status: 'published',
        reply_minimum_role: 'everyone',
        id: 126991703,
        deleted: false,
        date: '2025-06-18T09:25:18.957Z',
        name: 'Test User',
        photo_url: 'https://example.com/photo.png',
        reactions: { '❤': 0 },
        children: [],
        user_bestseller_tier: null,
        isFirstFeedCommentByUser: false,
        reaction_count: 0,
        restacks: 0,
        restacked: false,
        children_count: 0,
        attachments: []
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.note('🧠 test ').bold('Qwen LLM').simple(' today.').publish()
      expect(result).toEqual(mockResponse)

      expect(global.fetch).toHaveBeenCalledWith('https://substack.com/api/v1/comment/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'connect.sid=s%3Atest-api-key'
        },
        body: JSON.stringify({
          bodyJson: {
            type: 'doc',
            attrs: { schemaVersion: 'v1' },
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: '🧠 test ' },
                  { type: 'text', text: 'Qwen LLM', marks: [{ type: 'bold' }] },
                  { type: 'text', text: ' today.' }
                ]
              }
            ]
          },
          replyMinimumRole: 'everyone'
        })
      })
    })

    it('should publish a multi-paragraph note using builder pattern', async () => {
      const mockResponse: PublishNoteResponse = {
        user_id: 254824415,
        body: 'This is bold and italic text.',
        body_json: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'This is ' },
                { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
                { type: 'text', text: ' and ' },
                { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
                { type: 'text', text: ' text.' }
              ]
            }
          ]
        },
        post_id: null,
        publication_id: null,
        media_clip_id: null,
        ancestor_path: '',
        type: 'feed',
        status: 'published',
        reply_minimum_role: 'everyone',
        id: 126991704,
        deleted: false,
        date: '2025-06-18T09:25:18.957Z',
        name: 'Test User',
        photo_url: 'https://example.com/photo.png',
        reactions: { '❤': 0 },
        children: [],
        user_bestseller_tier: null,
        isFirstFeedCommentByUser: false,
        reaction_count: 0,
        restacks: 0,
        restacked: false,
        children_count: 0,
        attachments: []
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client
        .note('This is')
        .bold(' bold')
        .simple(' and')
        .italic(' italic.')
        .note('Second paragraph with')
        .bold(' bold')
        .simple(' text.')
        .publish()
      expect(result).toEqual(mockResponse)

      expect(global.fetch).toHaveBeenCalledWith('https://substack.com/api/v1/comment/feed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Cookie: 'connect.sid=s%3Atest-api-key'
        },
        body: JSON.stringify({
          bodyJson: {
            type: 'doc',
            attrs: { schemaVersion: 'v1' },
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'This is' },
                  { type: 'text', text: ' bold', marks: [{ type: 'bold' }] },
                  { type: 'text', text: ' and' },
                  { type: 'text', text: ' italic.', marks: [{ type: 'italic' }] }
                ]
              },
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'Second paragraph with' },
                  { type: 'text', text: ' bold', marks: [{ type: 'bold' }] },
                  { type: 'text', text: ' text.' }
                ]
              }
            ]
          },
          replyMinimumRole: 'everyone'
        })
      })
    })

    it('should handle API errors in simple note publishing', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      await expect(client.publishNote('Test')).rejects.toThrow('Request failed: Unauthorized')
    })

    it('should handle API errors in builder pattern', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      await expect(client.note('Test').bold('error').publish()).rejects.toThrow(
        'Request failed: Unauthorized'
      )
    })
  })

  describe('note builder', () => {
    it('should handle empty initial text', async () => {
      const mockResponse: PublishNoteResponse = {
        user_id: 254824415,
        body: 'Test',
        body_json: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Test', marks: [{ type: 'bold' }] }]
            }
          ]
        },
        post_id: null,
        publication_id: null,
        media_clip_id: null,
        ancestor_path: '',
        type: 'feed',
        status: 'published',
        reply_minimum_role: 'everyone',
        id: 126991705,
        deleted: false,
        date: '2025-06-18T09:25:18.957Z',
        name: 'Test User',
        photo_url: 'https://example.com/photo.png',
        reactions: { '❤': 0 },
        children: [],
        user_bestseller_tier: null,
        isFirstFeedCommentByUser: false,
        reaction_count: 0,
        restacks: 0,
        restacked: false,
        children_count: 0,
        attachments: []
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.note().bold('Test').publish()

      expect(result).toEqual(mockResponse)
    })

    it('should handle empty paragraphs', async () => {
      const mockResponse: PublishNoteResponse = {
        user_id: 254824415,
        body: 'Test',
        body_json: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Test' }]
            }
          ]
        },
        post_id: null,
        publication_id: null,
        media_clip_id: null,
        ancestor_path: '',
        type: 'feed',
        status: 'published',
        reply_minimum_role: 'everyone',
        id: 126991706,
        deleted: false,
        date: '2025-06-18T09:25:18.957Z',
        name: 'Test User',
        photo_url: 'https://example.com/photo.png',
        reactions: { '❤': 0 },
        children: [],
        user_bestseller_tier: null,
        isFirstFeedCommentByUser: false,
        reaction_count: 0,
        restacks: 0,
        restacked: false,
        children_count: 0,
        attachments: []
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.note().note('Test').publish()

      expect(result).toEqual(mockResponse)
    })

    // New test to cover the simple text segment branch
    it('should handle simple text segments without marks', async () => {
      const mockResponse: PublishNoteResponse = {
        user_id: 254824415,
        body: 'Simple text',
        body_json: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Simple text' }]
            }
          ]
        },
        post_id: null,
        publication_id: null,
        media_clip_id: null,
        ancestor_path: '',
        type: 'feed',
        status: 'published',
        reply_minimum_role: 'everyone',
        id: 126991707,
        deleted: false,
        date: '2025-06-18T09:25:18.957Z',
        name: 'Test User',
        photo_url: 'https://example.com/photo.png',
        reactions: { '❤': 0 },
        children: [],
        user_bestseller_tier: null,
        isFirstFeedCommentByUser: false,
        reaction_count: 0,
        restacks: 0,
        restacked: false,
        children_count: 0,
        attachments: []
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.note('Simple text').publish()

      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            bodyJson: {
              type: 'doc',
              attrs: { schemaVersion: 'v1' },
              content: [
                {
                  type: 'paragraph',
                  content: [{ type: 'text', text: 'Simple text' }]
                }
              ]
            },
            replyMinimumRole: 'everyone'
          })
        })
      )
    })
  })

  describe('other API methods', () => {
    it('should get publication details', async () => {
      const mockResponse = {
        name: 'Test Publication',
        hostname: 'test.substack.com',
        subdomain: 'test'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getPublication()
      expect(result).toEqual(mockResponse)
    })

    it('should get publication details with custom hostname', async () => {
      const mockResponse = {
        name: 'Test Publication',
        hostname: 'custom.com',
        subdomain: 'test'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getPublication('custom.com')
      expect(result).toEqual(mockResponse)
    })

    it('should get posts with pagination', async () => {
      const mockResponse = [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getPosts({ offset: 0, limit: 2 })
      expect(result).toEqual(mockResponse)
    })

    it('should get a specific post', async () => {
      const mockResponse = {
        id: 1,
        title: 'Test Post',
        slug: 'test-post'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getPost('test-post')
      expect(result).toEqual(mockResponse)
    })

    it('should search posts', async () => {
      const mockResponse = {
        total: 1,
        results: [{ id: 1, title: 'Test Post' }]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.searchPosts({ query: 'test' })
      expect(result).toEqual(mockResponse)
    })

    it('should get comments for a post', async () => {
      const mockResponse = [
        { id: 1, body: 'Comment 1' },
        { id: 2, body: 'Comment 2' }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getComments(1)
      expect(result).toEqual(mockResponse)
    })

    it('should get a specific comment', async () => {
      const mockResponse = {
        id: 1,
        body: 'Test Comment'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getComment(1)
      expect(result).toEqual(mockResponse)
    })

    // New test to cover notes pagination methods
    it('should handle notes pagination correctly', async () => {
      const mockFirstResponse = {
        items: [{ id: 1, body: 'Note 1' }],
        originalCursorTimestamp: '2025-06-18T09:25:18.957Z',
        nextCursor: 'next-page'
      }

      const mockSecondResponse = {
        items: [{ id: 2, body: 'Note 2' }],
        originalCursorTimestamp: '2025-06-18T09:25:18.957Z',
        nextCursor: null
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockFirstResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockSecondResponse)
        })

      const firstPage = await client.getNotes()
      expect(firstPage.items).toEqual(mockFirstResponse.items)
      expect(firstPage.hasMore()).toBe(true)

      const secondPage = await firstPage.next()
      expect(secondPage?.items).toEqual(mockSecondResponse.items)
      expect(secondPage?.hasMore()).toBe(false)

      const thirdPage = await secondPage?.next()
      expect(thirdPage).toBeNull()
    })

    it('should get notes with pagination', async () => {
      const mockResponse = {
        items: [
          { id: 1, body: 'Note 1' },
          { id: 2, body: 'Note 2' }
        ],
        originalCursorTimestamp: '2025-06-18T09:25:18.957Z',
        nextCursor: 'next'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getNotes({ cursor: 'current' })
      expect(result.items).toEqual(mockResponse.items)
      expect(result.hasMore()).toBe(true)
    })

    it('should get a public profile by slug', async () => {
      const mockResponse = {
        id: 282291554,
        name: 'Jenny Ouyang',
        handle: 'jennyouyang',
        bio: 'Test bio',
        photo_url: 'https://example.com/photo.jpg',
        publicationUsers: [],
        userLinks: [],
        subscriptions: []
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getPublicProfile('jennyouyang')
      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://substack.com/api/v1/user/jennyouyang/public_profile',
        expect.any(Object)
      )
    })

    it('should get a full profile by slug', async () => {
      const mockPublicProfile = {
        id: 282291554,
        name: 'Jenny Ouyang',
        handle: 'jennyouyang',
        bio: 'Test bio',
        photo_url: 'https://example.com/photo.jpg',
        publicationUsers: [],
        userLinks: [],
        subscriptions: []
      }

      const mockUserProfile = {
        items: [
          {
            entity_key: 'user_282291554',
            type: 'user',
            context: {
              type: 'user',
              timestamp: '2025-06-18T09:25:18.957Z',
              users: [
                {
                  id: 282291554,
                  name: 'Jenny Ouyang',
                  handle: 'jennyouyang',
                  photo_url: 'https://example.com/photo.jpg',
                  bio: 'Test bio',
                  profile_set_up_at: '2025-06-18T09:25:18.957Z',
                  reader_installed_at: '2025-06-18T09:25:18.957Z'
                }
              ],
              isFresh: true,
              source: 'profile',
              page_rank: 0
            },
            canReply: true,
            isMuted: false,
            trackingParameters: {
              item_primary_entity_key: 'user_282291554',
              item_entity_key: 'user_282291554',
              item_type: 'user',
              item_content_user_id: 282291554,
              item_context_type: 'user',
              item_context_type_bucket: 'user',
              item_context_timestamp: '2025-06-18T09:25:18.957Z',
              item_context_user_id: 282291554,
              item_context_user_ids: [282291554],
              item_can_reply: true,
              item_is_fresh: true,
              item_last_impression_at: null,
              item_page: null,
              item_page_rank: 0,
              impression_id: 'test',
              followed_user_count: 0,
              subscribed_publication_count: 0,
              is_following: false,
              is_explicitly_subscribed: false
            }
          }
        ],
        originalCursorTimestamp: '2025-06-18T09:25:18.957Z',
        nextCursor: null
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPublicProfile)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserProfile)
        })

      const result = await client.getFullProfileBySlug('jennyouyang')
      expect(result).toEqual({
        ...mockPublicProfile,
        userProfile: mockUserProfile
      })
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should get a full profile by ID', async () => {
      const mockUserProfile = {
        items: [
          {
            entity_key: 'user_282291554',
            type: 'user',
            context: {
              type: 'user',
              timestamp: '2025-06-18T09:25:18.957Z',
              users: [
                {
                  id: 282291554,
                  name: 'Jenny Ouyang',
                  handle: 'jennyouyang',
                  photo_url: 'https://example.com/photo.jpg',
                  bio: 'Test bio',
                  profile_set_up_at: '2025-06-18T09:25:18.957Z',
                  reader_installed_at: '2025-06-18T09:25:18.957Z'
                }
              ],
              isFresh: true,
              source: 'profile',
              page_rank: 0
            },
            canReply: true,
            isMuted: false,
            trackingParameters: {
              item_primary_entity_key: 'user_282291554',
              item_entity_key: 'user_282291554',
              item_type: 'user',
              item_content_user_id: 282291554,
              item_context_type: 'user',
              item_context_type_bucket: 'user',
              item_context_timestamp: '2025-06-18T09:25:18.957Z',
              item_context_user_id: 282291554,
              item_context_user_ids: [282291554],
              item_can_reply: true,
              item_is_fresh: true,
              item_last_impression_at: null,
              item_page: null,
              item_page_rank: 0,
              impression_id: 'test',
              followed_user_count: 0,
              subscribed_publication_count: 0,
              is_following: false,
              is_explicitly_subscribed: false
            }
          }
        ],
        originalCursorTimestamp: '2025-06-18T09:25:18.957Z',
        nextCursor: null
      }

      const mockPublicProfile = {
        id: 282291554,
        name: 'Jenny Ouyang',
        handle: 'jennyouyang',
        bio: 'Test bio',
        photo_url: 'https://example.com/photo.jpg',
        publicationUsers: [],
        userLinks: [],
        subscriptions: []
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserProfile)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPublicProfile)
        })

      const result = await client.getFullProfileById(282291554)
      expect(result).toEqual({
        ...mockPublicProfile,
        userProfile: mockUserProfile
      })
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should handle missing handle in user profile when getting full profile by ID', async () => {
      const mockUserProfile = {
        items: [
          {
            entity_key: 'user_282291554',
            type: 'user',
            context: {
              type: 'user',
              timestamp: '2025-06-18T09:25:18.957Z',
              users: [],
              isFresh: true,
              source: 'profile',
              page_rank: 0
            },
            canReply: true,
            isMuted: false,
            trackingParameters: {
              item_primary_entity_key: 'user_282291554',
              item_entity_key: 'user_282291554',
              item_type: 'user',
              item_content_user_id: 282291554,
              item_context_type: 'user',
              item_context_type_bucket: 'user',
              item_context_timestamp: '2025-06-18T09:25:18.957Z',
              item_context_user_id: 282291554,
              item_context_user_ids: [282291554],
              item_can_reply: true,
              item_is_fresh: true,
              item_last_impression_at: null,
              item_page: null,
              item_page_rank: 0,
              impression_id: 'test',
              followed_user_count: 0,
              subscribed_publication_count: 0,
              is_following: false,
              is_explicitly_subscribed: false
            }
          }
        ],
        originalCursorTimestamp: '2025-06-18T09:25:18.957Z',
        nextCursor: null
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserProfile)
      })

      await expect(client.getFullProfileById(282291554)).rejects.toThrow(
        'Could not find user handle in profile'
      )
    })

    it('should handle API errors when getting public profile', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(client.getPublicProfile('nonexistent')).rejects.toThrow(
        'Request failed: Not Found'
      )
    })

    it('should handle API errors when getting user profile', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(client.getUserProfile(999999)).rejects.toThrow('Request failed: Not Found')
    })

    it('should get following IDs', async () => {
      const mockResponse = [254824415, 108855261, 34637]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getFollowingIds()
      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://substack.com/api/v1/feed/following',
        expect.any(Object)
      )
    })

    // Tests to cover error handling in getFollowingProfiles
    it('should handle failed user profile fetches in getFollowingProfiles', async () => {
      const mockFollowingIds = [254824415, 108855261]

      // Mock getFollowingIds call
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFollowingIds)
      })

      // Mock first user's profile calls - successful
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          items: [{
            entity_key: 'user_254824415',
            type: 'user',
            context: {
              type: 'user',
              timestamp: '2025-06-18T09:25:18.957Z',
              users: [{
                id: 254824415,
                name: 'User 1',
                handle: 'user1',
                photo_url: 'https://example.com/photo1.jpg',
                bio: 'Bio 1',
                profile_set_up_at: '2025-06-18T09:25:18.957Z',
                reader_installed_at: '2025-06-18T09:25:18.957Z'
              }],
              isFresh: true,
              source: 'profile',
              page_rank: 0
            }
          }]
        })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          id: 254824415,
          name: 'User 1',
          handle: 'user1',
          bio: 'Bio 1',
          photo_url: 'https://example.com/photo1.jpg',
          publicationUsers: [],
          userLinks: [],
          subscriptions: []
        })
      })

      // Mock second user's profile calls - failed
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      const result = await client.getFollowingProfiles()
      
      // Should only include the successful profile
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(254824415)
    })

    it('should handle failed public profile fetches in getFollowingProfiles', async () => {
      const mockFollowingIds = [254824415]

      // Mock getFollowingIds call
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockFollowingIds)
      })

      // Mock user profile call - successful
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({
          items: [{
            entity_key: 'user_254824415',
            type: 'user',
            context: {
              type: 'user',
              timestamp: '2025-06-18T09:25:18.957Z',
              users: [{
                id: 254824415,
                name: 'User 1',
                handle: 'user1',
                photo_url: 'https://example.com/photo1.jpg',
                bio: 'Bio 1',
                profile_set_up_at: '2025-06-18T09:25:18.957Z',
                reader_installed_at: '2025-06-18T09:25:18.957Z'
              }],
              isFresh: true,
              source: 'profile',
              page_rank: 0
            }
          }]
        })
      })

      // Mock public profile call - failed
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      const result = await client.getFollowingProfiles()
      
      // Should be empty since the public profile fetch failed
      expect(result).toHaveLength(0)
    })

    it('should handle API errors when getting following IDs', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      await expect(client.getFollowingIds()).rejects.toThrow('Request failed: Unauthorized')
    })
  })
})
