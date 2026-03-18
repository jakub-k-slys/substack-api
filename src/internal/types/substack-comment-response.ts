import * as t from 'io-ts'

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
