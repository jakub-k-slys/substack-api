/**
 * Full profile interface combining public profile and user profile
 */

import { SubstackPublicProfile } from './public-profile'
import { SubstackUserProfile } from './user-profile'

export interface SubstackFullProfile extends SubstackPublicProfile {
  userProfile?: SubstackUserProfile
}
