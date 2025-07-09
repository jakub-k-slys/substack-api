import { SubstackHttpClient } from './http-client'
import { Profile, OwnProfile, Post, Note, Comment } from './domain'
import {
  PostService,
  NoteService,
  ProfileService,
  SlugService,
  CommentService,
  FolloweeService
} from './internal/services'
import type { SubstackConfig } from './types'

/**
 * Modern SubstackClient with entity-based API
 */
export class SubstackClient {
  private readonly httpClient: SubstackHttpClient
  private readonly globalHttpClient: SubstackHttpClient
  private readonly postService: PostService
  private readonly noteService: NoteService
  private readonly profileService: ProfileService
  private readonly slugService: SlugService
  private readonly commentService: CommentService
  private readonly followeeService: FolloweeService

  constructor(config: SubstackConfig) {
    // Create HTTP client for publication-specific endpoints
    const protocol = config.protocol || 'https'
    const publicationBaseUrl = `${protocol}://${config.hostname || 'substack.com'}`
    this.httpClient = new SubstackHttpClient(publicationBaseUrl, config)

    // Create HTTP client for global Substack endpoints
    const substackBaseUrl = config.substackBaseUrl || 'https://substack.com'
    this.globalHttpClient = new SubstackHttpClient(substackBaseUrl, config)

    // Initialize services
    this.postService = new PostService(this.globalHttpClient, this.httpClient)
    this.noteService = new NoteService(this.httpClient)
    this.profileService = new ProfileService(this.httpClient)
    this.slugService = new SlugService(this.httpClient)
    this.commentService = new CommentService(this.httpClient)
    this.followeeService = new FolloweeService(this.httpClient)
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
    try {
      const profile = await this.profileService.getOwnProfile()

      // Get user_id for slug resolution
      const subscription = await this.httpClient.get<{ user_id: number }>('/api/v1/subscription')
      const userId = subscription.user_id

      // Resolve slug from slug service
      const resolvedSlug = await this.slugService.getSlugForUserId(userId, profile.handle)

      return new OwnProfile(
        profile,
        this.httpClient,
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
        this.httpClient,
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
        this.httpClient,
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
  async postForId(id: number): Promise<Post> {
    if (typeof id !== 'number') {
      throw new TypeError('Post ID must be a number')
    }

    try {
      const post = await this.postService.getPostById(id)
      return new Post(post, this.httpClient, this.postService, this.commentService)
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

    try {
      const commentData = await this.commentService.getCommentById(id)
      return new Comment(commentData, this.httpClient)
    } catch (error) {
      throw new Error(`Comment with ID ${id} not found: ${(error as Error).message}`)
    }
  }
}
