import * as t from 'io-ts'

/**
 * Tracking parameters in flattened form
 */
export const SubstackTrackingParametersCodec = t.intersection([
  t.type({
    item_primary_entity_key: t.string,
    item_entity_key: t.string,
    item_type: t.string,
    item_content_user_id: t.number,
    item_context_type: t.string,
    item_context_type_bucket: t.string,
    item_context_timestamp: t.string,
    item_context_user_id: t.number,
    item_context_user_ids: t.array(t.number),
    item_can_reply: t.boolean,
    item_is_fresh: t.boolean,
    item_last_impression_at: t.union([t.string, t.null]),
    item_page: t.union([t.number, t.null]),
    item_page_rank: t.number,
    impression_id: t.string,
    followed_user_count: t.number,
    subscribed_publication_count: t.number,
    is_following: t.boolean,
    is_explicitly_subscribed: t.boolean
  }),
  t.partial({
    item_comment_id: t.number,
    item_post_id: t.number,
    item_publication_id: t.number,
    item_source: t.string
  })
])

export type SubstackTrackingParameters = t.TypeOf<typeof SubstackTrackingParametersCodec>
