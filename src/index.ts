export { SubstackClient } from './substack-client'
export { Profile, OwnProfile, Post, Note, Comment } from './entities'

// Service layer exports for advanced users
export { ProfileService, PostService, NoteService, CommentService, MemoryCache } from './services'

export type {
  SubstackPublication,
  SubstackPost,
  SubstackComment,
  SubstackConfig,
  SubstackSearchResult,
  PaginationParams,
  SearchParams,
  NotesIteratorOptions
} from './types'

// Service layer types for advanced configuration
export type { ServiceConfig, Cache, Logger, SlugResolver } from './services'
