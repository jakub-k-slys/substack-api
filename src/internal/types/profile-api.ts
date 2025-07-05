/**
 * Internal profile API response types
 */

import type { SubstackPublication, SubstackPost, SubstackComment } from './api-responses'
import type {
  SubstackUser,
  SubstackPublicationBase,
  SubstackUserLink,
  SubstackPublicationUser,
  SubstackProfileSubscription,
  SubstackTrackingParameters,
  SubstackProfileItemContext
} from './common'

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

export interface SubstackFullProfile extends SubstackPublicProfile {
  userProfile?: SubstackUserProfile
}

export interface SubstackUserProfile {
  items: Array<{
    entity_key: string
    type: string
    context: SubstackProfileItemContext
    publication?: SubstackPublication | null
    post?: SubstackPost | null
    comment?: SubstackComment | null
    parentComments: SubstackComment[]
    canReply: boolean
    isMuted: boolean
    trackingParameters: SubstackTrackingParameters
  }>
  originalCursorTimestamp: string
  nextCursor: string
}
