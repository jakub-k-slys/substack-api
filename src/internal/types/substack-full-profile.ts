import * as t from 'io-ts'

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
