import * as t from 'io-ts'

/**
 * Minimal codec for profile item context - only validates the users array
 * Used fields: users[].id, users[].handle
 */
const MinimalUserCodec = t.type({
  id: t.number,
  handle: t.string
})

export const SubstackProfileItemContextCodec = t.type({
  users: t.array(MinimalUserCodec)
})

export type SubstackProfileItemContext = t.TypeOf<typeof SubstackProfileItemContextCodec>
