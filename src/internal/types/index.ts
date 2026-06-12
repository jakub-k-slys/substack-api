/**
 * Internal types - not exported from the public API
 * These represent raw API response shapes and internal structures
 */

// API Response types with io-ts codecs
export type { SubstackPublication } from '@substackular/internal/types/substack-publication'

export type { SubstackPreviewPost } from '@substackular/internal/types/substack-preview-post'
export { SubstackPreviewPostCodec } from '@substackular/internal/types/substack-preview-post'

export type { SubstackFullPost } from '@substackular/internal/types/substack-full-post'
export { SubstackFullPostCodec } from '@substackular/internal/types/substack-full-post'

export type { SubstackComment } from '@substackular/internal/types/substack-comment'
export { SubstackCommentCodec } from '@substackular/internal/types/substack-comment'

export type { SubstackCommentResponse } from '@substackular/internal/types/substack-comment-response'
export { SubstackCommentResponseCodec } from '@substackular/internal/types/substack-comment-response'

export type { SubstackFullProfile } from '@substackular/internal/types/substack-full-profile'
export { SubstackFullProfileCodec } from '@substackular/internal/types/substack-full-profile'

export type { SubstackNote } from '@substackular/internal/types/substack-note'
export { SubstackNoteCodec } from '@substackular/internal/types/substack-note'

// Common types with codecs
export type { SubstackUser } from '@substackular/internal/types/substack-user'
export { SubstackUserCodec } from '@substackular/internal/types/substack-user'

export type { SubstackPublicationBase } from '@substackular/internal/types/substack-publication-base'

export type { SubstackTrackingParameters } from '@substackular/internal/types/substack-tracking-parameters'

export type { SubstackProfileItemContext } from '@substackular/internal/types/substack-profile-item-context'
export { SubstackProfileItemContextCodec } from '@substackular/internal/types/substack-profile-item-context'

// Common types without codecs (not direct API responses)
export type { SubstackProfilePublication } from '@substackular/internal/types/substack-profile-publication'
export type { SubstackAuthor } from '@substackular/internal/types/substack-author'
export type { SubstackLinkMetadata } from '@substackular/internal/types/substack-link-metadata'
export type { SubstackAttachment } from '@substackular/internal/types/substack-attachment'
export type { SubstackTheme } from '@substackular/internal/types/substack-theme'
export type { SubstackUserLink } from '@substackular/internal/types/substack-user-link'
export type { SubstackPublicationUser } from '@substackular/internal/types/substack-publication-user'
export type { SubstackProfileSubscription } from '@substackular/internal/types/substack-profile-subscription'

// Note API types
export type { NoteBodyJson } from '@substackular/internal/types/note-body-json'
export type { PublishNoteRequest } from '@substackular/internal/types/publish-note-request'

export type { PublishNoteResponse } from '@substackular/internal/types/publish-note-response'
export { PublishNoteResponseCodec } from '@substackular/internal/types/publish-note-response'

export type { CreateAttachmentRequest } from '@substackular/internal/types/create-attachment-request'

export type { CreateAttachmentResponse } from '@substackular/internal/types/create-attachment-response'
export { CreateAttachmentResponseCodec } from '@substackular/internal/types/create-attachment-response'

// Note details types
export type { SubstackNoteContext } from '@substackular/internal/types/substack-note-context'
export type { SubstackNoteComment } from '@substackular/internal/types/substack-note-comment'
export type { SubstackNoteTracking } from '@substackular/internal/types/substack-note-tracking'
export type { PaginatedSubstackNotes } from '@substackular/internal/types/paginated-substack-notes'

// Profile API types
export type { SubstackPublicProfile } from '@substackular/internal/types/substack-public-profile'

export type { SubstackUserProfile } from '@substackular/internal/types/substack-user-profile'
export { SubstackUserProfileCodec } from '@substackular/internal/types/substack-user-profile'

// Potential handles types
export type { HandleType } from '@substackular/internal/types/handle-type'
export { HandleTypeCodec } from '@substackular/internal/types/handle-type'

export type { PotentialHandle } from '@substackular/internal/types/potential-handle'
export { PotentialHandleCodec } from '@substackular/internal/types/potential-handle'

export type { PotentialHandles } from '@substackular/internal/types/potential-handles'
export { PotentialHandlesCodec } from '@substackular/internal/types/potential-handles'

// Subscriber lists (kept as-is with composition pattern)
export type { SubscriberListsT } from '@substackular/internal/types/subscriber-lists'
export { SubscriberLists } from '@substackular/internal/types/subscriber-lists'
