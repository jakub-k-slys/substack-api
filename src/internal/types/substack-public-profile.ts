import type { SubstackUser } from '@substack-api/internal/types/substack-user'
import type { SubstackPublicationBase } from '@substack-api/internal/types/substack-publication-base'
import type { SubstackUserLink } from '@substack-api/internal/types/substack-user-link'
import type { SubstackPublicationUser } from '@substack-api/internal/types/substack-publication-user'
import type { SubstackProfileSubscription } from '@substack-api/internal/types/substack-profile-subscription'

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
