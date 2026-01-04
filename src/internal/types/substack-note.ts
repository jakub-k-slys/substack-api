import * as t from 'io-ts'

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
