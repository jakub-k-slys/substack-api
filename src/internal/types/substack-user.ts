import * as t from 'io-ts'

/**
 * Base user information that appears across different API responses
 */
export const SubstackUserCodec = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    handle: t.string,
    photo_url: t.string,
    profile_set_up_at: t.string,
    reader_installed_at: t.string
  }),
  t.partial({
    previous_name: t.string,
    bio: t.string,
    bestseller_tier: t.union([t.number, t.null])
  })
])

export type SubstackUser = t.TypeOf<typeof SubstackUserCodec>
