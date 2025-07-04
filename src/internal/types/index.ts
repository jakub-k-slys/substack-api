/**
 * Internal types - not exported from the public API
 * These represent raw API response shapes and internal structures
 */

export type {
  SubstackPublication,
  SubstackPost,
  SubstackComment,
  SubstackCommentResponse,
  SubstackSearchResult,
  SubstackSubscription,
  SubstackPublicationUser,
  SubstackSubscriptionPublication,
  SubstackSubscriptionsResponse
} from './api-responses'

export type { NoteBodyJson, PublishNoteRequest, PublishNoteResponse } from './note-api'

export type {
  SubstackNote,
  SubstackNoteContext,
  SubstackNoteComment,
  SubstackNoteTracking
} from './note-details'

export type { SubstackPublicProfile, SubstackFullProfile, SubstackUserProfile } from './profile-api'
