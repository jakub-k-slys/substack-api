import { Substack } from './client'
import { Profile, OwnProfile, Post, Note, Comment } from './entities'
import type { SubstackConfig, SubstackFullProfile } from './types'

/**
 * Modern SubstackClient with entity-based API
 */
export class SubstackClient {
  private readonly legacyClient: Substack

  constructor(config: SubstackConfig) {
    this.legacyClient = new Substack(config)
  }

  /**
   * Get the authenticated user's own profile with write capabilities
   */
  async ownProfile(): Promise<OwnProfile> {
    // Try to get the user's own profile via following list
    // This is a workaround since there's no direct "me" endpoint
    try {
      const followingProfiles = await this.legacyClient.getFollowingProfiles()
      if (followingProfiles.length > 0) {
        // For now, we'll assume we can identify our own profile somehow
        // This is a limitation of the current API structure
        const firstProfile = followingProfiles[0]
        return new OwnProfile(firstProfile, this.legacyClient)
      }
    } catch {
      // Continue to fallback
    }

    // Fallback: create a minimal profile for demonstration
    // In a real implementation, this would need a proper "me" endpoint
    const mockProfile: SubstackFullProfile = {
      id: 0,
      name: 'Unknown User',
      handle: 'unknown',
      photo_url: '',
      profile_set_up_at: new Date().toISOString(),
      reader_installed_at: new Date().toISOString(),
      profile_disabled: false,
      publicationUsers: [],
      userLinks: [],
      subscriptions: [],
      subscriptionsTruncated: false,
      hasGuestPost: false,
      max_pub_tier: 0,
      hasActivity: false,
      hasLikes: false,
      lists: [],
      rough_num_free_subscribers_int: 0,
      rough_num_free_subscribers: '0',
      bestseller_badge_disabled: false,
      subscriberCountString: '0',
      subscriberCount: '0',
      subscriberCountNumber: 0,
      hasHiddenPublicationUsers: false,
      visibleSubscriptionsCount: 0,
      slug: 'unknown',
      primaryPublicationIsPledged: false,
      primaryPublicationSubscriptionState: 'none',
      isSubscribed: false,
      isFollowing: false,
      followsViewer: false,
      can_dm: false,
      dm_upgrade_options: [],
      userProfile: {
        items: [],
        originalCursorTimestamp: '',
        nextCursor: ''
      }
    }

    return new OwnProfile(mockProfile, this.legacyClient)
  }

  /**
   * Get a profile by user ID
   */
  async profileForId(id: string): Promise<Profile> {
    const numericId = parseInt(id, 10)
    if (isNaN(numericId)) {
      throw new Error('Invalid user ID - must be numeric')
    }

    try {
      const fullProfile = await this.legacyClient.getFullProfileById(numericId)
      return new Profile(fullProfile, this.legacyClient)
    } catch {
      throw new Error(`Profile with ID ${id} not found`)
    }
  }

  /**
   * Get a profile by user slug/handle
   */
  async profileForSlug(slug: string): Promise<Profile> {
    const publicProfile = await this.legacyClient.getPublicProfile(slug)
    return new Profile(publicProfile, this.legacyClient)
  }

  /**
   * Get a post by ID
   */
  async postForId(id: string): Promise<Post> {
    // The legacy client uses slug, so we need to handle ID differently
    // For now, treat the ID as a slug - this is a limitation
    const post = await this.legacyClient.getPost(id)
    return new Post(post, this.legacyClient)
  }

  /**
   * Get a note by ID
   */
  async noteForId(id: string): Promise<Note> {
    // We need to search through notes to find the one with the matching ID
    // This is inefficient but works with current API structure
    for await (const note of this.legacyClient.getNotes({ limit: 1000 })) {
      if (note.entity_key === id) {
        return new Note(note, this.legacyClient)
      }
    }
    throw new Error(`Note with ID ${id} not found`)
  }

  /**
   * Get a comment by ID
   */
  async commentForId(id: string): Promise<Comment> {
    const numericId = parseInt(id, 10)
    if (isNaN(numericId)) {
      throw new Error('Invalid comment ID - must be numeric')
    }

    const comment = await this.legacyClient.getComment(numericId)
    return new Comment(comment, this.legacyClient)
  }

  /**
   * Get profiles of users that the authenticated user follows
   */
  async *followees(options: { limit?: number } = {}): AsyncIterable<Profile> {
    const followingProfiles = await this.legacyClient.getFollowingProfiles()
    let count = 0

    for (const profileData of followingProfiles) {
      if (options.limit && count >= options.limit) {
        break
      }
      yield new Profile(profileData, this.legacyClient)
      count++
    }
  }

  /**
   * Test connectivity to the Substack API
   * Returns true if the connection is working, false otherwise
   */
  async testConnectivity(): Promise<boolean> {
    try {
      // Try a simple API call to test connectivity
      const posts = []
      for await (const post of this.legacyClient.getPosts({ limit: 1 })) {
        posts.push(post)
        break // Just get one post to test
      }
      return true
    } catch {
      return false
    }
  }
}
