import { NoteBuilder, NoteWithLinkBuilder } from '@substack-api/domain/note-builder'
import { HttpClient } from '@substack-api/internal/http-client'

jest.mock('@substack-api/internal/http-client')
const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>

describe('NoteBuilder - Coverage Tests', () => {
  let mockClient: jest.Mocked<HttpClient>
  let builder: NoteBuilder

  beforeEach(() => {
    mockClient = new MockHttpClient('https://example.com', {
      token: 'dummy-token',
      publicationUrl: 'https://pub.com'
    }) as jest.Mocked<HttpClient>
    mockClient.post = jest.fn().mockResolvedValue({ id: 456 })
    builder = new NoteBuilder(mockClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Markdown output for all formatting types', () => {
    it('should produce bold markdown', () => {
      const result = builder.paragraph().bold('bold').build()
      expect(result).toBe('**bold**')
    })

    it('should produce italic markdown', () => {
      const result = builder.paragraph().italic('italic').build()
      expect(result).toBe('_italic_')
    })

    it('should produce code markdown', () => {
      const result = builder.paragraph().code('console.log("test")').build()
      expect(result).toBe('`console.log("test")`')
    })

    it('should produce link markdown', () => {
      const result = builder.paragraph().link('click', 'https://example.com').build()
      expect(result).toBe('[click](https://example.com)')
    })

    it('should render underline as plain text', () => {
      const result = builder.paragraph().underline('underlined').build()
      expect(result).toBe('underlined')
    })

    it('should handle all formatting types in sequence', () => {
      const result = builder
        .paragraph()
        .bold('bold')
        .text(' ')
        .italic('italic')
        .text(' ')
        .code('code')
        .text(' ')
        .underline('underline')
        .text(' ')
        .link('link', 'https://example.com')
        .build()

      expect(result).toBe('**bold** _italic_ `code` underline [link](https://example.com)')
    })
  })

  describe('Bullet list rendering', () => {
    it('should prefix each item with "- "', () => {
      const result = builder
        .paragraph()
        .bulletList()
        .item()
        .text('First')
        .item()
        .text('Second')
        .item()
        .text('Third')
        .finish()
        .build()

      expect(result).toContain('- First')
      expect(result).toContain('- Second')
      expect(result).toContain('- Third')
    })

    it('should support formatting inside bullet list items', () => {
      const result = builder
        .paragraph()
        .bulletList()
        .item()
        .text('This is ')
        .code('code')
        .text(' here')
        .finish()
        .build()

      expect(result).toContain('- This is `code` here')
    })

    it('should support links in bullet list items', () => {
      const result = builder
        .paragraph()
        .bulletList()
        .item()
        .link('click', 'https://example.com')
        .finish()
        .build()

      expect(result).toContain('- [click](https://example.com)')
    })
  })

  describe('Numbered list rendering', () => {
    it('should prefix items with "1. ", "2. ", etc.', () => {
      const result = builder
        .paragraph()
        .numberedList()
        .item()
        .text('First step')
        .item()
        .text('Second step')
        .item()
        .text('Third step')
        .finish()
        .build()

      expect(result).toContain('1. First step')
      expect(result).toContain('2. Second step')
      expect(result).toContain('3. Third step')
    })
  })

  describe('Error handling', () => {
    it('should throw error for empty notes', () => {
      expect(() => builder.build()).toThrow('Note must contain at least one paragraph')
    })
  })

  describe('NoteWithLinkBuilder', () => {
    it('should publish with { content, attachment } in a single POST', async () => {
      const noteWithLink = new NoteWithLinkBuilder(mockClient, 'https://example.com/test')
      await noteWithLink.paragraph().text('Check this link').publish()

      expect(mockClient.post).toHaveBeenCalledTimes(1)
      expect(mockClient.post).toHaveBeenCalledWith('/notes', {
        content: 'Check this link',
        attachment: 'https://example.com/test'
      })
    })
  })

  describe('Multi-paragraph notes', () => {
    it('should join paragraphs with \\n\\n', () => {
      const result = builder.paragraph().text('Introduction').paragraph().text('Conclusion').build()

      expect(result).toBe('Introduction\n\nConclusion')
    })
  })
})
