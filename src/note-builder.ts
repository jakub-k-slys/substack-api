import { PublishNoteRequest, PublishNoteResponse } from './internal'
import { HttpClient } from './internal/http-client'

interface TextSegment {
  text: string
  type: 'bold' | 'italic' | 'code' | 'underline' | 'link' | 'simple'
  url?: string // For link segments
}

interface ListItem {
  segments: TextSegment[]
}

interface List {
  type: 'bullet' | 'numbered'
  items: ListItem[]
}

/**
 * Builder for constructing list items - similar to paragraph but no nested lists allowed
 */
export class ListItemBuilder {
  private segments: TextSegment[] = []

  constructor(private readonly listBuilder: ListBuilder) {}

  /**
   * Add plain text to the current list item
   */
  text(text: string): ListItemBuilder {
    this.segments.push({ text, type: 'simple' })
    return this
  }

  /**
   * Add bold text to the current list item
   */
  bold(text: string): ListItemBuilder {
    this.segments.push({ text, type: 'bold' })
    return this
  }

  /**
   * Add italic text to the current list item
   */
  italic(text: string): ListItemBuilder {
    this.segments.push({ text, type: 'italic' })
    return this
  }

  /**
   * Add code text to the current list item
   */
  code(text: string): ListItemBuilder {
    this.segments.push({ text, type: 'code' })
    return this
  }

  /**
   * Add underlined text to the current list item
   */
  underline(text: string): ListItemBuilder {
    this.segments.push({ text, type: 'underline' })
    return this
  }

  /**
   * Add a link to the current list item
   */
  link(text: string, url: string): ListItemBuilder {
    this.segments.push({ text, type: 'link', url })
    return this
  }

  /**
   * Get the current segments (used by ListBuilder)
   */
  getSegments(): TextSegment[] {
    return this.segments
  }

  /**
   * Return to the list builder to add another item
   */
  item(): ListItemBuilder {
    // Commit current item and create new one
    this.listBuilder.addItem({ segments: this.segments })
    return this.listBuilder.item()
  }

  /**
   * Finish the list and return to paragraph
   */
  finish(): ParagraphBuilder {
    // Commit current item
    this.listBuilder.addItem({ segments: this.segments })
    return this.listBuilder.finish()
  }
}

/**
 * Builder for constructing lists within a paragraph
 */
export class ListBuilder {
  private items: ListItem[] = []

  constructor(
    private readonly type: 'bullet' | 'numbered',
    private readonly paragraphBuilder: ParagraphBuilder
  ) {}

  /**
   * Add an item to the current list
   */
  addItem(item: ListItem): void {
    this.items.push(item)
  }

  /**
   * Start a new list item
   */
  item(): ListItemBuilder {
    return new ListItemBuilder(this)
  }

  /**
   * Finish the list and return to paragraph
   */
  finish(): ParagraphBuilder {
    // Add the completed list to the paragraph
    this.paragraphBuilder.addList({ type: this.type, items: this.items })
    return this.paragraphBuilder
  }
}

/**
 * Builder for constructing rich text within a paragraph
 */
export class ParagraphBuilder {
  private segments: TextSegment[] = []
  private lists: List[] = []

  constructor(private readonly noteBuilder: PostBuilder) {}

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
   * Add underlined text to the current paragraph
   */
  underline(text: string): ParagraphBuilder {
    this.segments.push({ text, type: 'underline' })
    return this
  }

  /**
   * Add a link to the current paragraph
   */
  link(text: string, url: string): ParagraphBuilder {
    this.segments.push({ text, type: 'link', url })
    return this
  }

  /**
   * Start a bullet list in the current paragraph
   */
  bulletList(): ListBuilder {
    return new ListBuilder('bullet', this)
  }

  /**
   * Start a numbered list in the current paragraph
   */
  numberedList(): ListBuilder {
    return new ListBuilder('numbered', this)
  }

  /**
   * Add a list to the current paragraph (used by ListBuilder)
   */
  addList(list: List): void {
    this.lists.push(list)
  }

