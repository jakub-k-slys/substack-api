/**
 * io-ts codecs and inferred types for Substack Gateway REST API response shapes.
 */
import * as t from 'io-ts'

// ------------------------------------------------------------------
// Profile
// ------------------------------------------------------------------

export const GatewayProfileC = t.intersection([
  t.type({
    id: t.number,
    handle: t.string,
    name: t.string,
    url: t.string,
    avatar_url: t.string
  }),
  t.partial({
    bio: t.union([t.string, t.null])
  })
])
export type GatewayProfile = t.TypeOf<typeof GatewayProfileC>

// ------------------------------------------------------------------
// Notes
// ------------------------------------------------------------------

export const GatewayNoteAuthorC = t.type({
  id: t.number,
  name: t.string,
  handle: t.string,
  avatar_url: t.string
})
export type GatewayNoteAuthor = t.TypeOf<typeof GatewayNoteAuthorC>

export const GatewayNoteC = t.type({
  id: t.number,
  body: t.string,
  likes_count: t.number,
  author: GatewayNoteAuthorC,
  published_at: t.string
})
export type GatewayNote = t.TypeOf<typeof GatewayNoteC>

export const GatewayNotesPageC = t.intersection([
  t.type({ items: t.array(GatewayNoteC) }),
  t.partial({ next_cursor: t.union([t.string, t.null]) })
])
export type GatewayNotesPage = t.TypeOf<typeof GatewayNotesPageC>

export const GatewayCreateNoteResponseC = t.type({ id: t.number })
export type GatewayCreateNoteResponse = t.TypeOf<typeof GatewayCreateNoteResponseC>

// ------------------------------------------------------------------
// Posts
// ------------------------------------------------------------------

export const GatewayPostC = t.intersection([
  t.type({
    id: t.number,
    title: t.string,
    published_at: t.string
  }),
  t.partial({
    subtitle: t.union([t.string, t.null]),
    truncated_body: t.union([t.string, t.null])
  })
])
export type GatewayPost = t.TypeOf<typeof GatewayPostC>

export const GatewayPostsPageC = t.intersection([
  t.type({ items: t.array(GatewayPostC) }),
  t.partial({ next_cursor: t.union([t.string, t.null]) })
])
export type GatewayPostsPage = t.TypeOf<typeof GatewayPostsPageC>

export const GatewayFullPostC = t.intersection([
  t.type({
    id: t.number,
    title: t.string,
    slug: t.string,
    url: t.string,
    published_at: t.string
  }),
  t.partial({
    subtitle: t.union([t.string, t.null]),
    html_body: t.union([t.string, t.null]),
    truncated_body: t.union([t.string, t.null]),
    reactions: t.union([t.record(t.string, t.number), t.null]),
    restacks: t.union([t.number, t.null]),
    tags: t.union([t.array(t.string), t.null]),
    cover_image: t.union([t.string, t.null])
  })
])
export type GatewayFullPost = t.TypeOf<typeof GatewayFullPostC>

// ------------------------------------------------------------------
// Comments
// ------------------------------------------------------------------

export const GatewayCommentC = t.type({
  id: t.number,
  body: t.string,
  is_admin: t.boolean
})
export type GatewayComment = t.TypeOf<typeof GatewayCommentC>

export const GatewayCommentsResponseC = t.type({
  items: t.array(GatewayCommentC)
})
export type GatewayCommentsResponse = t.TypeOf<typeof GatewayCommentsResponseC>

// ------------------------------------------------------------------
// Following
// ------------------------------------------------------------------

export const GatewayFollowingUserC = t.type({
  id: t.number,
  handle: t.string
})
export type GatewayFollowingUser = t.TypeOf<typeof GatewayFollowingUserC>

export const GatewayFollowingResponseC = t.type({
  items: t.array(GatewayFollowingUserC)
})
export type GatewayFollowingResponse = t.TypeOf<typeof GatewayFollowingResponseC>

// ------------------------------------------------------------------
// Drafts (response)
// ------------------------------------------------------------------

export interface GatewayDraft {
  title?: string | null
  subtitle?: string | null
  body?: string | null
}

export interface GatewayCreateDraftResponse {
  id: number
  uuid: string
}

// ------------------------------------------------------------------
// Request interfaces (outbound – no runtime validation needed)
// ------------------------------------------------------------------

export interface GatewayCreateNoteRequest {
  content: string
  attachment?: string | null
}

export interface GatewayCreateDraftRequest {
  title?: string | null
  subtitle?: string | null
  body?: string | null
}

export interface GatewayUpdateDraftRequest {
  title?: string | null
  subtitle?: string | null
  body?: string | null
}
