/**
 * Domain interfaces for iterator options and user-facing types
 */

export interface PostsIteratorOptions {
  limit?: number
}

export interface CommentsIteratorOptions {
  postId?: number
  limit?: number
}

export interface NotesIteratorOptions {
  limit?: number
}
