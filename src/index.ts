export { SubstackClient } from '@substackular/substack-client'
export { SubstackApiError, SubstackAuthError } from '@substackular/errors'
export { parseMarkdownNote } from '@substackular/internal/markdown'
export type { MarkdownParagraph } from '@substackular/internal/markdown'
export type { SubstackAuth, HttpClientOptions } from '@substackular/internal/http-client'
export {
  Profile,
  OwnProfile,
  PreviewPost,
  FullPost,
  Note,
  Comment,
  NoteBuilder,
  NoteWithLinkBuilder,
  ParagraphBuilder,
  ListBuilder,
  ListItemBuilder
} from '@substackular/domain'

export type {
  SubstackConfig,
  PaginationParams,
  SearchParams,
  PostsIteratorOptions,
  CommentsIteratorOptions,
  NotesIteratorOptions
} from '@substackular/types'

export type { TextSegment, ListItem, List } from '@substackular/domain'
