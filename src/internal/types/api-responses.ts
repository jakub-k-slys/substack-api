/**
 * Internal API response types - not exported from the public API
 * These represent raw response shapes from Substack's API endpoints
 * Using io-ts codecs for runtime validation
 */

import * as t from 'io-ts'

/**
 * Raw API response shape for publications - flattened
 */
export const SubstackPublicationCodec = t.intersection([
  t.type({
    name: t.string,
    hostname: t.string,
    subdomain: t.string
  }),
  t.partial({
    logo_url: t.string,
    description: t.string
  })
])

export type SubstackPublication = t.TypeOf<typeof SubstackPublicationCodec>

/**
 * Raw API response shape for posts - minimal validation
 * Only validates fields actually used by PreviewPost domain class
 */
export const SubstackPreviewPostCodec = t.intersection([
  t.type({
    id: t.number,
    title: t.string,
    post_date: t.string
  }),
  t.partial({
    subtitle: t.string,
    truncated_body_text: t.string
  })
])

export type SubstackPreviewPost = t.TypeOf<typeof SubstackPreviewPostCodec>

/**
 * Raw API response shape for full posts from /posts/by-id/:id endpoint
 * Only validates fields actually used by FullPost domain class
 */
export const SubstackFullPostCodec = t.intersection([
  t.type({
    id: t.number,
    title: t.string,
    slug: t.string,
    post_date: t.string,
    canonical_url: t.string
  }),
  t.partial({
    subtitle: t.string,
    truncated_body_text: t.string,
    body_html: t.string,
    htmlBody: t.string,
    reactions: t.record(t.string, t.number),
    restacks: t.number,
    postTags: t.array(t.string),
    cover_image: t.string
  })
])

export type SubstackFullPost = t.TypeOf<typeof SubstackFullPostCodec>

/**
 * Raw API response shape for comments from /post/{id}/comments endpoint
 * Uses actual field names from the API response
 */
export const SubstackCommentCodec = t.intersection([
  t.type({
    id: t.number,
    body: t.string
  }),
  t.partial({
    author_is_admin: t.boolean
  })
])

export type SubstackComment = t.TypeOf<typeof SubstackCommentCodec>

/**
 * Response structure from /reader/comment/{id} endpoint - keeping wrapper structure
 */
export const SubstackCommentResponseCodec = t.type({
  item: t.type({
    comment: t.intersection([
      t.type({
        id: t.number,
        body: t.string,
        user_id: t.number,
        name: t.string,
        date: t.string
      }),
      t.partial({
        post_id: t.union([t.number, t.null])
      })
    ])
  })
})

export type SubstackCommentResponse = t.TypeOf<typeof SubstackCommentResponseCodec>
/**
 * Minimal codec for Profile API responses - only validates fields we actually use
 * This is for /user/{slug}/public_profile endpoint
 */
export const SubstackFullProfileCodec = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    handle: t.string,
    photo_url: t.string
  }),
  t.partial({
    bio: t.string
  })
])

export type SubstackFullProfile = t.TypeOf<typeof SubstackFullProfileCodec>

/**
 * Minimal codec for Note user in context - only validates fields we actually use
 */
const SubstackNoteUserCodec = t.type({
  id: t.number,
  name: t.string,
  handle: t.string,
  photo_url: t.string
})

/**
 * Minimal codec for Note context - only validates fields we actually use
 */
const SubstackNoteContextCodec = t.type({
  timestamp: t.string,
  users: t.array(SubstackNoteUserCodec)
})

/**
 * Minimal codec for Note comment - only validates fields we actually use
 */
const SubstackNoteCommentCodec = t.intersection([
  t.type({
    id: t.number,
    body: t.string
  }),
  t.partial({
    reaction_count: t.number
  })
])

/**
 * Minimal codec for Note API responses - only validates fields we actually use
 * This is for /reader/feed/profile/{id} and similar note endpoints
 */
export const SubstackNoteCodec = t.intersection([
  t.type({
    entity_key: t.string,
    context: SubstackNoteContextCodec
  }),
  t.partial({
    comment: SubstackNoteCommentCodec,
    parentComments: t.array(SubstackNoteCommentCodec)
  })
])

export type SubstackNote = t.TypeOf<typeof SubstackNoteCodec>
