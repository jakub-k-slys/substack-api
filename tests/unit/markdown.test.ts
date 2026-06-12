import { parseMarkdownNote } from '@substackular/internal/markdown'
import { NoteBuilder } from '@substackular/domain/note-builder'
import type { HttpClient } from '@substackular/internal/http-client'

describe('parseMarkdownNote', () => {
  describe('validation', () => {
    it('should throw on empty input', () => {
      expect(() => parseMarkdownNote('')).toThrow('Note body cannot be empty')
    })

    it('should throw on whitespace-only input', () => {
      expect(() => parseMarkdownNote('   \n\n  ')).toThrow('Note body cannot be empty')
    })
  })

  describe('paragraphs', () => {
    it('should parse a simple paragraph', () => {
      const result = parseMarkdownNote('Hello world')

      expect(result).toEqual([{ segments: [{ text: 'Hello world', type: 'simple' }], lists: [] }])
    })

    it('should split blocks on blank lines', () => {
      const result = parseMarkdownNote('First paragraph\n\nSecond paragraph')

      expect(result).toHaveLength(2)
      expect(result[0].segments[0].text).toBe('First paragraph')
      expect(result[1].segments[0].text).toBe('Second paragraph')
    })

    it('should join single newlines within a block', () => {
      const result = parseMarkdownNote('line one\nline two')

      expect(result).toEqual([
        { segments: [{ text: 'line one\nline two', type: 'simple' }], lists: [] }
      ])
    })

    it('should treat literal \\n sequences as newlines', () => {
      const result = parseMarkdownNote('First\\n\\nSecond')

      expect(result).toHaveLength(2)
    })
  })

  describe('inline formatting', () => {
    it('should parse bold text', () => {
      const result = parseMarkdownNote('plain **bold** after')

      expect(result[0].segments).toEqual([
        { text: 'plain ', type: 'simple' },
        { text: 'bold', type: 'bold' },
        { text: ' after', type: 'simple' }
      ])
    })

    it('should parse italic text', () => {
      const result = parseMarkdownNote('an *italic* word')

      expect(result[0].segments).toEqual([
        { text: 'an ', type: 'simple' },
        { text: 'italic', type: 'italic' },
        { text: ' word', type: 'simple' }
      ])
    })

    it('should parse inline code', () => {
      const result = parseMarkdownNote('run `pnpm test` now')

      expect(result[0].segments).toEqual([
        { text: 'run ', type: 'simple' },
        { text: 'pnpm test', type: 'code' },
        { text: ' now', type: 'simple' }
      ])
    })

    it('should parse links with their URL', () => {
      const result = parseMarkdownNote('see [my site](https://example.com) here')

      expect(result[0].segments).toEqual([
        { text: 'see ', type: 'simple' },
        { text: 'my site', type: 'link', url: 'https://example.com' },
        { text: ' here', type: 'simple' }
      ])
    })

    it('should not let single-* italic consume bold markers', () => {
      const result = parseMarkdownNote('**bold** and *italic*')

      expect(result[0].segments).toEqual([
        { text: 'bold', type: 'bold' },
        { text: ' and ', type: 'simple' },
        { text: 'italic', type: 'italic' }
      ])
    })
  })

  describe('headings', () => {
    it('should render headings as bold paragraphs', () => {
      const result = parseMarkdownNote('# My Title')

      expect(result).toEqual([{ segments: [{ text: 'My Title', type: 'bold' }], lists: [] }])
    })

    it('should support all heading levels', () => {
      const result = parseMarkdownNote('###### Deep heading')

      expect(result[0].segments).toEqual([{ text: 'Deep heading', type: 'bold' }])
    })

    it('should keep existing marks inside headings', () => {
      const result = parseMarkdownNote('# Title with `code`')

      expect(result[0].segments).toEqual([
        { text: 'Title with ', type: 'bold' },
        { text: 'code', type: 'code' }
      ])
    })
  })

  describe('lists', () => {
    it('should group consecutive bullet items into one list', () => {
      const result = parseMarkdownNote('- first\n- second\n- third')

      expect(result).toEqual([
        {
          segments: [],
          lists: [
            {
              type: 'bullet',
              items: [
                { segments: [{ text: 'first', type: 'simple' }] },
                { segments: [{ text: 'second', type: 'simple' }] },
                { segments: [{ text: 'third', type: 'simple' }] }
              ]
            }
          ]
        }
      ])
    })

    it('should support * as bullet marker', () => {
      const result = parseMarkdownNote('* item')

      expect(result[0].lists[0].type).toBe('bullet')
    })

    it('should group numbered items into an ordered list', () => {
      const result = parseMarkdownNote('1. one\n2. two')

      expect(result).toEqual([
        {
          segments: [],
          lists: [
            {
              type: 'numbered',
              items: [
                { segments: [{ text: 'one', type: 'simple' }] },
                { segments: [{ text: 'two', type: 'simple' }] }
              ]
            }
          ]
        }
      ])
    })

    it('should parse inline formatting inside list items', () => {
      const result = parseMarkdownNote('- has **bold** inside')

      expect(result[0].lists[0].items[0].segments).toEqual([
        { text: 'has ', type: 'simple' },
        { text: 'bold', type: 'bold' },
        { text: ' inside', type: 'simple' }
      ])
    })

    it('should split bullet and numbered runs into separate lists', () => {
      const result = parseMarkdownNote('- bullet\n1. numbered')

      expect(result).toHaveLength(2)
      expect(result[0].lists[0].type).toBe('bullet')
      expect(result[1].lists[0].type).toBe('numbered')
    })
  })

  describe('mixed content', () => {
    it('should parse heading, paragraph, and list blocks together', () => {
      const result = parseMarkdownNote('# Title\n\nIntro text\n\n- point one\n- point two')

      expect(result).toHaveLength(3)
      expect(result[0].segments[0]).toEqual({ text: 'Title', type: 'bold' })
      expect(result[1].segments[0]).toEqual({ text: 'Intro text', type: 'simple' })
      expect(result[2].lists[0].items).toHaveLength(2)
    })

    it('should flush text accumulated before a list within the same block', () => {
      const result = parseMarkdownNote('Lead-in:\n- item')

      expect(result).toHaveLength(2)
      expect(result[0].segments[0].text).toBe('Lead-in:')
      expect(result[1].lists[0].items[0].segments[0].text).toBe('item')
    })
  })
})

describe('markdown -> NoteBuilder -> publish payload', () => {
  it('should build a valid Substack note request from markdown', () => {
    const mockClient = {} as HttpClient
    const paragraphs = parseMarkdownNote(
      '# Title\n\nHello **world** [link](https://x.com)\n\n- a\n- b'
    )
    const builder = paragraphs.reduce<NoteBuilder>(
      (b, p) => b.addParagraph(p),
      new NoteBuilder(mockClient)
    )

    const request = builder.build()

    expect(request).toEqual({
      bodyJson: {
        type: 'doc',
        attrs: { schemaVersion: 'v1' },
        content: [
          {
            type: 'paragraph',
            content: [{ type: 'text', text: 'Title', marks: [{ type: 'bold' }] }]
          },
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hello ' },
              { type: 'text', text: 'world', marks: [{ type: 'bold' }] },
              { type: 'text', text: ' ' },
              {
                type: 'text',
                text: 'link',
                marks: [{ type: 'link', attrs: { href: 'https://x.com' } }]
              }
            ]
          },
          {
            type: 'bulletList',
            content: [
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'a' }] }]
              },
              {
                type: 'listItem',
                content: [{ type: 'paragraph', content: [{ type: 'text', text: 'b' }] }]
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
})
