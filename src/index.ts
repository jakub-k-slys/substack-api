export { SubstackClient } from './substack-client'
export { Profile, OwnProfile, PreviewPost, FullPost, Note, Comment } from './domain'
export { NoteBuilder, ParagraphBuilder, ListBuilder, ListItemBuilder } from './note-builder'

export type {
  SubstackConfig,
  PaginationParams,
  SearchParams,
  PostsIteratorOptions,
  CommentsIteratorOptions,
  NotesIteratorOptions
} from './types'

export type { TextSegment, ListItem, List } from './note-builder'
