import { NoteBuilder, ParagraphBuilder } from '../../src/domain/note-builder'
import type { HttpClient } from '../../src/internal/http-client'
import type { PublishNoteResponse } from '../../src/internal'

describe('NoteBuilder Immutability', () => {
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

  describe('Builder Immutability', () => {
    it('should return new instances instead of mutating existing ones', () => {
      const builder1 = new NoteBuilder(mockHttpClient)
      const builder2 = builder1.paragraph()
      const builder3 = builder2.text('Hello')
      const builder4 = builder3.bold(' World')

      // Each method should return a new instance
      expect(builder1).not.toBe(builder2)
      expect(builder2).not.toBe(builder3)
      expect(builder3).not.toBe(builder4)

      // All should be instances of their respective classes
      expect(builder1).toBeInstanceOf(NoteBuilder)
      expect(builder2).toBeInstanceOf(ParagraphBuilder)
      expect(builder3).toBeInstanceOf(ParagraphBuilder)
      expect(builder4).toBeInstanceOf(ParagraphBuilder)
    })

    it('should allow branching without affecting original builders', async () => {
      const base = new NoteBuilder(mockHttpClient).paragraph().text('Shared text ')

      // Create two branches from the same base
      const branchA = base.bold('Branch A')
      const branchB = base.italic('Branch B')

      // Both branches should produce different results
      const resultA = await branchA.publish()
      const resultB = await branchB.publish()

      // Verify the first call (Branch A)
      expect(mockHttpClient.post).toHaveBeenNthCalledWith(1, '/api/v1/comment/feed', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Shared text '
                },
                {
                  type: 'text',
                  text: 'Branch A',
                  marks: [{ type: 'bold' }]
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })

      // Verify the second call (Branch B)
      expect(mockHttpClient.post).toHaveBeenNthCalledWith(2, '/api/v1/comment/feed', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Shared text '
                },
                {
                  type: 'text',
                  text: 'Branch B',
                  marks: [{ type: 'italic' }]
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })

      expect(resultA).toBe(mockPublishResponse)
      expect(resultB).toBe(mockPublishResponse)
      expect(mockHttpClient.post).toHaveBeenCalledTimes(2)
    })

    it('should allow complex branching with multiple paragraph builders', async () => {
      const noteBuilder = new NoteBuilder(mockHttpClient)

      // Create a paragraph with some initial content
      const baseParagraph = noteBuilder.paragraph().text('Start: ')

      // Branch 1: Add bold text and continue
      const branch1 = baseParagraph.bold('Bold').text(' ending')

      // Branch 2: Add italic text and continue
      const branch2 = baseParagraph.italic('Italic').text(' ending')

      // Both should produce different results
      const result1 = branch1.build()
      const result2 = branch2.build()

      expect(result1.bodyJson.content[0].content).toEqual([
        { type: 'text', text: 'Start: ' },
        { type: 'text', text: 'Bold', marks: [{ type: 'bold' }] },
        { type: 'text', text: ' ending' }
      ])

      expect(result2.bodyJson.content[0].content).toEqual([
        { type: 'text', text: 'Start: ' },
        { type: 'text', text: 'Italic', marks: [{ type: 'italic' }] },
        { type: 'text', text: ' ending' }
      ])
    })

    it('should maintain immutability with list builders', async () => {
      const base = new NoteBuilder(mockHttpClient)
        .paragraph()
        .text('Before list')
        .bulletList()
        .item()
        .text('Shared item: ')

      // Branch with different formatting in list items
      const branchA = base.bold('Bold item')
      const branchB = base.italic('Italic item')

      const resultA = branchA.finish().build()
      const resultB = branchB.finish().build()

      // Verify both results have the same base but different list item content
      const listContentA = resultA.bodyJson.content[1] as any
      const listContentB = resultB.bodyJson.content[1] as any

      expect(listContentA.content[0].content[0].content).toEqual([
        { type: 'text', text: 'Shared item: ' },
        { type: 'text', text: 'Bold item', marks: [{ type: 'bold' }] }
      ])

      expect(listContentB.content[0].content[0].content).toEqual([
        { type: 'text', text: 'Shared item: ' },
        { type: 'text', text: 'Italic item', marks: [{ type: 'italic' }] }
      ])
    })

    it('should support method chaining on immutable builders', async () => {
      // Traditional chaining should still work
      const result = await new NoteBuilder(mockHttpClient)
        .paragraph()
        .text('Hello ')
        .bold('bold ')
        .text('and ')
        .italic('italic')
        .text(' text')
        .publish()

      expect(mockHttpClient.post).toHaveBeenCalledWith('/api/v1/comment/feed', {
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                { type: 'text', text: 'Hello ' },
                { type: 'text', text: 'bold ', marks: [{ type: 'bold' }] },
                { type: 'text', text: 'and ' },
                { type: 'text', text: 'italic', marks: [{ type: 'italic' }] },
                { type: 'text', text: ' text' }
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

  describe('Regression Tests', () => {
    it('should not modify original builder when creating new paragraphs', async () => {
      const originalBuilder = new NoteBuilder(mockHttpClient)
      const withFirstParagraph = originalBuilder.paragraph().text('First paragraph')
      const withSecondParagraph = withFirstParagraph.paragraph().text('Second paragraph')

      // Original builder should still be empty
      expect(() => originalBuilder.build()).toThrow('Note must contain at least one paragraph')

      // First builder should have one paragraph
      const firstResult = withFirstParagraph.build()
      expect(firstResult.bodyJson.content).toHaveLength(1)

      // Second builder should have two paragraphs
      const secondResult = withSecondParagraph.build()
      expect(secondResult.bodyJson.content).toHaveLength(2)
    })

    it('should maintain state isolation between list builders', () => {
      const noteBuilder = new NoteBuilder(mockHttpClient)
      const paragraph = noteBuilder.paragraph().text('Before list')

      const list1 = paragraph.bulletList().item().text('Item 1')
      const list2 = paragraph.bulletList().item().text('Item 2')

      const result1 = list1.finish().build()
      const result2 = list2.finish().build()

      // Both should have different list content
      const listContent1 = result1.bodyJson.content[1] as any
      const listContent2 = result2.bodyJson.content[1] as any

      expect(listContent1.content[0].content[0].content[0].text).toBe('Item 1')
      expect(listContent2.content[0].content[0].content[0].text).toBe('Item 2')
    })
  })
})
