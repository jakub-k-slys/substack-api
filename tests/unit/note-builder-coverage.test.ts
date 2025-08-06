import { NoteBuilder, NoteWithLinkBuilder } from '../../src/domain/note-builder'
import { HttpClient } from '../../src/internal/http-client'

// Mock HttpClient
jest.mock('../../src/internal/http-client')
const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>

describe('NoteBuilder - Coverage Tests', () => {
  let mockClient: jest.Mocked<HttpClient>
  let builder: NoteBuilder

  beforeEach(() => {
    mockClient = new MockHttpClient('https://example.com', {
      hostname: 'example.com',
      apiKey: 'test-api-key'
    }) as jest.Mocked<HttpClient>
    builder = new NoteBuilder(mockClient)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('ListItemBuilder formatting methods', () => {
    it('should support code formatting in list items', () => {
      const request = builder
        .paragraph()
        .bulletList()
        .item()
        .text('This is ')
        .code('console.log("test")')
        .text(' in a list')
        .finish()
        .build()

      const bulletList = request.bodyJson.content[0] as any
      const listItem = bulletList.content[0]
      const paragraph = listItem.content[0]
      expect(paragraph.content).toEqual([
        { type: 'text', text: 'This is ' },
        { type: 'text', text: 'console.log("test")', marks: [{ type: 'code' }] },
        { type: 'text', text: ' in a list' }
      ])
    })

    it('should support underline formatting in list items', () => {
      const request = builder
        .paragraph()
        .bulletList()
        .item()
        .text('This is ')
        .underline('underlined')
        .text(' text')
        .finish()
        .build()

      const bulletList = request.bodyJson.content[0] as any
      const listItem = bulletList.content[0]
      const paragraph = listItem.content[0]
      expect(paragraph.content).toEqual([
        { type: 'text', text: 'This is ' },
        { type: 'text', text: 'underlined', marks: [{ type: 'underline' }] },
        { type: 'text', text: ' text' }
      ])
    })

    it('should support links in list items', () => {
      const request = builder
        .paragraph()
        .bulletList()
        .item()
        .text('Check out ')
        .link('this link', 'https://example.com')
        .text('!')
        .finish()
        .build()

      const bulletList = request.bodyJson.content[0] as any
      const listItem = bulletList.content[0]
      const paragraph = listItem.content[0]
      expect(paragraph.content).toEqual([
        { type: 'text', text: 'Check out ' },
        {
          type: 'text',
          text: 'this link',
          marks: [{ type: 'link', attrs: { href: 'https://example.com' } }]
        },
        { type: 'text', text: '!' }
      ])
    })

    it('should support chaining multiple list items', () => {
      const request = builder
        .paragraph()
        .bulletList()
        .item()
        .text('First item')
        .item()
        .text('Second item')
        .item()
        .text('Third item')
        .finish()
        .build()

      const bulletList = request.bodyJson.content[0] as any
      expect(bulletList.content).toHaveLength(3)
      expect(bulletList.content[0].content[0].content[0].text).toBe('First item')
      expect(bulletList.content[1].content[0].content[0].text).toBe('Second item')
      expect(bulletList.content[2].content[0].content[0].text).toBe('Third item')
    })

    it('should handle complex formatting in chained list items', () => {
      const request = builder
        .paragraph()
        .numberedList()
        .item()
        .bold('Bold')
        .text(' and ')
        .italic('italic')
        .item()
        .code('code')
        .text(' and ')
        .underline('underline')
        .item()
        .link('link', 'https://test.com')
        .finish()
        .build()

      const orderedList = request.bodyJson.content[0] as any
      expect(orderedList.content).toHaveLength(3)

      // First item: bold and italic
      expect(orderedList.content[0].content[0].content).toEqual([
        { type: 'text', text: 'Bold', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' and ' },
        { type: 'text', text: 'italic', marks: [{ type: 'italic' }] }
      ])

      // Second item: code and underline
      expect(orderedList.content[1].content[0].content).toEqual([
        { type: 'text', text: 'code', marks: [{ type: 'code' }] },
        { type: 'text', text: ' and ' },
        { type: 'text', text: 'underline', marks: [{ type: 'underline' }] }
      ])

      // Third item: link
      expect(orderedList.content[2].content[0].content).toEqual([
        {
          type: 'text',
          text: 'link',
          marks: [{ type: 'link', attrs: { href: 'https://test.com' } }]
        }
      ])
    })
  })

  describe('ParagraphBuilder formatting methods', () => {
    it('should support underline formatting in paragraphs', () => {
      const request = builder
        .paragraph()
        .text('This is ')
        .underline('underlined text')
        .text('.')
        .build()

      expect(request.bodyJson.content[0].content).toEqual([
        { type: 'text', text: 'This is ' },
        { type: 'text', text: 'underlined text', marks: [{ type: 'underline' }] },
        { type: 'text', text: '.' }
      ])
    })

    it('should support links in paragraphs', () => {
      const request = builder
        .paragraph()
        .text('Visit ')
        .link('our website', 'https://example.com')
        .text(' for more info.')
        .build()

      expect(request.bodyJson.content[0].content).toEqual([
        { type: 'text', text: 'Visit ' },
        {
          type: 'text',
          text: 'our website',
          marks: [{ type: 'link', attrs: { href: 'https://example.com' } }]
        },
        { type: 'text', text: ' for more info.' }
      ])
    })
  })

  describe('Error handling and validation', () => {
    it('should throw error for empty notes', () => {
      expect(() => builder.build()).toThrow('Note must contain at least one paragraph')
    })

    it('should throw error for paragraphs with no content', () => {
      // Create a note with an empty paragraph by directly manipulating state
      const builderWithEmptyParagraph = new NoteBuilder(mockClient, {
        paragraphs: [{ segments: [], lists: [] }]
      })

      expect(() => builderWithEmptyParagraph.build()).toThrow(
        'Each paragraph must contain at least one content block'
      )
    })

    it('should throw error for links without URL', () => {
      // Test the segmentToContent method directly for link validation
      const testBuilder = new NoteBuilder(mockClient, {
        paragraphs: [
          {
            segments: [{ text: 'test', type: 'link' }], // Missing URL
            lists: []
          }
        ]
      })

      expect(() => testBuilder.build()).toThrow('Link segments must have a URL')
    })

    it('should handle notes with attachment IDs', () => {
      // Test the attachment IDs branch in toNoteRequest
      const builderWithAttachment = new NoteBuilder(mockClient, {
        paragraphs: [{ segments: [{ text: 'test', type: 'simple' }], lists: [] }],
        attachmentIds: ['attachment-123']
      })

      const request = builderWithAttachment.build()
      expect(request.attachmentIds).toEqual(['attachment-123'])
    })

    it('should test getSegments method through ListBuilder.addItem', () => {
      // The getSegments method is called internally by ListBuilder.addItem
      // We can test this by building a list with multiple items
      const request = builder
        .paragraph()
        .bulletList()
        .item()
        .text('First item')
        .item() // This calls getSegments() internally
        .text('Second item')
        .finish()
        .build()

      const bulletList = request.bodyJson.content[0] as any
      expect(bulletList.content).toHaveLength(2)
      expect(bulletList.content[0].content[0].content[0].text).toBe('First item')
      expect(bulletList.content[1].content[0].content[0].text).toBe('Second item')
    })

    it('should test NoteWithLinkBuilder validation errors', () => {
      const noteWithLinkBuilder = new NoteWithLinkBuilder(mockClient, 'https://example.com')

      // Test empty note validation in NoteWithLinkBuilder's toNoteRequestWithState
      expect(() => {
        ;(noteWithLinkBuilder as any).toNoteRequestWithState({ paragraphs: [] })
      }).toThrow('Note must contain at least one paragraph')

      // Test empty paragraph validation in NoteWithLinkBuilder's toNoteRequestWithState
      expect(() => {
        ;(noteWithLinkBuilder as any).toNoteRequestWithState({
          paragraphs: [{ segments: [], lists: [] }]
        })
      }).toThrow('Each paragraph must contain at least one content block')
    })
  })

  describe('NoteWithLinkBuilder methods', () => {
    let noteWithLinkBuilder: NoteWithLinkBuilder

    beforeEach(() => {
      mockClient.post
        .mockResolvedValueOnce({ id: 'attachment-123' }) // Attachment response
        .mockResolvedValueOnce({ id: 'note-456', body: 'test' }) // Note response
      noteWithLinkBuilder = new NoteWithLinkBuilder(mockClient, 'https://example.com/test')
    })

    it('should override addParagraph to return NoteWithLinkBuilder', () => {
      const result = noteWithLinkBuilder.paragraph().text('Test paragraph')

      // The paragraph builder should still chain correctly
      expect(result).toBeDefined()

      const request = result.build()
      expect(request.bodyJson.content).toHaveLength(1)
      expect((request.bodyJson.content[0] as any).content[0].text).toBe('Test paragraph')
    })

    it('should handle copyState method correctly', async () => {
      // Test that state is properly copied when adding paragraphs
      await noteWithLinkBuilder
        .paragraph()
        .text('First paragraph')
        .paragraph()
        .text('Second paragraph')
        .publish()

      // Verify the note was created with both paragraphs
      const publishCall = mockClient.post.mock.calls[1] // Second call is note publishing
      const noteRequest = publishCall[1] as any
      expect(noteRequest.bodyJson.content).toHaveLength(2)
      expect(noteRequest.bodyJson.content[0].content[0].text).toBe('First paragraph')
      expect(noteRequest.bodyJson.content[1].content[0].text).toBe('Second paragraph')
    })

    it('should handle toNoteRequestWithState method with custom state', async () => {
      // Test complex note with attachment
      await noteWithLinkBuilder
        .paragraph()
        .text('Complex note with ')
        .bold('formatting')
        .paragraph()
        .bulletList()
        .item()
        .text('List item 1')
        .item()
        .text('List item 2')
        .finish()
        .publish()

      const publishCall = mockClient.post.mock.calls[1]
      const noteRequest = publishCall[1] as any

      // Should have paragraph + list
      expect(noteRequest.bodyJson.content).toHaveLength(2)
      expect(noteRequest.bodyJson.content[0].type).toBe('paragraph')
      expect(noteRequest.bodyJson.content[1].type).toBe('bulletList')
      expect(noteRequest.attachmentIds).toEqual(['attachment-123'])
    })
  })

  describe('Mixed content scenarios', () => {
    it('should handle paragraphs with both text and lists', () => {
      const request = builder
        .paragraph()
        .text('Introduction paragraph')
        .bulletList()
        .item()
        .text('Point 1')
        .item()
        .text('Point 2')
        .finish()
        .paragraph()
        .text('Conclusion paragraph')
        .build()

      expect(request.bodyJson.content).toHaveLength(3) // paragraph + list + paragraph
      expect(request.bodyJson.content[0].type).toBe('paragraph')
      expect(request.bodyJson.content[1].type).toBe('bulletList')
      expect(request.bodyJson.content[2].type).toBe('paragraph')
    })

    it('should handle numbered lists correctly', () => {
      const request = builder
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

      expect(request.bodyJson.content[0].type).toBe('orderedList')
      expect(request.bodyJson.content[0].content).toHaveLength(3)
    })

    it('should handle empty list gracefully', () => {
      // This tests the edge case of starting a list but finishing without items
      const request = builder.paragraph().text('Text before list').bulletList().finish().build()

      // Should still create the list structure even if empty
      expect(request.bodyJson.content).toHaveLength(2)
      expect(request.bodyJson.content[1].type).toBe('bulletList')
      expect(request.bodyJson.content[1].content).toHaveLength(0)
    })
  })

  describe('Segment to content conversion', () => {
    it('should handle simple text segments', () => {
      const request = builder.paragraph().text('Simple text').build()

      expect(request.bodyJson.content[0].content[0]).toEqual({
        type: 'text',
        text: 'Simple text'
      })
    })

    it('should handle all formatting types', () => {
      const request = builder
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

      const content = request.bodyJson.content[0].content
      expect(content[0]).toEqual({ type: 'text', text: 'bold', marks: [{ type: 'bold' }] })
      expect(content[2]).toEqual({ type: 'text', text: 'italic', marks: [{ type: 'italic' }] })
      expect(content[4]).toEqual({ type: 'text', text: 'code', marks: [{ type: 'code' }] })
      expect(content[6]).toEqual({
        type: 'text',
        text: 'underline',
        marks: [{ type: 'underline' }]
      })
      expect(content[8]).toEqual({
        type: 'text',
        text: 'link',
        marks: [{ type: 'link', attrs: { href: 'https://example.com' } }]
      })
    })
  })
})
