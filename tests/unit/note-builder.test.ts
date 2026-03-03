import { NoteBuilder, ParagraphBuilder } from '@substack-api/domain/note-builder'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('NoteBuilder', () => {
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn()
    } as unknown as jest.Mocked<HttpClient>

    mockClient.post.mockResolvedValue({ id: 789 })
  })

  describe('Constructor', () => {
    it('should create a NoteBuilder instance', () => {
      const builder = new NoteBuilder(mockClient)
      expect(builder).toBeInstanceOf(NoteBuilder)
    })
  })

  describe('build() returns Markdown string', () => {
    it('should build simple text as plain string', () => {
      const result = new NoteBuilder(mockClient).paragraph().text('my test text').build()
      expect(result).toBe('my test text')
    })

    it('should wrap bold text with **', () => {
      const result = new NoteBuilder(mockClient).paragraph().bold('bold text').build()
      expect(result).toBe('**bold text**')
    })

    it('should wrap italic text with _', () => {
      const result = new NoteBuilder(mockClient).paragraph().italic('italic text').build()
      expect(result).toBe('_italic text_')
    })

    it('should wrap code with backticks', () => {
      const result = new NoteBuilder(mockClient).paragraph().code('myFn()').build()
      expect(result).toBe('`myFn()`')
    })

    it('should format links as [text](url)', () => {
      const result = new NoteBuilder(mockClient)
        .paragraph()
        .link('click here', 'https://example.com')
        .build()
      expect(result).toBe('[click here](https://example.com)')
    })

    it('should render underline as plain text (no Markdown underline)', () => {
      const result = new NoteBuilder(mockClient).paragraph().underline('underlined').build()
      expect(result).toBe('underlined')
    })

    it('should join two paragraphs with \\n\\n', () => {
      const result = new NoteBuilder(mockClient)
        .paragraph()
        .text('first paragraph')
        .paragraph()
        .text('second paragraph')
        .build()
      expect(result).toBe('first paragraph\n\nsecond paragraph')
    })

    it('should build mixed formatting within a paragraph', () => {
      const result = new NoteBuilder(mockClient)
        .paragraph()
        .text('Hello ')
        .bold('world')
        .text('!')
        .build()
      expect(result).toBe('Hello **world**!')
    })

    it('should prefix bullet list items with "- "', () => {
      const result = new NoteBuilder(mockClient)
        .paragraph()
        .bulletList()
        .item()
        .text('Item A')
        .item()
        .text('Item B')
        .finish()
        .build()
      expect(result).toContain('- Item A')
      expect(result).toContain('- Item B')
    })

    it('should prefix numbered list items with "1. ", "2. ", etc.', () => {
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

    it('should throw error when note has no content', () => {
      expect(() => new NoteBuilder(mockClient).build()).toThrow(
        'Note must contain at least one paragraph'
      )
    })
  })

  describe('publish() calls POST /notes with { content: string }', () => {
    it('should publish note and return GatewayCreateNoteResponse', async () => {
      const result = await new NoteBuilder(mockClient).paragraph().text('hello world').publish()

      expect(mockClient.post).toHaveBeenCalledWith('/notes', { content: 'hello world' })
      expect(result).toEqual({ id: 789 })
    })

    it('should publish multi-paragraph note as Markdown with \\n\\n', async () => {
      await new NoteBuilder(mockClient)
        .paragraph()
        .text('para one')
        .paragraph()
        .text('para two')
        .publish()

      expect(mockClient.post).toHaveBeenCalledWith('/notes', {
        content: 'para one\n\npara two'
      })
    })

    it('should publish note with rich formatting as Markdown', async () => {
      await new NoteBuilder(mockClient)
        .paragraph()
        .text('See ')
        .bold('this')
        .text(' and ')
        .italic('that')
        .publish()

      expect(mockClient.post).toHaveBeenCalledWith('/notes', {
        content: 'See **this** and _that_'
      })
    })
  })

  describe('ParagraphBuilder', () => {
    it('should return ParagraphBuilder instance from paragraph()', () => {
      const builder = new NoteBuilder(mockClient)
      expect(builder.paragraph()).toBeInstanceOf(ParagraphBuilder)
    })

    it('should allow chaining multiple paragraphs', async () => {
      await new NoteBuilder(mockClient)
        .paragraph()
        .text('First')
        .paragraph()
        .text('Second')
        .publish()

      expect(mockClient.post).toHaveBeenCalledWith('/notes', {
        content: 'First\n\nSecond'
      })
    })
  })
})
