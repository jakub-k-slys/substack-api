/**
 * Internal types - not exported from the public API
 * These represent raw API response shapes and internal structures
 */

// API Response types with io-ts codecs
export type { SubstackPublication } from '@substack-api/internal/types/substack-publication'

export type { SubstackPreviewPost } from '@substack-api/internal/types/substack-preview-post'
export { SubstackPreviewPostCodec } from '@substack-api/internal/types/substack-preview-post'

export type { SubstackFullPost } from '@substack-api/internal/types/substack-full-post'
export { SubstackFullPostCodec } from '@substack-api/internal/types/substack-full-post'

export type { SubstackComment } from '@substack-api/internal/types/substack-comment'
export { SubstackCommentCodec } from '@substack-api/internal/types/substack-comment'

export type { SubstackCommentResponse } from '@substack-api/internal/types/substack-comment-response'
export { SubstackCommentResponseCodec } from '@substack-api/internal/types/substack-comment-response'

export type { SubstackFullProfile } from '@substack-api/internal/types/substack-full-profile'
export { SubstackFullProfileCodec } from '@substack-api/internal/types/substack-full-profile'

export type { SubstackNote } from '@substack-api/internal/types/substack-note'
export { SubstackNoteCodec } from '@substack-api/internal/types/substack-note'

// Common types with codecs
export type { SubstackUser } from '@substack-api/internal/types/substack-user'
export { SubstackUserCodec } from '@substack-api/internal/types/substack-user'

export type { SubstackPublicationBase } from '@substack-api/internal/types/substack-publication-base'

export type { SubstackTrackingParameters } from '@substack-api/internal/types/substack-tracking-parameters'

export type { SubstackProfileItemContext } from '@substack-api/internal/types/substack-profile-item-context'
export { SubstackProfileItemContextCodec } from '@substack-api/internal/types/substack-profile-item-context'

// Common types without codecs (not direct API responses)
export type { SubstackProfilePublication } from '@substack-api/internal/types/substack-profile-publication'
export type { SubstackAuthor } from '@substack-api/internal/types/substack-author'
export type { SubstackLinkMetadata } from '@substack-api/internal/types/substack-link-metadata'
export type { SubstackAttachment } from '@substack-api/internal/types/substack-attachment'
export type { SubstackTheme } from '@substack-api/internal/types/substack-theme'
export type { SubstackUserLink } from '@substack-api/internal/types/substack-user-link'
export type { SubstackPublicationUser } from '@substack-api/internal/types/substack-publication-user'
export type { SubstackProfileSubscription } from '@substack-api/internal/types/substack-profile-subscription'

// Note API types
export type { NoteBodyJson } from '@substack-api/internal/types/note-body-json'
export type { PublishNoteRequest } from '@substack-api/internal/types/publish-note-request'

export type { PublishNoteResponse } from '@substack-api/internal/types/publish-note-response'
export { PublishNoteResponseCodec } from '@substack-api/internal/types/publish-note-response'

export type { CreateAttachmentRequest } from '@substack-api/internal/types/create-attachment-request'

export type { CreateAttachmentResponse } from '@substack-api/internal/types/create-attachment-response'
export { CreateAttachmentResponseCodec } from '@substack-api/internal/types/create-attachment-response'

// Note details types
export type { SubstackNoteContext } from '@substack-api/internal/types/substack-note-context'
export type { SubstackNoteComment } from '@substack-api/internal/types/substack-note-comment'
export type { SubstackNoteTracking } from '@substack-api/internal/types/substack-note-tracking'
export type { PaginatedSubstackNotes } from '@substack-api/internal/types/paginated-substack-notes'

// Profile API types
export type { SubstackPublicProfile } from '@substack-api/internal/types/substack-public-profile'

export type { SubstackUserProfile } from '@substack-api/internal/types/substack-user-profile'
export { SubstackUserProfileCodec } from '@substack-api/internal/types/substack-user-profile'

// Potential handles types
export type { HandleType } from '@substack-api/internal/types/handle-type'
export { HandleTypeCodec } from '@substack-api/internal/types/handle-type'

export type { PotentialHandle } from '@substack-api/internal/types/potential-handle'
export { PotentialHandleCodec } from '@substack-api/internal/types/potential-handle'

export type { PotentialHandles } from '@substack-api/internal/types/potential-handles'
export { PotentialHandlesCodec } from '@substack-api/internal/types/potential-handles'

// Subscriber lists (kept as-is with composition pattern)
export type { SubscriberListsT } from '@substack-api/internal/types/subscriber-lists'
export { SubscriberLists } from '@substack-api/internal/types/subscriber-lists'
