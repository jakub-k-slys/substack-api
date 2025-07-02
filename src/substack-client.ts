import { SubstackHttpClient } from './http-client'
import { Profile, OwnProfile, Post, Note, Comment } from './entities'
import type {
  SubstackConfig,
  SubstackFullProfile,
  SubstackPost,
  SubstackNote,
  SubstackComment,
  SubstackSubscriptionsResponse,
  SubstackSubscriptionPublication
} from './types'

/**
 * Modern SubstackClient with entity-based API
 */
export class SubstackClient {
  private readonly httpClient: SubstackHttpClient
  private subscriptionsCache: Map<number, string> | null = null // user_id -> slug mapping
  private subscriptionsCacheTimestamp: number | null = null

  constructor(config: SubstackConfig) {
    this.httpClient = new SubstackHttpClient(config)
  }

  /**
   * Test API connectivity
   */
  async testConnectivity(): Promise<boolean> {
    try {
      await this.httpClient.get('/api/v1/feed/following')
      return true
    } catch {
      return false
    }
  }

  /**
   * Get or build the user_id to slug mapping from subscriptions
   * @private
   */
  private async getSlugMapping(): Promise<Map<number, string>> {
    // Return cached mapping if available and fresh (within session)
    if (this.subscriptionsCache && this.subscriptionsCacheTimestamp) {
      return this.subscriptionsCache
    }

    try {
      // Fetch subscriptions data
      const subscriptionsResponse =
        await this.httpClient.get<SubstackSubscriptionsResponse>('/api/v1/subscriptions')

      // Build user_id -> slug mapping
      const mapping = new Map<number, string>()

      for (const publication of subscriptionsResponse.publications as SubstackSubscriptionPublication[]) {
        if (publication.author_id) {
          // Use subdomain as the slug, or custom_domain if the publication is not on substack
          const slug = publication.author_handle || undefined
          
          if (slug) {
            mapping.set(publication.author_id, slug)
            console.log(`Mapped user_id ${publication.author_id} to slug: ${slug}`)
          }
        }
      }

      // Cache the mapping
      this.subscriptionsCache = mapping
      this.subscriptionsCacheTimestamp = Date.now()

      return mapping
    } catch {
      // If subscriptions endpoint fails, return empty mapping
      // This ensures graceful fallback
      const emptyMapping = new Map<number, string>()
      this.subscriptionsCache = emptyMapping
      this.subscriptionsCacheTimestamp = Date.now()
      return emptyMapping
    }
  }

  /**
   * Get slug for a user ID, with fallback to handle from profile data
   * @private
   */
  private async getSlugForUserId(
    userId: number,
    fallbackHandle?: string
  ): Promise<string | undefined> {
    const slugMapping = await this.getSlugMapping()
    return slugMapping.get(userId) || fallbackHandle
  }

  /**
   * Get the authenticated user's own profile with write capabilities
   * @throws {Error} When authentication fails or user profile cannot be retrieved
   */
  async ownProfile(): Promise<OwnProfile> {
    try {
      // Step 1: Get user_id from subscription endpoint
      const subscription = await this.httpClient.get<{ user_id: number }>('/api/v1/subscription')
      const userId = subscription.user_id

      // Step 2: Get full profile using the user_id
      const profile = await this.httpClient.get<SubstackFullProfile>(
        `/api/v1/user/${userId}/profile`
      )

      // Step 3: Resolve slug from subscriptions cache
      const resolvedSlug = await this.getSlugForUserId(userId, profile.handle)

      return new OwnProfile(
        profile,
        this.httpClient,
        resolvedSlug,
        this.getSlugForUserId.bind(this)
      )
    } catch (error) {
      throw new Error(`Failed to get own profile: ${(error as Error).message}`)
    }
  }

  /**
   * Get a profile by user ID
   */
  async profileForId(id: number): Promise<Profile> {
    try {
      const profile = await this.httpClient.get<SubstackFullProfile>(`/api/v1/users/${id}`)

      // Resolve slug from subscriptions cache
      const resolvedSlug = await this.getSlugForUserId(id, profile.handle)

      return new Profile(profile, this.httpClient, resolvedSlug, this.getSlugForUserId.bind(this))
    } catch (error) {
      throw new Error(`Profile with ID ${id} not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get a profile by handle/slug
   */
  async profileForSlug(slug: string): Promise<Profile> {
    if (!slug || slug.trim() === '') {
      throw new Error('Profile slug cannot be empty')
    }

    try {
      const profile = await this.httpClient.get<SubstackFullProfile>(`/api/v1/users/${slug}`)

      // For profiles fetched by slug, we can use the provided slug as the resolved slug
      // but still check subscriptions cache for consistency
      const resolvedSlug = await this.getSlugForUserId(profile.id, slug)

      return new Profile(profile, this.httpClient, resolvedSlug, this.getSlugForUserId.bind(this))
    } catch (error) {
      throw new Error(`Profile with slug '${slug}' not found: ${(error as Error).message}`)
    }
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
}
