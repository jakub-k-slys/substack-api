/**
 * Profile data converters (internal utilities)
 */

import type { RawSubstackFullProfile } from '../internal/types'
import type { SubstackFullProfile } from '../types'

/**
 * Convert raw profile data to the expected SubstackFullProfile format
 */
export function convertRawToSubstackFullProfile(
  rawProfile: RawSubstackFullProfile
): SubstackFullProfile {
  return {
    id: rawProfile.id,
    name: rawProfile.name,
    handle: rawProfile.handle,
    previous_name: rawProfile.previous_name,
    photo_url: rawProfile.photo_url,
    bio: rawProfile.bio,
    profile_set_up_at: rawProfile.profile_set_up_at,
    reader_installed_at: rawProfile.reader_installed_at,
    tos_accepted_at: rawProfile.tos_accepted_at,
    profile_disabled: rawProfile.profile_disabled,
    publicationUsers: rawProfile.publicationUsers,
    userLinks: rawProfile.userLinks,
    subscriptions: rawProfile.subscriptions,
    subscriptionsTruncated: rawProfile.subscriptionsTruncated,
    hasGuestPost: rawProfile.hasGuestPost,
    primaryPublication: rawProfile.primaryPublication,
    max_pub_tier: rawProfile.max_pub_tier,
    hasActivity: rawProfile.hasActivity,
    hasLikes: rawProfile.hasLikes,
    lists: rawProfile.lists,
    rough_num_free_subscribers_int: rawProfile.rough_num_free_subscribers_int,
    rough_num_free_subscribers: rawProfile.rough_num_free_subscribers,
    bestseller_badge_disabled: rawProfile.bestseller_badge_disabled,
    bestseller_tier: rawProfile.bestseller_tier,
    subscriberCountString: rawProfile.subscriberCountString,
    subscriberCount: rawProfile.subscriberCount,
    subscriberCountNumber: rawProfile.subscriberCountNumber,
    hasHiddenPublicationUsers: rawProfile.hasHiddenPublicationUsers,
    visibleSubscriptionsCount: rawProfile.visibleSubscriptionsCount,
    slug: rawProfile.slug,
    previousSlug: rawProfile.previousSlug,
    primaryPublicationIsPledged: rawProfile.primaryPublicationIsPledged,
    primaryPublicationSubscriptionState: rawProfile.primaryPublicationSubscriptionState,
    isSubscribed: rawProfile.isSubscribed,
    isFollowing: rawProfile.isFollowing,
    followsViewer: rawProfile.followsViewer,
    can_dm: rawProfile.can_dm,
    dm_upgrade_options: rawProfile.dm_upgrade_options,
    userProfile: rawProfile.userProfile
  }
}
