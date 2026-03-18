import { HttpClient } from '@substack-api/internal/http-client'
import { Comment, FullPost, Note, OwnProfile, Profile } from '@substack-api/domain'
import {
  CommentService,
  ConnectivityService,
  FollowingService,
  NewNoteService,
  NoteService,
  PostService,
  ProfileService
} from '@substack-api/internal/services'
import type { SubstackConfig } from '@substack-api/types'

/**
 * Modern SubstackClient with entity-based API
 */
export class SubstackClient {
  private readonly publicationClient: HttpClient
  private readonly substackClient: HttpClient
  private readonly postService: PostService
  private readonly noteService: NoteService
  private readonly profileService: ProfileService
  private readonly commentService: CommentService
  private readonly followingService: FollowingService
  private readonly connectivityService: ConnectivityService
  private readonly newNoteService: NewNoteService
  private readonly perPage: number

  /**
   * Normalize URL by ensuring it has a protocol
   * If no protocol is specified, defaults to https://
   */
  private static normalizeUrl(url: string): string {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url
    }
    return `https://${url}`
  }

  constructor(config: SubstackConfig) {
    // Normalize URLs to ensure they have protocols
    const normalizedPublicationUrl = SubstackClient.normalizeUrl(config.publicationUrl)
    const normalizedSubstackUrl = SubstackClient.normalizeUrl(config.substackUrl || 'substack.com')

    // Determine URL prefix
    const urlPrefix = config.urlPrefix !== undefined ? config.urlPrefix : 'api/v1'

    // Store configuration
    this.perPage = config.perPage || 25
    const maxRequestsPerSecond = config.maxRequestsPerSecond || 25

    // Construct full base URL for publication-specific endpoints
    const publicationBaseUrl = urlPrefix
      ? `${normalizedPublicationUrl}/${urlPrefix}`
      : normalizedPublicationUrl
    this.publicationClient = new HttpClient(publicationBaseUrl, config.token, maxRequestsPerSecond)

    // Construct full base URL for global Substack endpoints
    const substackBaseUrl = urlPrefix
      ? `${normalizedSubstackUrl}/${urlPrefix}`
      : normalizedSubstackUrl
    this.substackClient = new HttpClient(substackBaseUrl, config.token, maxRequestsPerSecond)

    // Initialize services
    this.postService = new PostService(this.substackClient)
    this.noteService = new NoteService(this.publicationClient)
    this.profileService = new ProfileService(this.substackClient)
    this.commentService = new CommentService(this.publicationClient)
    this.followingService = new FollowingService(this.publicationClient, this.substackClient)
    this.connectivityService = new ConnectivityService(this.substackClient)
    this.newNoteService = new NewNoteService(this.substackClient)
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

      return new OwnProfile(
        profile,
        this.publicationClient,
        this.profileService,
        this.postService,
        this.noteService,
        this.commentService,
        this.followingService,
        this.newNoteService,
        this.perPage,
        profile.handle
      )
    } catch (error) {
      throw new Error(`Failed to get own profile: ${(error as Error).message}`)
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
      return new Profile(
        profile,
        this.publicationClient,
        this.profileService,
        this.postService,
        this.noteService,
        this.commentService,
        this.perPage,
        profile.handle
      )
    } catch (error) {
      throw new Error(`Profile with slug '${slug}' not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get a profile by user ID
   */
  async profileForId(id: number): Promise<Profile> {
    try {
      const profile = await this.profileService.getProfileById(id)
      return new Profile(
        profile,
        this.publicationClient,
        this.profileService,
        this.postService,
        this.noteService,
        this.commentService,
        this.perPage,
        profile.handle
      )
    } catch (error) {
      throw new Error(`Profile with ID ${id} not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get a specific post by ID
   */
  async postForId(id: number): Promise<FullPost> {
    try {
      const post = await this.postService.getPostById(id)
      return new FullPost(post, this.publicationClient, this.commentService)
    } catch (error) {
      throw new Error(`Post with ID ${id} not found: ${(error as Error).message}`)
    }
  }

  /**
   * Get a specific note by ID
   */
  async noteForId(id: number): Promise<Note> {
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
    try {
      const commentData = await this.commentService.getCommentById(id)
      return new Comment(commentData, this.publicationClient)
    } catch (error) {
      throw new Error(`Comment with ID ${id} not found: ${(error as Error).message}`)
    }
  }
}
