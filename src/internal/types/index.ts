/**
 * Internal types - not exported from the public API
 * These represent raw API response shapes and internal structures
 */

export type {
  SubstackPublication,
  SubstackPost,
  SubstackFullPost,
  SubstackComment,
  SubstackCommentResponse,
  SubstackSubscriptionPublication,
  SubstackSubscriptionsResponse,
  SubstackFullProfile,
  SubstackNote
} from './api-responses'

// Export io-ts codecs for runtime validation
export {
  SubstackPublicationCodec,
  SubstackPostCodec,
  SubstackFullPostCodec,
  SubstackCommentCodec,
  SubstackCommentResponseCodec,
  SubstackFullProfileCodec,
  SubstackNoteCodec
} from './api-responses'

export type {
  NoteBodyJson,
  PublishNoteRequest,
  PublishNoteResponse,
  CreateAttachmentRequest,
  CreateAttachmentResponse
} from './note-api'

export type {
  SubstackNoteContext,
  SubstackNoteComment,
  SubstackNoteTracking,
  PaginatedSubstackNotes
} from './note-details'

export type { SubstackPublicProfile, SubstackUserProfile } from './profile-api'

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
