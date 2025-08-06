import {
  PublishNoteRequest,
  PublishNoteResponse,
  CreateAttachmentRequest,
  CreateAttachmentResponse
} from '../internal'
import { HttpClient } from '../internal/http-client'

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

// Export the public types for consumers
export type { TextSegment, ListItem, List }

interface ListItemBuilderState {
  segments: TextSegment[]
}

interface ListBuilderState {
  type: 'bullet' | 'numbered'
  items: ListItem[]
}

interface ParagraphBuilderState {
  segments: TextSegment[]
  lists: List[]
}

interface NoteBuilderState {
  paragraphs: Array<{ segments: TextSegment[]; lists: List[] }>
  attachmentIds?: string[]
}

/**
 * Builder for constructing list items - similar to paragraph but no nested lists allowed
 */
export class ListItemBuilder {
  private readonly state: ListItemBuilderState

  constructor(
    private readonly listBuilder: ListBuilder,
    state: ListItemBuilderState = { segments: [] }
  ) {
    this.state = state
  }

  /**
   * Add plain text to the current list item
   */
  text(text: string): ListItemBuilder {
    return new ListItemBuilder(this.listBuilder, {
      segments: [...this.state.segments, { text, type: 'simple' }]
    })
  }

  /**
   * Add bold text to the current list item
   */
  bold(text: string): ListItemBuilder {
    return new ListItemBuilder(this.listBuilder, {
      segments: [...this.state.segments, { text, type: 'bold' }]
    })
  }

  /**
   * Add italic text to the current list item
   */
  italic(text: string): ListItemBuilder {
    return new ListItemBuilder(this.listBuilder, {
      segments: [...this.state.segments, { text, type: 'italic' }]
    })
  }

  /**
   * Add code text to the current list item
   */
  code(text: string): ListItemBuilder {
    return new ListItemBuilder(this.listBuilder, {
      segments: [...this.state.segments, { text, type: 'code' }]
    })
  }

  /**
   * Add underlined text to the current list item
   */
  underline(text: string): ListItemBuilder {
    return new ListItemBuilder(this.listBuilder, {
      segments: [...this.state.segments, { text, type: 'underline' }]
    })
  }

  /**
   * Add a link to the current list item
   */
  link(text: string, url: string): ListItemBuilder {
    return new ListItemBuilder(this.listBuilder, {
      segments: [...this.state.segments, { text, type: 'link', url }]
    })
  }

  /**
   * Get the current segments (used by ListBuilder)
   */
  getSegments(): TextSegment[] {
    return this.state.segments
  }

  /**
   * Return to the list builder to add another item
   */
  item(): ListItemBuilder {
    // Commit current item and create new one
    return this.listBuilder.addItem({ segments: this.state.segments }).item()
  }

  /**
   * Finish the list and return to paragraph
   */
  finish(): ParagraphBuilder {
    // Commit current item
    return this.listBuilder.addItem({ segments: this.state.segments }).finish()
  }
}

/**
 * Builder for constructing lists within a paragraph
 */
export class ListBuilder {
  private readonly state: ListBuilderState

  constructor(
    type: 'bullet' | 'numbered',
    private readonly paragraphBuilder: ParagraphBuilder,
    state?: ListBuilderState
  ) {
    this.state = state || { type, items: [] }
  }

  /**
   * Add an item to the current list
   */
  addItem(item: ListItem): ListBuilder {
    return new ListBuilder(this.state.type, this.paragraphBuilder, {
      type: this.state.type,
      items: [...this.state.items, item]
    })
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
    return this.paragraphBuilder.addList({ type: this.state.type, items: this.state.items })
  }
}

/**
 * Builder for constructing rich text within a paragraph
 */
export class ParagraphBuilder {
  private readonly state: ParagraphBuilderState

  constructor(
    private readonly noteBuilder: NoteBuilder,
    state: ParagraphBuilderState = { segments: [], lists: [] }
  ) {
    this.state = state
  }

  /**
   * Add plain text to the current paragraph
   */
  text(text: string): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments, { text, type: 'simple' }],
      lists: [...this.state.lists]
    })
  }

  /**
   * Add bold text to the current paragraph
   */
  bold(text: string): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments, { text, type: 'bold' }],
      lists: [...this.state.lists]
    })
  }

  /**
   * Add italic text to the current paragraph
   */
  italic(text: string): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments, { text, type: 'italic' }],
      lists: [...this.state.lists]
    })
  }

  /**
   * Add code text to the current paragraph
   */
  code(text: string): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments, { text, type: 'code' }],
      lists: [...this.state.lists]
    })
  }

  /**
   * Add underlined text to the current paragraph
   */
  underline(text: string): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments, { text, type: 'underline' }],
      lists: [...this.state.lists]
    })
  }

  /**
   * Add a link to the current paragraph
   */
  link(text: string, url: string): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments, { text, type: 'link', url }],
      lists: [...this.state.lists]
    })
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
  addList(list: List): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments],
      lists: [...this.state.lists, list]
    })
  }

  /**
   * Get the current paragraph content (used by NoteBuilder)
   */
  getParagraphContent(): { segments: TextSegment[]; lists: List[] } {
    return { segments: this.state.segments, lists: this.state.lists }
  }

  /**
   * Start a new paragraph
   */
  paragraph(): ParagraphBuilder {
    // Commit the current paragraph
    return this.noteBuilder.addParagraph(this.getParagraphContent()).paragraph()
  }

  /**
   * Build and validate the note
   */
  build(): PublishNoteRequest {
    // Commit the current paragraph before building
    return this.noteBuilder.addParagraph(this.getParagraphContent()).build()
  }

  /**
   * Publish the note directly
   */
  async publish(): Promise<PublishNoteResponse> {
    // Commit the current paragraph before publishing
    return this.noteBuilder.addParagraph(this.getParagraphContent()).publish()
  }
}

