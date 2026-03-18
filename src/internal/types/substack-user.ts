import * as t from 'io-ts'

/**
 * Minimal user information codec - only validates fields actually used in the codebase
 * Used fields: id, name, handle, photo_url, bio (optional)
 */
export const SubstackUserCodec = t.intersection([
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

export type SubstackUser = t.TypeOf<typeof SubstackUserCodec>
