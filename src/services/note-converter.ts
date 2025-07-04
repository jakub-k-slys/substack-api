/**
 * Note data converters (internal utilities)
 */

import type { RawSubstackNote } from '../internal/types'
import type { SubstackNote } from '../types'

/**
 * Convert raw note data to the expected SubstackNote format
 */
export function convertRawToSubstackNote(rawNote: RawSubstackNote): SubstackNote {
  return {
    entity_key: rawNote.entity_key,
    type: rawNote.type,
    context: {
      type: rawNote.context.type,
      timestamp: rawNote.context.timestamp,
      users: rawNote.context.users,
      fallbackReason: rawNote.context.fallbackReason,
      fallbackUrl: rawNote.context.fallbackUrl,
      isFresh: rawNote.context.isFresh,
      searchTrackingParameters: rawNote.context.searchTrackingParameters,
      page: rawNote.context.page,
      page_rank: rawNote.context.page_rank
    },
    publication: rawNote.publication || null,
    post: rawNote.post || null,
    comment: rawNote.comment
      ? {
          name: rawNote.comment.name || '',
          handle: rawNote.comment.handle || '',
          photo_url: rawNote.comment.photo_url || '',
          id: rawNote.comment.id,
          body: rawNote.comment.body,
          body_json: undefined,
          publication_id: null,
          post_id: null,
          user_id: rawNote.comment.user_id || 0,
          type: rawNote.comment.type || 'note',
          date: rawNote.comment.date || '',
          edited_at: null,
          ancestor_path: '',
          reply_minimum_role: 'everyone',
          media_clip_id: null,
          reaction_count: rawNote.comment.reaction_count || 0,
          reactions: rawNote.comment.reactions || {},
          restacks: 0,
          restacked: false,
          children_count: 0,
          attachments: [],
          user_bestseller_tier: null,
          user_primary_publication: undefined
        }
      : undefined,
    parentComments: (rawNote.parentComments || []).map((pc) => ({
      name: pc.name,
      handle: '',
      photo_url: '',
      id: pc.id,
      body: pc.body,
      body_json: undefined,
      publication_id: null,
      post_id: pc.post_id || null,
      user_id: pc.user_id,
      type: 'comment',
      date: pc.date,
      edited_at: null,
      ancestor_path: '',
      reply_minimum_role: 'everyone',
      media_clip_id: null,
      reaction_count: 0,
      reactions: {},
      restacks: 0,
      restacked: false,
      children_count: 0,
      attachments: [],
      user_bestseller_tier: null,
      user_primary_publication: undefined
    })),
    canReply: rawNote.canReply,
    isMuted: rawNote.isMuted,
    trackingParameters: rawNote.trackingParameters
  }
}
