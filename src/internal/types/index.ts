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
  SubstackPublicationUser as SubstackAPIPublicationUser,
  SubstackSubscriptionPublication,
  SubstackSubscriptionsResponse
} from './api-responses'

export type { NoteBodyJson, PublishNoteRequest, PublishNoteResponse } from './note-api'

export type {
  SubstackNote,
  SubstackNoteContext,
  SubstackNoteComment,
  SubstackNoteTracking,
  PaginatedSubstackNotes
} from './note-details'

export type { SubstackPublicProfile, SubstackFullProfile, SubstackUserProfile } from './profile-api'

export type {
  SubstackUser,
  SubstackPublicationBase,
  SubstackProfilePublication,
  SubstackAuthor,
  SubstackLinkMetadata,
  SubstackAttachment,
  SubstackTheme,
  SubstackUserLink,
  SubstackPublicationUser,
  SubstackProfileSubscription,
  SubstackTrackingParameters,
  SubstackProfileItemContext
} from './common'
