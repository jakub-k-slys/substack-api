import { NoteBuilder, ParagraphBuilder } from '../../src/domain/note-builder'
import type { HttpClient } from '../../src/internal/http-client'
import type { PublishNoteResponse } from '../../src/internal'

describe('NoteBuilder (Legacy Test Suite)', () => {
  let mockHttpClient: jest.Mocked<HttpClient>
  let mockPublishResponse: PublishNoteResponse

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    } as unknown as jest.Mocked<HttpClient>

    mockPublishResponse = {
      user_id: 123,
      body: 'Test note content',
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
      id: 789,
      deleted: false,
      date: '2023-01-01T00:00:00Z',
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
      attachments: [],
      user_primary_publication: undefined
    }

    mockHttpClient.post.mockResolvedValue(mockPublishResponse)
  })

  describe('Constructor', () => {
    it('should create empty post builder', () => {
      const builder = new NoteBuilder(mockHttpClient)
      expect(builder).toBeInstanceOf(NoteBuilder)
    })
  })

  describe('Simple use case', () => {
    it('should create note with simple text and publish', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder.paragraph().text('my test text').publish()

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/comment/feed', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'my test text'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('Two paragraphs', () => {
    it('should create note with two simple paragraphs', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder
        .paragraph()
        .text('my test text1')
        .paragraph()
        .text('my test text2')
        .publish()

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/comment/feed', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'my test text1'
                }
              ]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'my test text2'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('Rich formatting within a paragraph', () => {
    it('should create note with rich formatting', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder
        .paragraph()
        .text('adasd')
        .bold('this is bold')
        .text('regular again')
        .paragraph()
        .text('my test text2')
        .publish()

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/comment/feed', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'adasd'
                },
                {
                  type: 'text',
                  text: 'this is bold',
                  marks: [{ type: 'bold' }]
                },
                {
                  type: 'text',
                  text: 'regular again'
                }
              ]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'my test text2'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('Multiple paragraphs with different formatting', () => {
    it('should create note with multiple rich paragraphs', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder
        .paragraph()
        .text('adasd')
        .bold('this is bold')
        .text('regular again')
        .paragraph()
        .text('adasd')
        .italic('this is italic')
        .text('regular again')
        .publish()

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/comment/feed', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'adasd'
                },
                {
                  type: 'text',
                  text: 'this is bold',
                  marks: [{ type: 'bold' }]
                },
                {
                  type: 'text',
                  text: 'regular again'
                }
              ]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'adasd'
                },
                {
                  type: 'text',
                  text: 'this is italic',
                  marks: [{ type: 'italic' }]
                },
                {
                  type: 'text',
                  text: 'regular again'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('Code formatting', () => {
    it('should support code formatting in paragraphs', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder
        .paragraph()
        .text('Here is some ')
        .code('code()')
        .text(' in the text')
        .publish()

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/comment/feed', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Here is some '
                },
                {
                  type: 'text',
                  text: 'code()',
                  marks: [{ type: 'code' }]
                },
                {
                  type: 'text',
                  text: ' in the text'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('Mixed formatting types', () => {
    it('should support all formatting types in one paragraph', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder
        .paragraph()
        .text('Plain text, ')
        .bold('bold text, ')
        .italic('italic text, ')
        .code('code text')
        .publish()

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/comment/feed', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Plain text, '
                },
                {
                  type: 'text',
                  text: 'bold text, ',
                  marks: [{ type: 'bold' }]
                },
                {
                  type: 'text',
                  text: 'italic text, ',
                  marks: [{ type: 'italic' }]
                },
                {
                  type: 'text',
                  text: 'code text',
                  marks: [{ type: 'code' }]
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('ParagraphBuilder', () => {
    it('should return ParagraphBuilder instance for rich formatting', () => {
      const builder = new NoteBuilder(mockHttpClient)
      const paragraphBuilder = builder.paragraph()
      expect(paragraphBuilder).toBeInstanceOf(ParagraphBuilder)
    })

    it('should allow chaining from paragraph builder to new node', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder
        .paragraph()
        .text('First paragraph')
        .paragraph()
        .text('Second paragraph')
        .publish()

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/comment/feed', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'First paragraph'
                }
              ]
            },
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Second paragraph'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })

    it('should publish directly from paragraph builder', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder.paragraph().text('Only paragraph').publish()

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/comment/feed', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Only paragraph'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
      expect(result).toBe(mockPublishResponse)
    })
  })

  describe('Empty content handling', () => {
    it('should throw error when trying to publish empty note', () => {
      const builder = new NoteBuilder(mockHttpClient)
      expect(() => builder.build()).toThrow('Note must contain at least one paragraph')
    })
  })
})