export class NoteBuilder {
  protected readonly state: NoteBuilderState

  constructor(
    protected readonly client: HttpClient,
    state: NoteBuilderState = { paragraphs: [] }
  ) {
    this.state = state
  }

  /**
   * Add a paragraph to the note (used by ParagraphBuilder)
   */
  addParagraph(paragraph: { segments: TextSegment[]; lists: List[] }): NoteBuilder {
    return new NoteBuilder(this.client, {
      paragraphs: [...this.state.paragraphs, paragraph],
      attachmentIds: this.state.attachmentIds
    })
  }

  /**
   * Start a paragraph
   */
  paragraph(): ParagraphBuilder {
    return new ParagraphBuilder(this)
  }

  /**
   * Convert the builder's content to Substack's note format
   */
  private toNoteRequest(): PublishNoteRequest {
    // Validation: must have at least one paragraph
    if (this.state.paragraphs.length === 0) {
      throw new Error('Note must contain at least one paragraph')
    }

    // Validation: each paragraph must have content
    for (const paragraph of this.state.paragraphs) {
      if (paragraph.segments.length === 0 && paragraph.lists.length === 0) {
        throw new Error('Each paragraph must contain at least one content block')
      }
    }

    const content = this.state.paragraphs.flatMap((paragraph) => {
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

    const request: PublishNoteRequest = {
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

    if (this.state.attachmentIds && this.state.attachmentIds.length > 0) {
      request.attachmentIds = this.state.attachmentIds
    }

    return request
  }

  /**
   * Convert a text segment to Substack content format
   */
  protected segmentToContent(segment: TextSegment) {
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

/**
 * Extended NoteBuilder that creates an attachment for a link and publishes the note with the attachment
 */
export class NoteWithLinkBuilder extends NoteBuilder {
  constructor(
    client: HttpClient,
    private readonly linkUrl: string
  ) {
    super(client)
  }

  /**
   * Add a paragraph to the note (used by ParagraphBuilder) - returns NoteWithLinkBuilder to preserve attachment logic
   */
  addParagraph(paragraph: { segments: TextSegment[]; lists: List[] }): NoteWithLinkBuilder {
    return new NoteWithLinkBuilder(this.client, this.linkUrl).copyState({
      paragraphs: [...this.state.paragraphs, paragraph],
      attachmentIds: this.state.attachmentIds
    })
  }

  /**
   * Copy state to new instance - helper method
   */
  private copyState(state: NoteBuilderState): NoteWithLinkBuilder {
    const newBuilder = new NoteWithLinkBuilder(this.client, this.linkUrl)
    ;(newBuilder as any).state = state
    return newBuilder
  }

  /**
   * Publish the note with the link attachment
   */
  async publish(): Promise<PublishNoteResponse> {
    // First, create the attachment for the link
    const attachmentRequest: CreateAttachmentRequest = {
      url: this.linkUrl,
      type: 'link'
    }

    const attachmentResponse = await this.client.post<CreateAttachmentResponse>(
      '/api/v1/comment/attachment',
      attachmentRequest
    )

    // Update the state with the attachment ID
    const updatedState: NoteBuilderState = {
      paragraphs: this.state.paragraphs,
      attachmentIds: [attachmentResponse.id]
    }

    // Create the request with attachment
    const request = this.toNoteRequestWithState(updatedState)

    // Publish the note with attachment
    return this.client.post<PublishNoteResponse>('/api/v1/comment/feed', request)
  }

  /**
   * Convert the builder's content to Substack's note format with custom state
   */
  private toNoteRequestWithState(state: NoteBuilderState): PublishNoteRequest {
    // Validation: must have at least one paragraph
    if (state.paragraphs.length === 0) {
      throw new Error('Note must contain at least one paragraph')
    }

    // Validation: each paragraph must have content
    for (const paragraph of state.paragraphs) {
      if (paragraph.segments.length === 0 && paragraph.lists.length === 0) {
        throw new Error('Each paragraph must contain at least one content block')
      }
    }

    const content = state.paragraphs.flatMap((paragraph) => {
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

    const request: PublishNoteRequest = {
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

    if (state.attachmentIds && state.attachmentIds.length > 0) {
      request.attachmentIds = state.attachmentIds
    }

    return request
  }
}
