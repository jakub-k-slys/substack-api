import * as t from 'io-ts'
import { SubstackPublicationCodec } from '@substack-api/internal/types/substack-publication'
import { SubstackPreviewPostCodec } from '@substack-api/internal/types/substack-preview-post'
import { SubstackCommentCodec } from '@substack-api/internal/types/substack-comment'
import { SubstackTrackingParametersCodec } from '@substack-api/internal/types/substack-tracking-parameters'
import { SubstackProfileItemContextCodec } from '@substack-api/internal/types/substack-profile-item-context'

/**
 * Codec for SubstackUserProfile - validates the response from GET /reader/feed/profile/${id}
 */
export const SubstackUserProfileCodec = t.type({
  items: t.array(
    t.intersection([
      t.type({
        entity_key: t.string,
        type: t.string,
        context: SubstackProfileItemContextCodec,
        parentComments: t.array(SubstackCommentCodec),
        canReply: t.boolean,
        isMuted: t.boolean,
        trackingParameters: SubstackTrackingParametersCodec
      }),
      t.partial({
        publication: t.union([SubstackPublicationCodec, t.null]),
        post: t.union([SubstackPreviewPostCodec, t.null]),
        comment: t.union([SubstackCommentCodec, t.null])
      })
    ])
  ),
  originalCursorTimestamp: t.string,
  nextCursor: t.string
})

export type SubstackUserProfile = t.TypeOf<typeof SubstackUserProfileCodec>
