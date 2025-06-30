import { SubstackHttpClient } from './http-client'
import { Profile, OwnProfile, Post, Note, Comment } from './entities'
import type {
  SubstackConfig,
  SubstackFullProfile,
  SubstackPost,
  SubstackNote,
  SubstackComment
} from './types'

/**
 * Modern SubstackClient with entity-based API
 */
export class SubstackClient {
  private readonly httpClient: SubstackHttpClient

  constructor(config: SubstackConfig) {
    this.httpClient = new SubstackHttpClient(config)
  }

  /**
   * Test API connectivity
   */
  async testConnectivity(): Promise<boolean> {
    try {
      await this.httpClient.get('/api/v1/reader/user_following')
      return true
    } catch {
      return false
    }
  }

  /**
   * Get the authenticated user's own profile with write capabilities
   */
  async ownProfile(): Promise<OwnProfile> {
    // Create a minimal profile for now since we don't have a "me" endpoint
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
      primaryPublicationSubscriptionState: 'not_subscribed',
      isSubscribed: false,
      isFollowing: false,
      followsViewer: false,
      can_dm: false,
      dm_upgrade_options: []
    }
    return new OwnProfile(mockProfile, this.httpClient)
  }

  /**
   * Get a profile by user ID
   */
  async profileForId(id: string): Promise<Profile> {
    if (!/^\d+$/.test(id)) {
      throw new Error('Invalid user ID - must be numeric')
    }

    try {
      const profile = await this.httpClient.get<SubstackFullProfile>(`/api/v1/users/${id}`)
      return new Profile(profile, this.httpClient)
    } catch {
      throw new Error(`Profile with ID ${id} not found`)
    }
  }

  /**
   * Get a profile by handle/slug
   */
  async profileForSlug(slug: string): Promise<Profile> {
    const profile = await this.httpClient.get<SubstackFullProfile>(`/api/v1/users/${slug}`)
    return new Profile(profile, this.httpClient)
  }

  /**
   * Get a specific post by ID
   */
  async postForId(id: string): Promise<Post> {
    const post = await this.httpClient.get<SubstackPost>(`/api/v1/posts/${id}`)
    return new Post(post, this.httpClient)
  }

  /**
   * Get a specific note by ID
   */
  async noteForId(id: string): Promise<Note> {
    try {
      const note = await this.httpClient.get<SubstackNote>(`/api/v1/notes/${id}`)
      return new Note(note, this.httpClient)
    } catch {
      throw new Error(`Note with ID ${id} not found`)
    }
  }

  /**
   * Get a specific comment by ID
   */
  async commentForId(id: string): Promise<Comment> {
    if (!/^\d+$/.test(id)) {
      throw new Error('Invalid comment ID - must be numeric')
    }

    const comment = await this.httpClient.get<SubstackComment>(`/api/v1/comments/${id}`)
    return new Comment(comment, this.httpClient)
  }

  /**
   * Get users that the authenticated user follows
   */
  async *followees(): AsyncIterable<Profile> {
    const response = await this.httpClient.get<{ users: SubstackFullProfile[] }>(
      '/api/v1/reader/user_following'
    )
    for (const user of response.users) {
      yield new Profile(user, this.httpClient)
    }
  }
}
