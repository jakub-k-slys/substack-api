import { HttpClient } from './internal/http-client'
import { Profile, OwnProfile, FullPost, Note, Comment } from './domain'
import {
  PostService,
  NoteService,
  ProfileService,
  SlugService,
  CachingSlugService,
  CommentService,
  FolloweeService,
  ConnectivityService
} from './internal/services'
import { InMemoryCache } from './internal/cache'
import type { SubstackConfig } from './types'

/**
 * Modern SubstackClient with entity-based API
 */
export class SubstackClient {
  private readonly publicationClient: HttpClient
  private readonly substackClient: HttpClient
  private readonly postService: PostService
  private readonly noteService: NoteService
  private readonly profileService: ProfileService
  private readonly slugService: CachingSlugService
  private readonly commentService: CommentService
  private readonly followeeService: FolloweeService
  private readonly connectivityService: ConnectivityService

  constructor(config: SubstackConfig) {
    // Create HTTP client for publication-specific endpoints
    const protocol = config.protocol || 'https'
    const publicationBaseUrl = `${protocol}://${config.hostname || 'substack.com'}`
    this.publicationClient = new HttpClient(publicationBaseUrl, config)

    // Create HTTP client for global Substack endpoints
    const substackBaseUrl = config.substackBaseUrl || 'https://substack.com'
    this.substackClient = new HttpClient(substackBaseUrl, config)

    // Initialize services
    this.postService = new PostService(this.substackClient, this.publicationClient)
    this.noteService = new NoteService(this.publicationClient)
    this.profileService = new ProfileService(this.publicationClient)

    // Create caching slug service using decorator pattern
    const baseSlugService = new SlugService(this.publicationClient)
    const slugCache = new InMemoryCache<number, string>()
    this.slugService = new CachingSlugService(slugCache, baseSlugService)

    this.commentService = new CommentService(this.publicationClient)
    this.followeeService = new FolloweeService(this.publicationClient)
    this.connectivityService = new ConnectivityService(this.publicationClient)
  }

  /**
   * Test API connectivity
   */
  async testConnectivity(): Promise<boolean> {
    return await this.connectivityService.isConnected()
  }

  /**
   * Get the authenticated user's own profile with write capabilities
   * @throws {Error} When authentication fails or user profile cannot be retrieved
   */
  async ownProfile(): Promise<OwnProfile> {
    try {
      const profile = await this.profileService.getOwnProfile()

      // Get user_id for slug resolution
      const subscription = await this.publicationClient.get<{ user_id: number }>(
        '/api/v1/subscription'
      )
      const userId = subscription.user_id

      // Resolve slug from slug service
      const resolvedSlug = await this.slugService.getSlugForUserId(userId, profile.handle)

      return new OwnProfile(
        profile,
        this.publicationClient,
        this.profileService,
        this.postService,
        this.noteService,
        this.commentService,
        this.followeeService,
        resolvedSlug,
        this.slugService.getSlugForUserId.bind(this.slugService)
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

      // Resolve slug from slug service
      const resolvedSlug = await this.slugService.getSlugForUserId(id, profile.handle)

      return new Profile(
        profile,
        this.publicationClient,
        this.profileService,
        this.postService,
        this.noteService,
        this.commentService,
        resolvedSlug,
        this.slugService.getSlugForUserId.bind(this.slugService)
      )
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
      // but still check slug service for consistency
      const resolvedSlug = await this.slugService.getSlugForUserId(profile.id, slug)

      return new Profile(
        profile,
        this.publicationClient,
        this.profileService,
        this.postService,
        this.noteService,
        this.commentService,
        resolvedSlug,
        this.slugService.getSlugForUserId.bind(this.slugService)
      )
    } catch (error) {
      throw new Error(`Profile with slug '${slug}' not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get a specific post by ID
   */
  async postForId(id: number): Promise<FullPost> {
    if (typeof id !== 'number') {
      throw new TypeError('Post ID must be a number')
    }

    try {
      const post = await this.postService.getPostById(id)
      return new FullPost(post, this.publicationClient, this.commentService, this.postService)
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
      return new Note(noteData, this.publicationClient)
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

    try {
      const commentData = await this.commentService.getCommentById(id)
      return new Comment(commentData, this.publicationClient)
    } catch (error) {
      throw new Error(`Comment with ID ${id} not found: ${(error as Error).message}`)
    }
  }
}
