import { SubstackHttpClient } from './http-client'
import { Profile, OwnProfile, Post, Note, Comment } from './domain'
import type { SubstackConfig } from './types'
import type {
  SubstackFullProfile,
  SubstackPost,
  SubstackNote,
  SubstackComment,
  SubstackCommentResponse,
  SubstackSubscriptionsResponse,
  SubstackSubscriptionPublication
} from './internal'

/**
 * Modern SubstackClient with entity-based API
 */
export class SubstackClient {
  private readonly httpClient: SubstackHttpClient
  private readonly globalHttpClient: SubstackHttpClient
  private subscriptionsCache: Map<number, string> | null = null // user_id -> slug mapping
  private subscriptionsCacheTimestamp: number | null = null

  constructor(config: SubstackConfig) {
    // Create HTTP client for publication-specific endpoints
    const protocol = config.protocol || 'https'
    const publicationBaseUrl = `${protocol}://${config.hostname || 'substack.com'}`
    this.httpClient = new SubstackHttpClient(publicationBaseUrl, config)

    // Create HTTP client for global Substack endpoints
    const substackBaseUrl = config.substackBaseUrl || 'https://substack.com'
    this.globalHttpClient = new SubstackHttpClient(substackBaseUrl, config)
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
      const profile = await this.httpClient.get<SubstackFullProfile>(`/api/v1/user/${id}/profile`)

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
      const profile = await this.httpClient.get<SubstackFullProfile>(
        `/api/v1/user/${slug}/public_profile`
      )

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
    try {
      // Post lookup by ID must use the global substack.com endpoint, not publication-specific hostnames
      const post = await this.globalHttpClient.get<SubstackPost>(`/api/v1/posts/by-id/${id}`)
      return new Post(post, this.httpClient)
    } catch (error) {
      throw new Error(`Post with ID ${id} not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get a specific note by ID
   */
  async noteForId(id: string): Promise<Note> {
    try {
      // Notes are fetched using the same endpoint as comments
      const response = await this.httpClient.get<SubstackCommentResponse>(
        `/api/v1/reader/comment/${id}`
      )

      // Transform the comment response to the SubstackNote structure expected by Note entity
      const noteData: SubstackNote = {
        entity_key: id,
        type: 'note',
        context: {
          type: 'feed',
          timestamp: response.item.comment.date,
          users: [
            {
              id: response.item.comment.user_id,
              name: response.item.comment.name,
              handle: '', // Not available in comment response
              photo_url: '', // Not available in comment response
              bio: '',
              profile_set_up_at: response.item.comment.date,
              reader_installed_at: response.item.comment.date
            }
          ],
          isFresh: false,
          page_rank: 1
        },
        comment: {
          name: response.item.comment.name,
          handle: '',
          photo_url: '',
          id: response.item.comment.id,
          body: response.item.comment.body,
          user_id: response.item.comment.user_id,
          type: 'feed',
          date: response.item.comment.date,
          ancestor_path: '',
          reply_minimum_role: 'everyone',
          reaction_count: 0, // Not available in comment response
          reactions: {},
          restacks: 0,
          restacked: false,
          children_count: 0,
          attachments: []
        },
        parentComments: [],
        canReply: true,
        isMuted: false,
        trackingParameters: {
          item_primary_entity_key: id,
          item_entity_key: id,
          item_type: 'note',
          item_content_user_id: response.item.comment.user_id,
          item_context_type: 'feed',
          item_context_type_bucket: 'note',
          item_context_timestamp: response.item.comment.date,
          item_context_user_id: response.item.comment.user_id,
          item_context_user_ids: [response.item.comment.user_id],
          item_can_reply: true,
          item_is_fresh: false,
          item_last_impression_at: null,
          item_page: null,
          item_page_rank: 1,
          impression_id: 'generated',
          followed_user_count: 0,
          subscribed_publication_count: 0,
          is_following: false,
          is_explicitly_subscribed: false
        }
      }

      return new Note(noteData, this.httpClient)
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

    const response = await this.httpClient.get<SubstackCommentResponse>(
      `/api/v1/reader/comment/${id}`
    )

    // Transform the API response to match SubstackComment interface
    const commentData: SubstackComment = {
      id: response.item.comment.id,
      body: response.item.comment.body,
      created_at: response.item.comment.date,
      parent_post_id: response.item.comment.post_id || 0,
      author_id: response.item.comment.user_id,
      author_name: response.item.comment.name,
      author_is_admin: false // Default value as this info is not available in the API response
    }

    return new Comment(commentData, this.httpClient)
  }
}
