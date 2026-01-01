import * as t from 'io-ts'

/**
 * Codec for PublishNoteResponse - validates the response from POST /comment/feed
 * Uses partial validation for optional fields and unknown for complex nested structures
 */
export const PublishNoteResponseCodec = t.intersection([
  t.type({
    user_id: t.number,
    body: t.string,
    body_json: t.unknown, // Complex structure, validated separately if needed
    ancestor_path: t.string,
    type: t.literal('feed'),
    status: t.literal('published'),
    reply_minimum_role: t.literal('everyone'),
    id: t.number,
    deleted: t.boolean,
    date: t.string,
    name: t.string,
    photo_url: t.string,
    reactions: t.record(t.string, t.number),
    children: t.array(t.unknown),
    isFirstFeedCommentByUser: t.boolean,
    reaction_count: t.number,
    restacks: t.number,
    restacked: t.boolean,
    children_count: t.number,
    attachments: t.array(t.unknown) // SubstackAttachment[] - will add codec later
  }),
  t.partial({
    post_id: t.union([t.number, t.null]),
    publication_id: t.union([t.number, t.null]),
    media_clip_id: t.union([t.string, t.null]),
    user_bestseller_tier: t.union([t.number, t.null]),
    user_primary_publication: t.unknown // SubstackPublication - already has codec but optional here
  })
])

export type PublishNoteResponse = t.TypeOf<typeof PublishNoteResponseCodec>
