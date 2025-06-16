import { Substack } from './client'
import { PublishNoteResponse } from './types'

describe('Substack', () => {
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
          content: [{
            type: 'paragraph',
            content: [{
              type: 'text',
              text: 'Test test test'
            }]
          }]
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

      expect(global.fetch).toHaveBeenCalledWith(
        'https://substack.com/api/v1/comment/feed',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: 'connect.sid=s%3Atest-api-key'
          },
          body: JSON.stringify({
            bodyJson: {
              type: 'doc',
              attrs: { schemaVersion: 'v1' },
              content: [{
                type: 'paragraph',
                content: [{
                  type: 'text',
                  text: 'Test test test'
                }]
              }]
            },
            replyMinimumRole: 'everyone'
          })
        }
      )
    })

    it('should publish a note with formatting using builder pattern', async () => {
      const mockResponse: PublishNoteResponse = {
        user_id: 254824415,
        body: '🧠 test Qwen LLM today.',
        body_json: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [{
            type: 'paragraph',
            content: [
              { type: 'text', text: '🧠 test ' },
              { type: 'text', text: 'Qwen LLM', marks: [{ type: 'bold' }] },
              { type: 'text', text: ' today.' }
            ]
          }]
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

      const result = await client
        .note('🧠 test ')
        .bold('Qwen LLM')
        .simple(' today.')
        .publish()
      expect(result).toEqual(mockResponse)

      expect(global.fetch).toHaveBeenCalledWith(
        'https://substack.com/api/v1/comment/feed',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: 'connect.sid=s%3Atest-api-key'
          },
          body: JSON.stringify({
            bodyJson: {
              type: 'doc',
              attrs: { schemaVersion: 'v1' },
              content: [{
                type: 'paragraph',
                content: [
                  { type: 'text', text: '🧠 test ' },
                  { type: 'text', text: 'Qwen LLM', marks: [{ type: 'bold' }] },
                  { type: 'text', text: ' today.' }
                ]
              }]
            },
            replyMinimumRole: 'everyone'
          })
        }
      )
    })

    it('should publish a multi-paragraph note using builder pattern', async () => {
      const mockResponse: PublishNoteResponse = {
        user_id: 254824415,
        body: 'This is bold and italic text.',
        body_json: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [{
            type: 'paragraph',
            content: [
              { type: 'text', text: 'This is ' },
              { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
              { type: 'text', text: ' and ' },
              { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
              { type: 'text', text: ' text.' }
            ]
          }]
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

      expect(global.fetch).toHaveBeenCalledWith(
        'https://substack.com/api/v1/comment/feed',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Cookie: 'connect.sid=s%3Atest-api-key'
          },
          body: JSON.stringify({
            bodyJson: {
              type: 'doc',
              attrs: { schemaVersion: 'v1' },
              content: [{
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
              }]
            },
            replyMinimumRole: 'everyone'
          })
        }
      )
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

      await expect(
        client.note('Test').bold('error').publish()
      ).rejects.toThrow('Request failed: Unauthorized')
    })
  })
})
