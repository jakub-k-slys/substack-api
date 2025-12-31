/**
 * Internal types - not exported from the public API
 * These represent raw API response shapes and internal structures
 */

export type {
  SubstackPublication,
  SubstackPreviewPost,
  SubstackFullPost,
  SubstackComment,
  SubstackCommentResponse,
  SubstackFullProfile,
  SubstackNote
} from '@substack-api/internal/types/api-responses'

// Export io-ts codecs for runtime validation
export {
  SubstackPublicationCodec,
  SubstackPreviewPostCodec,
  SubstackFullPostCodec,
  SubstackCommentCodec,
  SubstackCommentResponseCodec,
  SubstackFullProfileCodec,
  SubstackNoteCodec
} from '@substack-api/internal/types/api-responses'

export type {
  NoteBodyJson,
  PublishNoteRequest,
  PublishNoteResponse,
  CreateAttachmentRequest,
  CreateAttachmentResponse
} from '@substack-api/internal/types/note-api'

export type {
  SubstackNoteContext,
  SubstackNoteComment,
  SubstackNoteTracking,
  PaginatedSubstackNotes
} from '@substack-api/internal/types/note-details'

export type {
  SubstackPublicProfile,
  SubstackUserProfile
} from '@substack-api/internal/types/profile-api'

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
} from '@substack-api/internal/types/common'
