import type { HttpClient } from '@substack-api/internal/http-client'
import { GatewayCreateNoteResponseC } from '@substack-api/internal/types'
import type { GatewayCreateNoteResponse } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

interface TextSegment {
  text: string
  type: 'bold' | 'italic' | 'code' | 'underline' | 'link' | 'simple'
  url?: string
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
}

function segmentToMarkdown(segment: TextSegment): string {
  const { text, type, url } = segment
  switch (type) {
    case 'bold':
      return `**${text}**`
    case 'italic':
      return `_${text}_`
    case 'code':
      return `\`${text}\``
    case 'link':
      return `[${text}](${url})`
    case 'underline':
    case 'simple':
    default:
      return text
  }
}

function paragraphToMarkdown(paragraph: { segments: TextSegment[]; lists: List[] }): string {
  const parts: string[] = []

  if (paragraph.segments.length > 0) {
    parts.push(paragraph.segments.map(segmentToMarkdown).join(''))
  }

  for (const list of paragraph.lists) {
    const lines = list.items.map((item, i) => {
      const content = item.segments.map(segmentToMarkdown).join('')
      return list.type === 'bullet' ? `- ${content}` : `${i + 1}. ${content}`
    })
    parts.push(lines.join('\n'))
  }

  return parts.join('\n')
}

export class ListItemBuilder {
  private readonly state: ListItemBuilderState

  constructor(
    private readonly listBuilder: ListBuilder,
    state: ListItemBuilderState = { segments: [] }
  ) {
    this.state = state
  }

  text(text: string): ListItemBuilder {
    return new ListItemBuilder(this.listBuilder, {
      segments: [...this.state.segments, { text, type: 'simple' }]
    })
  }

  bold(text: string): ListItemBuilder {
    return new ListItemBuilder(this.listBuilder, {
      segments: [...this.state.segments, { text, type: 'bold' }]
    })
  }

  italic(text: string): ListItemBuilder {
    return new ListItemBuilder(this.listBuilder, {
      segments: [...this.state.segments, { text, type: 'italic' }]
    })
  }

  code(text: string): ListItemBuilder {
    return new ListItemBuilder(this.listBuilder, {
      segments: [...this.state.segments, { text, type: 'code' }]
    })
  }

  underline(text: string): ListItemBuilder {
    return new ListItemBuilder(this.listBuilder, {
      segments: [...this.state.segments, { text, type: 'underline' }]
    })
  }

  link(text: string, url: string): ListItemBuilder {
    return new ListItemBuilder(this.listBuilder, {
      segments: [...this.state.segments, { text, type: 'link', url }]
    })
  }

  getSegments(): TextSegment[] {
    return this.state.segments
  }

  item(): ListItemBuilder {
    return this.listBuilder.addItem({ segments: this.state.segments }).item()
  }

  finish(): ParagraphBuilder {
    return this.listBuilder.addItem({ segments: this.state.segments }).finish()
  }
}

export class ListBuilder {
  private readonly state: ListBuilderState

  constructor(
    type: 'bullet' | 'numbered',
    private readonly paragraphBuilder: ParagraphBuilder,
    state?: ListBuilderState
  ) {
    this.state = state || { type, items: [] }
  }

  addItem(item: ListItem): ListBuilder {
    return new ListBuilder(this.state.type, this.paragraphBuilder, {
      type: this.state.type,
      items: [...this.state.items, item]
    })
  }

  item(): ListItemBuilder {
    return new ListItemBuilder(this)
  }

  finish(): ParagraphBuilder {
    return this.paragraphBuilder.addList({ type: this.state.type, items: this.state.items })
  }
}

export class ParagraphBuilder {
  private readonly state: ParagraphBuilderState

  constructor(
    private readonly noteBuilder: NoteBuilder,
    state: ParagraphBuilderState = { segments: [], lists: [] }
  ) {
    this.state = state
  }

  text(text: string): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments, { text, type: 'simple' }],
      lists: [...this.state.lists]
    })
  }

  bold(text: string): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments, { text, type: 'bold' }],
      lists: [...this.state.lists]
    })
  }

  italic(text: string): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments, { text, type: 'italic' }],
      lists: [...this.state.lists]
    })
  }

  code(text: string): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments, { text, type: 'code' }],
      lists: [...this.state.lists]
    })
  }

  underline(text: string): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments, { text, type: 'underline' }],
      lists: [...this.state.lists]
    })
  }

  link(text: string, url: string): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments, { text, type: 'link', url }],
      lists: [...this.state.lists]
    })
  }

  bulletList(): ListBuilder {
    return new ListBuilder('bullet', this)
  }

  numberedList(): ListBuilder {
    return new ListBuilder('numbered', this)
  }

  addList(list: List): ParagraphBuilder {
    return new ParagraphBuilder(this.noteBuilder, {
      segments: [...this.state.segments],
      lists: [...this.state.lists, list]
    })
  }

  getParagraphContent(): { segments: TextSegment[]; lists: List[] } {
    return { segments: this.state.segments, lists: this.state.lists }
  }

  paragraph(): ParagraphBuilder {
    return this.noteBuilder.addParagraph(this.getParagraphContent()).paragraph()
  }

  build(): string {
    return this.noteBuilder.addParagraph(this.getParagraphContent()).build()
  }

  async publish(): Promise<GatewayCreateNoteResponse> {
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

  addParagraph(paragraph: { segments: TextSegment[]; lists: List[] }): NoteBuilder {
    return new NoteBuilder(this.client, {
      paragraphs: [...this.state.paragraphs, paragraph]
    })
  }

  paragraph(): ParagraphBuilder {
    return new ParagraphBuilder(this)
  }

  protected toMarkdown(): string {
    if (this.state.paragraphs.length === 0) {
      throw new Error('Note must contain at least one paragraph')
    }
    for (const paragraph of this.state.paragraphs) {
      if (paragraph.segments.length === 0 && paragraph.lists.length === 0) {
        throw new Error('Each paragraph must contain at least one content block')
      }
    }
    return this.state.paragraphs.map(paragraphToMarkdown).join('\n\n')
  }

  build(): string {
    return this.toMarkdown()
  }

  async publish(): Promise<GatewayCreateNoteResponse> {
    const raw = await this.client.post<unknown>('/notes', { content: this.toMarkdown() })
    return decodeOrThrow(GatewayCreateNoteResponseC, raw, 'GatewayCreateNoteResponse')
  }
}

export class NoteWithLinkBuilder extends NoteBuilder {
  constructor(
    client: HttpClient,
    private readonly linkUrl: string
  ) {
    super(client)
  }

  addParagraph(paragraph: { segments: TextSegment[]; lists: List[] }): NoteWithLinkBuilder {
    const next = new NoteWithLinkBuilder(this.client, this.linkUrl)
    ;(next as any).state = {
      paragraphs: [...this.state.paragraphs, paragraph]
    }
    return next
  }

  async publish(): Promise<GatewayCreateNoteResponse> {
    const raw = await this.client.post<unknown>('/notes', {
      content: this.toMarkdown(),
      attachment: this.linkUrl
    })
    return decodeOrThrow(GatewayCreateNoteResponseC, raw, 'GatewayCreateNoteResponse')
  }
}
