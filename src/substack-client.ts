import { SubstackHttpClient } from './http-client'
import { Profile, OwnProfile, Post, Note, Comment } from './entities'
import { ProfileService, PostService, NoteService, CommentService, MemoryCache } from './services'
import type { ServiceConfig } from './services'
import { getSlugForUserId, type SubscriptionCache } from './client-utils'
import type { SubstackConfig } from './types'

/**
 * Modern SubstackClient with entity-based API using service layer
 */
export class SubstackClient {
  private readonly httpClient: SubstackHttpClient
  private subscriptionCache: SubscriptionCache = { mapping: null, timestamp: null }

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
   * Get the authenticated user's own profile with write capabilities
   * @throws {Error} When authentication fails or user profile cannot be retrieved
   */
  async ownProfile(): Promise<OwnProfile> {
    // Ensure services use the current httpClient (needed for testing)
    if ((this.httpClient as unknown as { get?: unknown }).get) {
      this.reinitializeServices()
    }
    return this.profileService.getOwnProfile((userId, fallbackHandle) =>
      getSlugForUserId(this.httpClient, this.subscriptionCache, userId, fallbackHandle)
    )
  }

  /**
   * Get a profile by user ID
   */
  async profileForId(id: number): Promise<Profile> {
    // Ensure services use the current httpClient (needed for testing)
    if ((this.httpClient as unknown as { get?: unknown }).get) {
      this.reinitializeServices()
    }
    return this.profileService.getProfileById(id, (userId, fallbackHandle) =>
      getSlugForUserId(this.httpClient, this.subscriptionCache, userId, fallbackHandle)
    )
  }

  /**
   * Get a profile by handle/slug
   */
  async profileForSlug(slug: string): Promise<Profile> {
    // Ensure services use the current httpClient (needed for testing)
    if ((this.httpClient as unknown as { get?: unknown }).get) {
      this.reinitializeServices()
    }
    return this.profileService.getProfileBySlug(slug, (userId, fallbackHandle) =>
      getSlugForUserId(this.httpClient, this.subscriptionCache, userId, fallbackHandle)
    )
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
