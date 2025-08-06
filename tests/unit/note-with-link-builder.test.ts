import { NoteWithLinkBuilder } from '../../src/domain/note-builder'
import { HttpClient } from '../../src/internal/http-client'

// Mock HttpClient
jest.mock('../../src/internal/http-client')
const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>

describe('NoteWithLinkBuilder', () => {
  let mockClient: jest.Mocked<HttpClient>
  let builder: NoteWithLinkBuilder

  beforeEach(() => {
    mockClient = new MockHttpClient('https://example.com', {
      hostname: 'example.com',
      apiKey: 'test-api-key'
    }) as jest.Mocked<HttpClient>
    builder = new NoteWithLinkBuilder(mockClient, 'https://example.com/test')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('publish', () => {
    it('should create attachment and publish note with attachment ID', async () => {
      // Mock attachment creation response
      const mockAttachmentResponse = {
        id: '19b5d6f9-46db-47d6-b381-17cb5f443c00',
        type: 'post',
        publication: {},
        post: {}
      }

      // Mock note publish response
      const mockPublishResponse = {
        user_id: 12345,
        body: 'Test note',
        body_json: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: []
        },
        post_id: null,
        publication_id: null,
        media_clip_id: null,
        ancestor_path: '',
        type: 'feed',
        status: 'published',
        reply_minimum_role: 'everyone',
        id: 67890,
        deleted: false,
        date: '2025-08-06T12:00:00Z',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg',
        reactions: {},
        children: [],
        user_bestseller_tier: null,
        isFirstFeedCommentByUser: false,
        reaction_count: 0,
        restacks: 0,
        restacked: false,
        children_count: 0,
        attachments: []
      }

      mockClient.post
        .mockResolvedValueOnce(mockAttachmentResponse) // First call for attachment
        .mockResolvedValueOnce(mockPublishResponse) // Second call for note publish

      // Build and publish a simple note
      const result = await builder.paragraph().text('Check out this link!').publish()

      // Verify two calls were made in the correct order
      expect(mockClient.post).toHaveBeenCalledTimes(2)

      // Verify first call was attachment creation
      expect(mockClient.post).toHaveBeenNthCalledWith(1, '/api/v1/comment/attachment', {
        url: 'https://example.com/test',
        type: 'link'
      })

      // Verify second call was note publish with attachment ID
      expect(mockClient.post).toHaveBeenNthCalledWith(
        2,
        '/api/v1/comment/feed',
        expect.objectContaining({
          attachmentIds: ['19b5d6f9-46db-47d6-b381-17cb5f443c00'],
          bodyJson: {
            type: 'doc',
            attrs: { schemaVersion: 'v1' },
            content: [
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'Check out this link!'
                  }
                ]
              }
            ]
          },
          tabId: 'for-you',
          surface: 'feed',
          replyMinimumRole: 'everyone'
        })
      )

      expect(result).toEqual(mockPublishResponse)
    })

    it('should handle complex note content with attachments', async () => {
      // Mock attachment creation response
      const mockAttachmentResponse = {
        id: 'attachment-id-123',
        type: 'post',
        publication: {},
        post: {}
      }

      // Mock note publish response
      const mockPublishResponse = {
        user_id: 12345,
        body: 'Complex note',
        body_json: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: []
        },
        post_id: null,
        publication_id: null,
        media_clip_id: null,
        ancestor_path: '',
        type: 'feed',
        status: 'published',
        reply_minimum_role: 'everyone',
        id: 67890,
        deleted: false,
        date: '2025-08-06T12:00:00Z',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg',
        reactions: {},
        children: [],
        user_bestseller_tier: null,
        isFirstFeedCommentByUser: false,
        reaction_count: 0,
        restacks: 0,
        restacked: false,
        children_count: 0,
        attachments: []
      }

      mockClient.post
        .mockResolvedValueOnce(mockAttachmentResponse)
        .mockResolvedValueOnce(mockPublishResponse)

      // Build a complex note with multiple formatting options
      const result = await builder
        .paragraph()
        .text('This is ')
        .bold('bold text')
        .text(' and ')
        .italic('italic text')
        .text('.')
        .paragraph()
        .text('Here is a ')
        .link('link', 'https://example.com')
        .text(' in the note.')
        .publish()

      // Verify two calls were made in the correct order
      expect(mockClient.post).toHaveBeenCalledTimes(2)

      // Verify first call was attachment creation
      expect(mockClient.post).toHaveBeenNthCalledWith(1, '/api/v1/comment/attachment', {
        url: 'https://example.com/test',
        type: 'link'
      })

      // Verify the complex structure was preserved in the note publish
      expect(mockClient.post).toHaveBeenNthCalledWith(
        2,
        '/api/v1/comment/feed',
        expect.objectContaining({
          attachmentIds: ['attachment-id-123'],
          bodyJson: {
            type: 'doc',
            attrs: { schemaVersion: 'v1' },
            content: [
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'This is ' },
                  { type: 'text', text: 'bold text', marks: [{ type: 'bold' }] },
                  { type: 'text', text: ' and ' },
                  { type: 'text', text: 'italic text', marks: [{ type: 'italic' }] },
                  { type: 'text', text: '.' }
                ]
              },
              {
                type: 'paragraph',
                content: [
                  { type: 'text', text: 'Here is a ' },
                  {
                    type: 'text',
                    text: 'link',
                    marks: [{ type: 'link', attrs: { href: 'https://example.com' } }]
                  },
                  { type: 'text', text: ' in the note.' }
                ]
              }
            ]
          }
        })
      )

      expect(result).toEqual(mockPublishResponse)
    })

    it('should handle attachment creation failure', async () => {
      // Mock attachment creation to fail
      mockClient.post.mockRejectedValueOnce(new Error('Attachment creation failed'))

      // Attempt to publish should throw the error
      await expect(builder.paragraph().text('Test').publish()).rejects.toThrow(
        'Attachment creation failed'
      )

      // Verify only the attachment call was made
      expect(mockClient.post).toHaveBeenCalledTimes(1)
      expect(mockClient.post).toHaveBeenNthCalledWith(1, '/api/v1/comment/attachment', {
        url: 'https://example.com/test',
        type: 'link'
      })
    })
  })
})
