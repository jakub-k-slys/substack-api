import { PublishNoteRequest, PublishNoteResponse } from './internal'
import { SubstackHttpClient } from './http-client'

interface TextSegment {
  text: string
  type: 'bold' | 'italic' | 'code' | 'simple'
}

interface Paragraph {
  segments: TextSegment[]
}

/**
 * Builder for constructing rich text within a paragraph
 */
export class ParagraphBuilder {
  private segments: TextSegment[] = []

  constructor(private readonly noteBuilder: NoteBuilder) {}

  /**
   * Add plain text to the current paragraph
   */
  text(text: string): ParagraphBuilder {
    this.segments.push({ text, type: 'simple' })
    return this
  }

  /**
   * Add bold text to the current paragraph
   */
  bold(text: string): ParagraphBuilder {
    this.segments.push({ text, type: 'bold' })
    return this
  }

  /**
   * Add italic text to the current paragraph
   */
  italic(text: string): ParagraphBuilder {
    this.segments.push({ text, type: 'italic' })
    return this
  }

  /**
   * Add code text to the current paragraph
   */
  code(text: string): ParagraphBuilder {
    this.segments.push({ text, type: 'code' })
    return this
  }

  /**
   * Complete this paragraph and start a new one
   */
  paragraph(): ParagraphBuilder
  paragraph(text: string): NoteBuilder
  paragraph(text?: string): ParagraphBuilder | NoteBuilder {
    // Commit the current paragraph
    this.noteBuilder.addParagraph({ segments: this.segments })

    if (text) {
      // Simple paragraph case
      return this.noteBuilder.paragraph(text)
    } else {
      // Rich paragraph case
      return this.noteBuilder.paragraph()
    }
  }

  /**
   * Publish the note
   */
  async publish(): Promise<PublishNoteResponse> {
    // Commit the current paragraph before publishing
    this.noteBuilder.addParagraph({ segments: this.segments })
    return this.noteBuilder.publish()
  }
}

export class NoteBuilder {
  private paragraphs: Paragraph[] = []

  constructor(
    private readonly client: SubstackHttpClient,
    text?: string
  ) {
    if (text) {
      this.paragraphs.push({ segments: [{ text, type: 'simple' }] })
    }
  }

  /**
   * Add a paragraph to the note
   */
  addParagraph(paragraph: Paragraph): void {
    this.paragraphs.push(paragraph)
  }

  /**
   * Add a paragraph to the note
   */
  paragraph(): ParagraphBuilder
  paragraph(text: string): NoteBuilder
  paragraph(text?: string): ParagraphBuilder | NoteBuilder {
    if (text) {
      // Simple paragraph case
      this.paragraphs.push({ segments: [{ text, type: 'simple' }] })
      return this
    } else {
      // Rich paragraph case
      return new ParagraphBuilder(this)
    }
  }

  /**
   * Convert the builder's content to Substack's note format
   */
  private toNoteRequest(): PublishNoteRequest {
    const content = this.paragraphs.map((paragraph) => ({
      type: 'paragraph' as const,
      content: paragraph.segments.map((segment) => ({
        type: 'text' as const,
        text: segment.text,
        ...(segment.type !== 'simple' && {
          marks: [{ type: segment.type as 'bold' | 'italic' | 'code' }]
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
      tabId: 'for-you',
      surface: 'feed',
      replyMinimumRole: 'everyone'
    }
  }

  /**
   * Publish the note
   */
  async publish(): Promise<PublishNoteResponse> {
    return this.client.post<PublishNoteResponse>('/api/v1/comment/feed', this.toNoteRequest())
  }
}
