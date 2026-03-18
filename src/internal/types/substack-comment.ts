import * as t from 'io-ts'

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
