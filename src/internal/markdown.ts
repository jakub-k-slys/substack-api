/**
 * Markdown parser for Substack notes.
 *
 * Port of substack-gateway-oss's converters/markdown.py, adapted to emit
 * NoteBuilder paragraph structures so markdown input gets real ProseMirror
 * link marks and list nodes instead of flattened text.
 *
 * Supported syntax: **bold**, *italic*, `code`, [text](url) links,
 * # headings (rendered as bold paragraphs — notes have no heading nodes),
 * - bullet lists and 1. numbered lists. Blocks are separated by blank lines.
 */
import type { TextSegment, List } from '@substackular/domain/note-builder'

export interface MarkdownParagraph {
  segments: TextSegment[]
  lists: List[]
}

// Inline formatting: bold before italic so ** is not consumed by the single-* rule.
const INLINE = /\*\*(.*?)\*\*|\*(.*?)\*|`(.*?)`|\[([^\]]+)\]\(([^)]+)\)/g
const HEADING = /^#{1,6}\s+(.*)/
const UNORDERED = /^[-*]\s+(.*)/
const ORDERED = /^(\d+)\.\s+(.*)/

/**
 * Parse a markdown string into note paragraphs consumable by NoteBuilder.
 * @throws {Error} If the markdown is empty or produces no content
 */
export function parseMarkdownNote(markdown: string): MarkdownParagraph[] {
  // Tolerate literal "\n" sequences from JSON-encoded input
  const text = markdown.replace(/\\n/g, '\n')

  if (!text.trim()) {
    throw new Error('Note body cannot be empty - at least one paragraph with content is required')
  }

  const paragraphs: MarkdownParagraph[] = []
  for (const block of text.split(/\n\n/)) {
    paragraphs.push(...processBlock(block))
  }

  if (paragraphs.length === 0) {
    throw new Error('Note must contain at least one paragraph with actual content')
  }

  return paragraphs
}

function processBlock(block: string): MarkdownParagraph[] {
  const paragraphs: MarkdownParagraph[] = []
  let accumulated: string[] = []
  let list: List | null = null

  const flushText = (): void => {
    if (accumulated.length === 0) {
      return
    }
    const segments = parseInline(accumulated.join('\n'))
    if (segments.length > 0) {
      paragraphs.push({ segments, lists: [] })
    }
    accumulated = []
  }

  const flushList = (): void => {
    if (list && list.items.length > 0) {
      paragraphs.push({ segments: [], lists: [list] })
    }
    list = null
  }

  for (const line of block.split('\n')) {
    const heading = HEADING.exec(line)
    const unordered = heading ? null : UNORDERED.exec(line)
    const ordered = heading || unordered ? null : ORDERED.exec(line)

    if (heading) {
      flushText()
      flushList()
      const text = heading[1].trimEnd()
      if (text) {
        paragraphs.push({ segments: parseInline(text).map(boldify), lists: [] })
      }
    } else if (unordered) {
      flushText()
      if (!list || list.type !== 'bullet') {
        flushList()
        list = { type: 'bullet', items: [] }
      }
      const text = unordered[1].trimEnd()
      if (text) {
        list.items.push({ segments: parseInline(text) })
      }
    } else if (ordered) {
      flushText()
      if (!list || list.type !== 'numbered') {
        flushList()
        list = { type: 'numbered', items: [] }
      }
      const text = ordered[2].trimEnd()
      if (text) {
        list.items.push({ segments: parseInline(text) })
      }
    } else if (!line.trim()) {
      flushText()
      flushList()
    } else {
      flushList()
      accumulated.push(line)
    }
  }

  flushText()
  flushList()
  return paragraphs
}

function parseInline(text: string): TextSegment[] {
  const segments: TextSegment[] = []
  let lastEnd = 0

  for (const match of text.matchAll(INLINE)) {
    const index = match.index ?? 0
    if (index > lastEnd) {
      segments.push({ text: text.slice(lastEnd, index), type: 'simple' })
    }
    if (match[1] !== undefined) {
      segments.push({ text: match[1], type: 'bold' })
    } else if (match[2] !== undefined) {
      segments.push({ text: match[2], type: 'italic' })
    } else if (match[3] !== undefined) {
      segments.push({ text: match[3], type: 'code' })
    } else if (match[4] !== undefined) {
      segments.push({ text: match[4], type: 'link', url: match[5] })
    }
    lastEnd = index + match[0].length
  }

  if (lastEnd < text.length) {
    segments.push({ text: text.slice(lastEnd), type: 'simple' })
  }

  return segments.filter((segment) => segment.text)
}

// Headings render as bold; segments that already carry a mark keep it
// since note text nodes support a single mark per segment.
function boldify(segment: TextSegment): TextSegment {
  if (segment.type === 'simple') {
    return { ...segment, type: 'bold' }
  }
  return segment
}
