/**
 * Composed raw profile types (internal implementation details)
 */

import type { RawSubstackPublicProfile } from './raw-public-profile'
import type { RawSubstackUserProfile } from './raw-user-profile'

export interface RawSubstackFullProfile extends RawSubstackPublicProfile {
  userProfile?: RawSubstackUserProfile
}
