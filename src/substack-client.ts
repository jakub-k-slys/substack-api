import { SubstackHttpClient } from './http-client'
import { Profile, OwnProfile, Post, Note, Comment } from './domain'
import { PostService, NoteService, ProfileService } from './services'
import type { SubstackConfig } from './types'
import type {
  SubstackFullProfile,
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
  private readonly postService: PostService
  private readonly noteService: NoteService
  private readonly profileService: ProfileService
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

    // Initialize services
    this.postService = new PostService(this.httpClient, this.globalHttpClient)
    this.noteService = new NoteService(this.httpClient, this.globalHttpClient)
    this.profileService = new ProfileService(this.httpClient, this.globalHttpClient)
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
      const profile = await this.profileService.getOwnProfile()

      // Get user_id for slug resolution
      const subscription = await this.httpClient.get<{ user_id: number }>('/api/v1/subscription')
      const userId = subscription.user_id

      // Resolve slug from subscriptions cache
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
      const profile = await this.profileService.getProfileById(id)

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
      const profile = await this.profileService.getProfileBySlug(slug)

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
  async postForId(id: number): Promise<Post> {
    if (typeof id !== 'number') {
      throw new TypeError('Post ID must be a number')
    }

    try {
      const post = await this.postService.getPostById(id)
      return new Post(post, this.httpClient)
    } catch (error) {
      throw new Error(`Post with ID ${id} not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get a specific note by ID
   */
  async noteForId(id: number): Promise<Note> {
    if (typeof id !== 'number') {
      throw new TypeError('Note ID must be a number')
    }

    try {
      const noteData = await this.noteService.getNoteById(id)
      return new Note(noteData, this.httpClient)
    } catch {
      throw new Error(`Note with ID ${id} not found`)
    }
  }

  /**
   * Get a specific comment by ID
   */
  async commentForId(id: number): Promise<Comment> {
    if (typeof id !== 'number') {
      throw new TypeError('Comment ID must be a number')
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
