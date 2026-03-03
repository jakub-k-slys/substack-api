import {
  NoteBuilder,
  ParagraphBuilder,
  ListBuilder,
  ListItemBuilder
} from '@substack-api/domain/note-builder'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('NoteBuilder (post-builder)', () => {
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn()
    } as unknown as jest.Mocked<HttpClient>

    mockClient.post.mockResolvedValue({ id: 789 })
  })

  describe('Constructor', () => {
    it('should create empty NoteBuilder', () => {
      const builder = new NoteBuilder(mockClient)
      expect(builder).toBeInstanceOf(NoteBuilder)
    })
  })

  describe('paragraph() method', () => {
    it('should return ParagraphBuilder instance', () => {
      const builder = new NoteBuilder(mockClient)
      expect(builder.paragraph()).toBeInstanceOf(ParagraphBuilder)
    })
  })

  describe('Basic paragraph creation', () => {
    it('should build simple text as Markdown string', () => {
      const result = new NoteBuilder(mockClient).paragraph().text('Hello world').build()
      expect(result).toBe('Hello world')
    })

    it('should build mixed formatting as Markdown', () => {
      const result = new NoteBuilder(mockClient)
        .paragraph()
        .text('This is ')
        .bold('bold')
        .text(' and ')
        .italic('italic')
        .text(' and ')
        .underline('underlined')
        .text(' text.')
        .build()

      expect(result).toBe('This is **bold** and _italic_ and underlined text.')
    })

    it('should format links as [text](url)', () => {
      const result = new NoteBuilder(mockClient)
        .paragraph()
        .text('Visit ')
        .link('Google', 'https://google.com')
        .text(' for search.')
        .build()

      expect(result).toBe('Visit [Google](https://google.com) for search.')
    })
  })

  describe('Multiple paragraphs', () => {
    it('should join paragraphs with \\n\\n', () => {
      const result = new NoteBuilder(mockClient)
        .paragraph()
        .text('First paragraph')
        .paragraph()
        .text('Second paragraph')
        .build()

      expect(result).toBe('First paragraph\n\nSecond paragraph')
    })
  })

  describe('Lists', () => {
    it('should prefix bullet list items with "- "', () => {
      const result = new NoteBuilder(mockClient)
        .paragraph()
        .bulletList()
        .item()
        .text('First item')
        .item()
        .text('Second item')
        .finish()
        .build()

      expect(result).toContain('- First item')
      expect(result).toContain('- Second item')
    })

    it('should prefix numbered list items with "1. ", "2. "', () => {
      const result = new NoteBuilder(mockClient)
        .paragraph()
        .numberedList()
        .item()
        .text('Step one')
        .item()
        .text('Step two')
        .finish()
        .build()

      expect(result).toContain('1. Step one')
      expect(result).toContain('2. Step two')
    })

    it('should support formatting in list items', () => {
      const result = new NoteBuilder(mockClient)
        .paragraph()
        .bulletList()
        .item()
        .bold('Bold')
        .text(' and ')
        .italic('italic')
        .item()
        .link('Link', 'https://example.com')
        .finish()
        .build()

      expect(result).toContain('- **Bold** and _italic_')
      expect(result).toContain('- [Link](https://example.com)')
    })
  })

  describe('Validation', () => {
    it('should throw when building empty note', () => {
      expect(() => new NoteBuilder(mockClient).build()).toThrow(
        'Note must contain at least one paragraph'
      )
    })

    it('should throw when paragraph has no content', () => {
      const builderWithEmptyParagraph = (new NoteBuilder(mockClient) as any).addParagraph({
        segments: [],
        lists: []
      })
      expect(() => builderWithEmptyParagraph.build()).toThrow(
        'Each paragraph must contain at least one content block'
      )
    })
  })

  describe('Builder types and scoping', () => {
    it('should return correct builder types', () => {
      const builder = new NoteBuilder(mockClient)
      const paragraphBuilder = builder.paragraph()
      const listBuilder = paragraphBuilder.bulletList()
      const listItemBuilder = listBuilder.item()

      expect(paragraphBuilder).toBeInstanceOf(ParagraphBuilder)
      expect(listBuilder).toBeInstanceOf(ListBuilder)
      expect(listItemBuilder).toBeInstanceOf(ListItemBuilder)
    })
  })

  describe('Publishing', () => {
    it('should POST to /notes with { content: markdownString }', async () => {
      await new NoteBuilder(mockClient).paragraph().text('Test content').publish()

      expect(mockClient.post).toHaveBeenCalledWith('/notes', {
        content: 'Test content'
      })
    })

    it('should return GatewayCreateNoteResponse from publish()', async () => {
      const result = await new NoteBuilder(mockClient).paragraph().text('Test').publish()
      expect(result).toEqual({ id: 789 })
    })
  })
})
