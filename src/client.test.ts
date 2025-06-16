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
  })
})
