import * as t from 'io-ts'
import { SubstackProfileItemContextCodec } from '@substack-api/internal/types/substack-profile-item-context'

/**
 * Minimal codec for user profile feed - only validates the context.users array
 * Used fields: items[].context.users[].id, items[].context.users[].handle
 */
const MinimalItemCodec = t.type({
  context: SubstackProfileItemContextCodec
})

export const SubstackUserProfileCodec = t.type({
  items: t.array(MinimalItemCodec)
})

export type SubstackUserProfile = t.TypeOf<typeof SubstackUserProfileCodec>
