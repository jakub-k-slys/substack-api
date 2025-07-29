import {
  NoteBuilder,
  ParagraphBuilder,
  ListBuilder,
  ListItemBuilder
} from '../../src/domain/note-builder'
import type { HttpClient } from '../../src/internal/http-client'
import type { PublishNoteResponse } from '../../src/internal'

describe('NoteBuilder', () => {
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
    it('should create empty post builder without parameters', () => {
      const builder = new NoteBuilder(mockHttpClient)
      expect(builder).toBeInstanceOf(NoteBuilder)
    })
  })

  describe('paragraph() method', () => {
    it('should return ParagraphBuilder instance', () => {
      const builder = new NoteBuilder(mockHttpClient)
      const paragraphBuilder = builder.paragraph()
      expect(paragraphBuilder).toBeInstanceOf(ParagraphBuilder)
    })
  })

  describe('Basic paragraph creation', () => {
    it('should create note with simple text content', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder.paragraph().text('Hello world').build()

      expect(result).toEqual({
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Hello world'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
    })

    it('should create note with mixed formatting', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder
        .paragraph()
        .text('This is ')
        .bold('bold')
        .text(' and ')
        .italic('italic')
        .text(' and ')
        .underline('underlined')
        .text(' text.')
        .build()

      expect(result.bodyJson.content[0]).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'This is ' },
          { type: 'text', text: 'bold', marks: [{ type: 'bold' }] },
          { type: 'text', text: ' and ' },
          { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
          { type: 'text', text: ' and ' },
          { type: 'text', text: 'underlined', marks: [{ type: 'underline' }] },
          { type: 'text', text: ' text.' }
        ]
      })
    })

    it('should support links', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder
        .paragraph()
        .text('Visit ')
        .link('Google', 'https://google.com')
        .text(' for search.')
        .build()

      expect(result.bodyJson.content[0]).toEqual({
        type: 'paragraph',
        content: [
          { type: 'text', text: 'Visit ' },
          {
            type: 'text',
            text: 'Google',
            marks: [{ type: 'link', attrs: { href: 'https://google.com' } }]
          },
          { type: 'text', text: ' for search.' }
        ]
      })
    })
  })

  describe('Multiple paragraphs', () => {
    it('should create note with multiple paragraphs', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder
        .paragraph()
        .text('First paragraph')
        .paragraph()
        .text('Second paragraph')
        .build()

      expect(result.bodyJson.content).toHaveLength(2)
      expect(result.bodyJson.content[0]).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'First paragraph' }]
      })
      expect(result.bodyJson.content[1]).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'Second paragraph' }]
      })
    })
  })

  describe('Lists', () => {
    it('should create bullet list', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder
        .paragraph()
        .text('My list:')
        .bulletList()
        .item()
        .text('First item')
        .item()
        .text('Second item')
        .finish()
        .build()

      expect(result.bodyJson.content).toHaveLength(2)
      expect(result.bodyJson.content[0]).toEqual({
        type: 'paragraph',
        content: [{ type: 'text', text: 'My list:' }]
      })
      expect(result.bodyJson.content[1]).toEqual({
        type: 'bulletList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'First item' }]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Second item' }]
              }
            ]
          }
        ]
      })
    })

    it('should create numbered list', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder
        .paragraph()
        .text('Steps:')
        .numberedList()
        .item()
        .text('Step one')
        .item()
        .text('Step two')
        .finish()
        .build()

      expect(result.bodyJson.content[1]).toEqual({
        type: 'orderedList',
        content: [
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Step one' }]
              }
            ]
          },
          {
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: 'Step two' }]
              }
            ]
          }
        ]
      })
    })

    it('should support formatting in list items', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder
        .paragraph()
        .text('List:')
        .bulletList()
        .item()
        .bold('Bold')
        .text(' and ')
        .italic('italic')
        .item()
        .link('Link', 'https://example.com')
        .finish()
        .build()

      const listContent = result.bodyJson.content[1] as any
      expect(listContent.content[0].content[0].content).toEqual([
        { type: 'text', text: 'Bold', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' and ' },
        { type: 'text', text: 'italic', marks: [{ type: 'italic' }] }
      ])
      expect(listContent.content[1].content[0].content).toEqual([
        {
          type: 'text',
          text: 'Link',
          marks: [{ type: 'link', attrs: { href: 'https://example.com' } }]
        }
      ])
    })
  })

  describe('Validation', () => {
    it('should throw error when building note with no paragraphs', () => {
      const builder = new NoteBuilder(mockHttpClient)
      expect(() => builder.build()).toThrow('Note must contain at least one paragraph')
    })

    it('should throw error when paragraph has no content', () => {
      const builder = new NoteBuilder(mockHttpClient)

      // This should be impossible with our API design, but let's test the validation
      // We'll need to call addParagraph directly to simulate this edge case
      const builderWithEmptyParagraph = (builder as any).addParagraph({ segments: [], lists: [] })

      expect(() => builderWithEmptyParagraph.build()).toThrow(
        'Each paragraph must contain at least one content block'
      )
    })
  })

  describe('Builder types and scoping', () => {
    it('should return correct builder types', () => {
      const builder = new NoteBuilder(mockHttpClient)
      const paragraphBuilder = builder.paragraph()
      const listBuilder = paragraphBuilder.bulletList()
      const listItemBuilder = listBuilder.item()

      expect(paragraphBuilder).toBeInstanceOf(ParagraphBuilder)
      expect(listBuilder).toBeInstanceOf(ListBuilder)
      expect(listItemBuilder).toBeInstanceOf(ListItemBuilder)
    })
  })

  describe('Publishing', () => {
    it('should publish note directly from paragraph builder', async () => {
      const builder = new NoteBuilder(mockHttpClient)
      const result = await builder.paragraph().text('Test content').publish()

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/comment/feed', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Test content' }]
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
})