  /**
   * Get the current paragraph content (used by PostBuilder)
   */
  getParagraphContent(): { segments: TextSegment[]; lists: List[] } {
    return { segments: this.segments, lists: this.lists }
  }

  /**
   * Start a new paragraph
   */
  newNode(): NodeBuilder {
    // Commit the current paragraph
    this.noteBuilder.addParagraph(this.getParagraphContent())
    return this.noteBuilder.newNode()
  }

  /**
   * Build and validate the note
   */
  build(): PublishNoteRequest {
    // Commit the current paragraph before building
    this.noteBuilder.addParagraph(this.getParagraphContent())
    return this.noteBuilder.build()
  }

  /**
   * Publish the note directly
   */
  async publish(): Promise<PublishNoteResponse> {
    // Commit the current paragraph before publishing
    this.noteBuilder.addParagraph(this.getParagraphContent())
    return this.noteBuilder.publish()
  }
}

/**
 * Restricted builder returned by newNode() that requires calling paragraph() next
 */
export class NodeBuilder {
  constructor(private readonly noteBuilder: PostBuilder) {}

  /**
   * Start a paragraph - required after newNode()
   */
  paragraph(): ParagraphBuilder {
    return this.noteBuilder.paragraph()
  }
}

export class PostBuilder {
  private paragraphs: Array<{ segments: TextSegment[]; lists: List[] }> = []

  constructor(private readonly client: HttpClient) {
    // Constructor no longer accepts text parameter
  }

  /**
   * Start building a new node - required first step
   */
  newNode(): NodeBuilder {
    return new NodeBuilder(this)
  }

  /**
   * Add a paragraph to the note (used by ParagraphBuilder)
   */
  addParagraph(paragraph: { segments: TextSegment[]; lists: List[] }): void {
    this.paragraphs.push(paragraph)
  }

  /**
   * Start a paragraph (called by NodeBuilder)
   */
  paragraph(): ParagraphBuilder {
    return new ParagraphBuilder(this)
  }

  /**
   * Convert the builder's content to Substack's note format
   */
  private toNoteRequest(): PublishNoteRequest {
    // Validation: must have at least one paragraph
    if (this.paragraphs.length === 0) {
      throw new Error('Note must contain at least one paragraph')
    }

    // Validation: each paragraph must have content
    for (const paragraph of this.paragraphs) {
      if (paragraph.segments.length === 0 && paragraph.lists.length === 0) {
        throw new Error('Each paragraph must contain at least one content block')
      }
    }

    const content = this.paragraphs.flatMap((paragraph) => {
      const elements = []

      // Add paragraph content if it has segments
      if (paragraph.segments.length > 0) {
        elements.push({
          type: 'paragraph' as const,
          content: paragraph.segments.map((segment) => this.segmentToContent(segment))
        })
      }

      // Add list content
      for (const list of paragraph.lists) {
        elements.push({
          type: list.type === 'bullet' ? ('bulletList' as const) : ('orderedList' as const),
          content: list.items.map((item) => ({
            type: 'listItem' as const,
            content: [
              {
                type: 'paragraph' as const,
                content: item.segments.map((segment) => this.segmentToContent(segment))
              }
            ]
          }))
        })
      }

      return elements
    })

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
   * Convert a text segment to Substack content format
   */
  private segmentToContent(segment: TextSegment) {
    const base = {
      type: 'text' as const,
      text: segment.text
    }

    if (segment.type === 'simple') {
      return base
    }

    if (segment.type === 'link') {
      if (!segment.url) {
        throw new Error('Link segments must have a URL')
      }
      return {
        ...base,
        marks: [{ type: 'link' as const, attrs: { href: segment.url } }]
      }
    }

    // For other formatting types
    return {
      ...base,
      marks: [{ type: segment.type as 'bold' | 'italic' | 'code' | 'underline' }]
    }
  }

  /**
   * Build and validate the note
   */
  build(): PublishNoteRequest {
    return this.toNoteRequest()
  }

  /**
   * Publish the note
   */
  async publish(): Promise<PublishNoteResponse> {
    return this.client.post<PublishNoteResponse>('/api/v1/comment/feed', this.toNoteRequest())
  }
}
