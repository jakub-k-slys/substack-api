/**
 * io-ts codecs for runtime-safe decoding of internal API response types
 * These codecs validate raw API responses at runtime before transforming to domain models
 */

import * as t from 'io-ts'

// Core Post codec - matches SubstackPost from api-responses.ts
export const RawPostCodec = t.type({
  id: t.number,
  title: t.string,
  slug: t.string,
  post_date: t.string,
  canonical_url: t.string,
  type: t.union([t.literal('newsletter'), t.literal('podcast'), t.literal('thread')]),
  subtitle: t.union([t.string, t.undefined]),
  description: t.union([t.string, t.undefined]),
  audience: t.union([t.string, t.undefined]),
  cover_image: t.union([t.string, t.undefined]),
  podcast_url: t.union([t.string, t.undefined]),
  published: t.union([t.boolean, t.undefined]),
  paywalled: t.union([t.boolean, t.undefined]),
  truncated_body_text: t.union([t.string, t.undefined]),
  htmlBody: t.union([t.string, t.undefined])
})

export type RawPost = t.TypeOf<typeof RawPostCodec>

// Core Comment codec - matches SubstackComment from api-responses.ts
export const RawCommentCodec = t.type({
  id: t.number,
  body: t.string,
  created_at: t.string,
  parent_post_id: t.number,
  author_id: t.number,
  author_name: t.string,
  author_is_admin: t.union([t.boolean, t.undefined])
})

export type RawComment = t.TypeOf<typeof RawCommentCodec>

// Comment Response codec - matches SubstackCommentResponse from api-responses.ts
export const RawCommentResponseCodec = t.type({
  item: t.type({
    comment: t.type({
      id: t.number,
      body: t.string,
      user_id: t.number,
      name: t.string,
      date: t.string,
      post_id: t.union([t.number, t.null, t.undefined])
    })
  })
})

export type RawCommentResponse = t.TypeOf<typeof RawCommentResponseCodec>

// Core Author codec - matches SubstackAuthor from common.ts
export const RawAuthorCodec = t.type({
  id: t.number,
  name: t.string,
  is_admin: t.union([t.boolean, t.undefined])
})

export type RawAuthor = t.TypeOf<typeof RawAuthorCodec>

// Core User codec - simplified for initial migration
export const RawUserCodec = t.type({
  id: t.number,
  name: t.string,
  handle: t.string,
  photo_url: t.string,
  bio: t.union([t.string, t.undefined]),
  profile_set_up_at: t.string,
  reader_installed_at: t.string,
  previous_name: t.union([t.string, t.undefined]),
  bestseller_tier: t.union([t.number, t.null, t.undefined])
})

export type RawUser = t.TypeOf<typeof RawUserCodec>
