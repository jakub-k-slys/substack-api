/**
 * Internal profile API response types
 */

import type {
  SubstackPublication,
  SubstackPreviewPost,
  SubstackComment
} from '@substack-api/internal/types/api-responses'
import type {
  SubstackUser,
  SubstackPublicationBase,
  SubstackUserLink,
  SubstackPublicationUser,
  SubstackProfileSubscription,
  SubstackTrackingParameters,
  SubstackProfileItemContext
} from '@substack-api/internal/types/common'

export interface SubstackPublicProfile extends SubstackUser {
  tos_accepted_at?: string | null
  profile_disabled: boolean
  publicationUsers: SubstackPublicationUser[]
  userLinks: SubstackUserLink[]
  subscriptions: SubstackProfileSubscription[]
  subscriptionsTruncated: boolean
  hasGuestPost: boolean
  primaryPublication?: SubstackPublicationBase
  max_pub_tier: number
  handle: string
  hasActivity: boolean
  hasLikes: boolean
  lists: unknown[]
  rough_num_free_subscribers_int: number
  rough_num_free_subscribers: string
  bestseller_badge_disabled: boolean
  subscriberCountString: string
  subscriberCount: string
  subscriberCountNumber: number
  hasHiddenPublicationUsers: boolean
  visibleSubscriptionsCount: number
  slug: string
  previousSlug?: string
  primaryPublicationIsPledged: boolean
  primaryPublicationSubscriptionState: string
  isSubscribed: boolean
  isFollowing: boolean
  followsViewer: boolean
  can_dm: boolean
  dm_upgrade_options: string[]
}

export interface SubstackUserProfile {
  items: Array<{
    entity_key: string
    type: string
    context: SubstackProfileItemContext
    publication?: SubstackPublication | null
    post?: SubstackPreviewPost | null
    comment?: SubstackComment | null
    parentComments: SubstackComment[]
    canReply: boolean
    isMuted: boolean
    trackingParameters: SubstackTrackingParameters
  }>
  originalCursorTimestamp: string
  nextCursor: string
}
