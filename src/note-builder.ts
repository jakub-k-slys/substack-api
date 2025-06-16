import { NoteBodyJson, PublishNoteRequest, PublishNoteResponse } from './types'
import { Substack } from './client'

interface TextSegment {
  text: string
  type: 'bold' | 'italic' | 'simple'
}

interface Paragraph {
  segments: TextSegment[]
}

export class NoteBuilder {
  private paragraphs: Paragraph[] = []
  private currentParagraph: Paragraph = { segments: [] }

  constructor(private readonly client: Substack, text?: string) {
    if (text) {
      this.currentParagraph.segments.push({ text, type: 'simple' })
    }
  }

  /**
   * Start a new paragraph
   */
  note(text: string): NoteBuilder {
    if (this.currentParagraph.segments.length > 0) {
      this.paragraphs.push(this.currentParagraph)
    }
    this.currentParagraph = { segments: [{ text, type: 'simple' }] }
    return this
  }

  /**
   * Add bold text to the current paragraph
   */
  bold(text: string): NoteBuilder {
    this.currentParagraph.segments.push({ text, type: 'bold' })
    return this
  }

  /**
   * Add italic text to the current paragraph
   */
  italic(text: string): NoteBuilder {
    this.currentParagraph.segments.push({ text, type: 'italic' })
    return this
  }

  /**
   * Add plain text to the current paragraph
   */
  simple(text: string): NoteBuilder {
    this.currentParagraph.segments.push({ text, type: 'simple' })
    return this
  }

  /**
   * Convert the builder's content to Substack's note format
   */
  private toNoteRequest(): PublishNoteRequest {
    const allParagraphs = [...this.paragraphs]
    if (this.currentParagraph.segments.length > 0) {
      allParagraphs.push(this.currentParagraph)
    }

    const content = allParagraphs.map(paragraph => ({
      type: 'paragraph' as const,
      content: paragraph.segments.map(segment => ({
        type: 'text' as const,
        text: segment.text,
        ...(segment.type !== 'simple' && {
          marks: [{ type: segment.type }]
        })
      }))
    }))

    return {
      bodyJson: {
        type: 'doc',
        attrs: {
          schemaVersion: 'v1'
        },
        content
      },
      replyMinimumRole: 'everyone'
    }
  }

  /**
   * Publish the note
   */
  async publish(): Promise<PublishNoteResponse> {
    return this.client.publishNoteRequest(this.toNoteRequest())
  }
}
