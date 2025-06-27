import { Substack } from '../../src/client'
import { PublishNoteResponse } from '../../src/types'

describe('Substack Notes', () => {
  let client: Substack

  beforeEach(() => {
    client = new Substack({
      apiKey: 'test-api-key'
    })
    global.fetch = jest.fn()
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

    it('should handle API errors in simple note publishing', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      await expect(client.publishNote('Test')).rejects.toThrow('Request failed: Unauthorized')
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

    it('should handle formatted text segments', async () => {
      const mockResponse: PublishNoteResponse = {
        user_id: 254824415,
        body: 'Test bold and italic text',
        body_json: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Test ' },
                { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
                { type: 'text', text: ' and ' },
                { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
                { type: 'text', text: ' text' }
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
        id: 126991708,
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
        .note('Test ')
        .bold('bold')
        .simple(' and ')
        .italic('italic')
        .simple(' text')
        .publish()

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
                  content: [
                    { type: 'text', text: 'Test ' },
                    { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
                    { type: 'text', text: ' and ' },
                    { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
                    { type: 'text', text: ' text' }
                  ]
                }
              ]
            },
            replyMinimumRole: 'everyone'
          })
        })
      )
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

  describe('notes pagination', () => {
    it('should handle notes async iteration correctly', async () => {
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

      const notes: any[] = []
      for await (const note of client.getNotes()) {
        notes.push(note)
      }

      expect(notes).toEqual([
        { id: 1, body: 'Note 1' },
        { id: 2, body: 'Note 2' }
      ])
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should respect the limit option', async () => {
      const mockFirstResponse = {
        items: [
          { id: 1, body: 'Note 1' },
          { id: 2, body: 'Note 2' }
        ],
        originalCursorTimestamp: '2025-06-18T09:25:18.957Z',
        nextCursor: 'next-page'
      }

      const mockSecondResponse = {
        items: [{ id: 3, body: 'Note 3' }],
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

      const notes: any[] = []
      for await (const note of client.getNotes({ limit: 2 })) {
        notes.push(note)
      }

      expect(notes).toEqual([
        { id: 1, body: 'Note 1' },
        { id: 2, body: 'Note 2' }
      ])
      expect(global.fetch).toHaveBeenCalledTimes(1) // Should stop after first page due to limit
    })

    it('should handle empty response', async () => {
      const mockResponse = {
        items: [],
        originalCursorTimestamp: '2025-06-18T09:25:18.957Z',
        nextCursor: null
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const notes: any[] = []
      for await (const note of client.getNotes()) {
        notes.push(note)
      }

      expect(notes).toEqual([])
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })
  })
})
