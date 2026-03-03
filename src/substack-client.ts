import { HttpClient } from '@substack-api/internal/http-client'
import { FullPost, Note, OwnProfile, Profile } from '@substack-api/domain'
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

export class SubstackClient {
  private readonly client: HttpClient
  private readonly postService: PostService
  private readonly noteService: NoteService
  private readonly profileService: ProfileService
  private readonly commentService: CommentService
  private readonly followingService: FollowingService
  private readonly connectivityService: ConnectivityService
  private readonly newNoteService: NewNoteService
  private readonly perPage: number

  constructor(config: SubstackConfig) {
    const gatewayBase = (config.gatewayUrl ?? 'https://substack-gateway.vercel.app').replace(
      /\/$/,
      ''
    )
    const baseUrl = `${gatewayBase}/api/v1`

    this.perPage = config.perPage || 25
    const maxRequestsPerSecond = config.maxRequestsPerSecond || 25

    this.client = new HttpClient(
      baseUrl,
      { token: config.token, publicationUrl: config.publicationUrl },
      maxRequestsPerSecond
    )

    this.postService = new PostService(this.client)
    this.noteService = new NoteService(this.client)
    this.profileService = new ProfileService(this.client)
    this.commentService = new CommentService(this.client)
    this.followingService = new FollowingService(this.client)
    this.connectivityService = new ConnectivityService(this.client)
    this.newNoteService = new NewNoteService(this.client)
  }

  async testConnectivity(): Promise<boolean> {
    return this.connectivityService.isConnected()
  }

  async ownProfile(): Promise<OwnProfile> {
    try {
      const profile = await this.profileService.getOwnProfile()
      return new OwnProfile(
        profile,
        this.postService,
        this.noteService,
        this.commentService,
        this.profileService,
        this.followingService,
        this.newNoteService,
        this.perPage
      )
    } catch (error) {
      throw new Error(`Failed to get own profile: ${(error as Error).message}`)
    }
  }

  async profileForSlug(slug: string): Promise<Profile> {
    if (!slug || slug.trim() === '') {
      throw new Error('Profile slug cannot be empty')
    }

    try {
      const profile = await this.profileService.getProfileBySlug(slug)
      return new Profile(
        profile,
        this.postService,
        this.noteService,
        this.commentService,
        this.perPage
      )
    } catch (error) {
      throw new Error(`Profile with slug '${slug}' not found: ${(error as Error).message}`)
    }
  }

  async postForId(id: number): Promise<FullPost> {
    try {
      const post = await this.postService.getPostById(id)
      return new FullPost(post, this.commentService)
    } catch (error) {
      throw new Error(`Post with ID ${id} not found: ${(error as Error).message}`)
    }
  }

  async noteForId(id: number): Promise<Note> {
    try {
      const noteData = await this.noteService.getNoteById(id)
      return new Note(noteData)
    } catch {
      throw new Error(`Note with ID ${id} not found`)
    }
  }
}
