import { SubstackHttpClient } from './http-client'
import { Profile, OwnProfile, Post, Note, Comment } from './entities'
import { ProfileService, PostService, NoteService, CommentService, MemoryCache } from './services'
import type { ServiceConfig } from './services'
import type {
  SubstackConfig,
  SubstackSubscriptionsResponse,
  SubstackSubscriptionPublication
} from './types'

/**
 * Modern SubstackClient with entity-based API using service layer
 */
export class SubstackClient {
  private readonly httpClient: SubstackHttpClient
  private subscriptionsCache: Map<number, string> | null = null // user_id -> slug mapping
  private subscriptionsCacheTimestamp: number | null = null

  // Service instances
  private readonly profileService: ProfileService
  private readonly postService: PostService
  private readonly noteService: NoteService
  private readonly commentService: CommentService

  constructor(config: SubstackConfig) {
    this.httpClient = new SubstackHttpClient(config)

    // Initialize services with dependency injection
    const serviceConfig: ServiceConfig = {
      httpClient: this.httpClient,
      cache: new MemoryCache(),
      logger: undefined // Can be injected by advanced users
    }

    this.profileService = new ProfileService(serviceConfig)
    this.postService = new PostService(serviceConfig)
    this.noteService = new NoteService(serviceConfig)
    this.commentService = new CommentService(serviceConfig)
  }

  /**
   * Re-initialize services with the current HTTP client instance
   * This method is called internally after httpClient is replaced in tests
   * @private
   */
  private reinitializeServices(): void {
    const serviceConfig: ServiceConfig = {
      httpClient: this.httpClient,
      cache: new MemoryCache(),
      logger: undefined
    }

    ;(this as unknown as { profileService: ProfileService }).profileService = new ProfileService(
      serviceConfig
    )
    ;(this as unknown as { postService: PostService }).postService = new PostService(serviceConfig)
    ;(this as unknown as { noteService: NoteService }).noteService = new NoteService(serviceConfig)
    ;(this as unknown as { commentService: CommentService }).commentService = new CommentService(
      serviceConfig
    )
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
    // Ensure services use the current httpClient (needed for testing)
    if ((this.httpClient as unknown as { get?: unknown }).get) {
      this.reinitializeServices()
    }
    return this.profileService.getOwnProfile(this.getSlugForUserId.bind(this))
  }

  /**
   * Get a profile by user ID
   */
  async profileForId(id: number): Promise<Profile> {
    // Ensure services use the current httpClient (needed for testing)
    if ((this.httpClient as unknown as { get?: unknown }).get) {
      this.reinitializeServices()
    }
    return this.profileService.getProfileById(id, this.getSlugForUserId.bind(this))
  }

  /**
   * Get a profile by handle/slug
   */
  async profileForSlug(slug: string): Promise<Profile> {
    // Ensure services use the current httpClient (needed for testing)
    if ((this.httpClient as unknown as { get?: unknown }).get) {
      this.reinitializeServices()
    }
    return this.profileService.getProfileBySlug(slug, this.getSlugForUserId.bind(this))
  }

  /**
   * Get a specific post by ID
   */
  async postForId(id: string): Promise<Post> {
    // Ensure services use the current httpClient (needed for testing)
    if ((this.httpClient as unknown as { get?: unknown }).get) {
      this.reinitializeServices()
    }
    return this.postService.getPostById(id)
  }

  /**
   * Get a specific note by ID
   */
  async noteForId(id: string): Promise<Note> {
    // Ensure services use the current httpClient (needed for testing)
    if ((this.httpClient as unknown as { get?: unknown }).get) {
      this.reinitializeServices()
    }
    return this.noteService.getNoteById(id)
  }

  /**
   * Get a specific comment by ID
   */
  async commentForId(id: string): Promise<Comment> {
    // Ensure services use the current httpClient (needed for testing)
    if ((this.httpClient as unknown as { get?: unknown }).get) {
      this.reinitializeServices()
    }
    return this.commentService.getCommentById(id)
  }
}
