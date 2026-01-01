import * as t from 'io-ts'
import { SubstackUserCodec } from '@substack-api/internal/types/substack-user'
import { SubstackPublicationBaseCodec } from '@substack-api/internal/types/substack-publication-base'

/**
 * Context information for user profile items
 */
export const SubstackProfileItemContextCodec = t.intersection([
  t.type({
    type: t.string,
    timestamp: t.string,
    users: t.array(
      t.intersection([
        SubstackUserCodec,
        t.partial({
          primary_publication: SubstackPublicationBaseCodec
        })
      ])
    ),
    isFresh: t.boolean,
    source: t.string,
    page_rank: t.number
  }),
  t.partial({
    fallbackReason: t.string,
    fallbackUrl: t.union([t.string, t.null]),
    searchTrackingParameters: t.record(t.string, t.unknown),
    page: t.union([t.number, t.null])
  })
])

export type SubstackProfileItemContext = t.TypeOf<typeof SubstackProfileItemContextCodec>
