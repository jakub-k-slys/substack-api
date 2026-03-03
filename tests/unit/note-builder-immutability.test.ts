import { NoteBuilder, ParagraphBuilder } from '@substack-api/domain/note-builder'
import type { HttpClient } from '@substack-api/internal/http-client'

describe('NoteBuilder Immutability', () => {
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    mockClient = {
      get: jest.fn(),
      post: jest.fn()
    } as unknown as jest.Mocked<HttpClient>

    mockClient.post.mockResolvedValue({ id: 789 })
  })

  describe('Builder Immutability', () => {
    it('should return new instances instead of mutating existing ones', () => {
      const builder1 = new NoteBuilder(mockClient)
      const builder2 = builder1.paragraph()
      const builder3 = builder2.text('Hello')
      const builder4 = builder3.bold(' World')

      expect(builder1).not.toBe(builder2)
      expect(builder2).not.toBe(builder3)
      expect(builder3).not.toBe(builder4)

      expect(builder1).toBeInstanceOf(NoteBuilder)
      expect(builder2).toBeInstanceOf(ParagraphBuilder)
      expect(builder3).toBeInstanceOf(ParagraphBuilder)
      expect(builder4).toBeInstanceOf(ParagraphBuilder)
    })

    it('should allow branching without affecting original builders', async () => {
      const base = new NoteBuilder(mockClient).paragraph().text('Shared text ')

      const branchA = base.bold('Branch A')
      const branchB = base.italic('Branch B')

      await branchA.publish()
      await branchB.publish()

      expect(mockClient.post).toHaveBeenNthCalledWith(1, '/notes', {
        content: 'Shared text **Branch A**'
      })
      expect(mockClient.post).toHaveBeenNthCalledWith(2, '/notes', {
        content: 'Shared text _Branch B_'
      })
      expect(mockClient.post).toHaveBeenCalledTimes(2)
    })

    it('should allow complex branching with multiple paragraph builders', () => {
      const noteBuilder = new NoteBuilder(mockClient)
      const baseParagraph = noteBuilder.paragraph().text('Start: ')

      const branch1 = baseParagraph.bold('Bold').text(' ending')
      const branch2 = baseParagraph.italic('Italic').text(' ending')

      const result1 = branch1.build()
      const result2 = branch2.build()

      expect(result1).toBe('Start: **Bold** ending')
      expect(result2).toBe('Start: _Italic_ ending')
    })

    it('should support method chaining on immutable builders', async () => {
      await new NoteBuilder(mockClient)
        .paragraph()
        .text('Hello ')
        .bold('bold')
        .text(' and ')
        .italic('italic')
        .text(' text')
        .publish()

      expect(mockClient.post).toHaveBeenCalledWith('/notes', {
        content: 'Hello **bold** and _italic_ text'
      })
    })
  })

  describe('Regression Tests', () => {
    it('should not modify original builder when creating new paragraphs', () => {
      const originalBuilder = new NoteBuilder(mockClient)
      const withFirstParagraph = originalBuilder.paragraph().text('First paragraph')
      const withSecondParagraph = withFirstParagraph.paragraph().text('Second paragraph')

      expect(() => originalBuilder.build()).toThrow('Note must contain at least one paragraph')

      const firstResult = withFirstParagraph.build()
      expect(firstResult).toBe('First paragraph')

      const secondResult = withSecondParagraph.build()
      expect(secondResult).toBe('First paragraph\n\nSecond paragraph')
    })

    it('should maintain state isolation between list builders', () => {
      const noteBuilder = new NoteBuilder(mockClient)
      const paragraph = noteBuilder.paragraph().text('Before list\n\n')

      const list1 = paragraph.bulletList().item().text('Item 1')
      const list2 = paragraph.bulletList().item().text('Item 2')

      const result1 = list1.finish().build()
      const result2 = list2.finish().build()

      expect(result1).toContain('- Item 1')
      expect(result1).not.toContain('- Item 2')
      expect(result2).toContain('- Item 2')
      expect(result2).not.toContain('- Item 1')
    })
  })
})
