import {
  SubstackPost,
  SubstackComment,
  SubstackConfig,
  SubstackSearchResult,
  SubstackNote,
  SubstackUserProfile,
  SubstackPublicProfile,
  SubstackFullProfile,
  PaginationParams,
  SearchParams,
  PublishNoteRequest,
  PublishNoteResponse,
  NotesIteratorOptions
} from './types'
import { NoteBuilder } from './note-builder'

export class SubstackError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: Response
  ) {
    super(message)
    this.name = 'SubstackError'
  }
}

export class Substack {
  private readonly baseUrl: string
  private readonly apiVersion: string
  private readonly cookie: string

  constructor(config: SubstackConfig) {
    if (!config.apiKey) {
      throw new Error('apiKey is required in SubstackConfig')
    }
    this.baseUrl = `https://${config.hostname || 'substack.com'}`
    this.apiVersion = config.apiVersion || 'v1'
    this.cookie = `connect.sid=s%3A${config.apiKey}`
  }

  private buildUrl<T extends PaginationParams>(path: string, params?: T): string {
    const url = `${this.baseUrl}/api/${this.apiVersion}${path}`
    if (!params) return url

    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) {
        searchParams.append(key, value.toString())
      }
    })

    const queryString = searchParams.toString()
    return queryString ? `${url}?${queryString}` : url
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(path, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        Cookie: this.cookie,
        ...options.headers
      }
    })

    if (!response.ok) {
      throw new SubstackError(`Request failed: ${response.statusText}`, response.status, response)
    }

    return response.json()
  }

  /**
   * Get posts for the publication
   * @param params Pagination parameters
   */
  async getPosts(params: PaginationParams = {}): Promise<SubstackPost[]> {
    const url = this.buildUrl('/posts', params)
    return this.request<SubstackPost[]>(url)
  }

  /**
   * Get a specific post by its slug
   * @param slug The post's slug
   */
  async getPost(slug: string): Promise<SubstackPost> {
    const url = this.buildUrl(`/posts/${slug}`)
    return this.request<SubstackPost>(url)
  }

  /**
   * Search posts in the publication
   * @param params Search parameters
   */
  async searchPosts(params: SearchParams): Promise<SubstackSearchResult> {
    const url = this.buildUrl('/search', params)
    return this.request<SubstackSearchResult>(url)
  }

  /**
   * Get comments for a specific post
   * @param postId The post ID
   * @param params Pagination parameters
   */
  async getComments(postId: number, params: PaginationParams = {}): Promise<SubstackComment[]> {
    const url = this.buildUrl(`/posts/${postId}/comments`, params)
    return this.request<SubstackComment[]>(url)
  }

  /**
   * Get a specific comment by its ID
   * @param commentId The comment ID
   */
  async getComment(commentId: number): Promise<SubstackComment> {
    const url = this.buildUrl(`/comments/${commentId}`)
    return this.request<SubstackComment>(url)
  }

  /**
   * Get Notes for the logged in user with automatic pagination
   * @param options Iterator options including limit for total notes to retrieve
   * @returns AsyncIterable of individual notes
   */
  async *getNotes(options: NotesIteratorOptions = {}): AsyncIterable<SubstackNote> {
    let cursor: string | undefined = undefined
    let totalFetched = 0
    
    while (true) {
      // Check if we've reached the limit before making another API call
      if (options.limit && totalFetched >= options.limit) {
        return
      }

      // Build pagination params for the API call
      const params: PaginationParams = { cursor }
      const url = this.buildUrl('/notes', params)
      
      const response = await this.request<{
        items: SubstackNote[]
        originalCursorTimestamp: string
        nextCursor: string | null
      }>(url)

      // Yield each note from the current page
      for (const note of response.items) {
        if (options.limit && totalFetched >= options.limit) {
          return
        }
        yield note
        totalFetched++
      }

      // Check if there are more pages
      if (!response.nextCursor) {
        break
      }
      
      cursor = response.nextCursor
    }
  }

  /**
   * Publish a new note on your Substack wall
   * @param text The text content of the note
   * @param formatting Optional array of formatting objects specifying bold or italic text ranges
   * @returns Promise of the published note response
   */
  /**
   * Internal method to publish a note request
   */
  async publishNoteRequest(request: PublishNoteRequest): Promise<PublishNoteResponse> {
    const url = this.buildUrl('/comment/feed')
    return this.request<PublishNoteResponse>(url, {
      method: 'POST',
      body: JSON.stringify(request)
    })
  }

  /**
   * Start building a note with the fluent API
   * @param text Optional initial text for the first paragraph
   */
  note(text?: string): NoteBuilder {
    return new NoteBuilder(this, text)
  }

  /**
   * Publish a simple note without formatting
   * @param text The text content of the note
   */
  /**
   * Get a user's profile by their user ID
   * @param userId The user's ID
   */
  async getUserProfile(userId: number): Promise<SubstackUserProfile> {
    const url = this.buildUrl(`/reader/feed/profile/${userId}`)
    return this.request<SubstackUserProfile>(url)
  }

  /**
   * Get a user's public profile by their slug
   * @param slug The user's slug (handle)
   */
  async getPublicProfile(slug: string): Promise<SubstackPublicProfile> {
    const url = this.buildUrl(`/user/${slug}/public_profile`)
    return this.request<SubstackPublicProfile>(url)
  }

  /**
   * Get a user's full profile (public profile + user profile) by their slug
   * @param slug The user's slug (handle)
   */
  async getFullProfileBySlug(slug: string): Promise<SubstackFullProfile> {
    const publicProfile = await this.getPublicProfile(slug)
    const userProfile = await this.getUserProfile(publicProfile.id)
    return {
      ...publicProfile,
      userProfile
    }
  }

  /**
   * Get a user's full profile (public profile + user profile) by their ID
   * @param userId The user's ID
   */
  async getFullProfileById(userId: number): Promise<SubstackFullProfile> {
    const userProfile = await this.getUserProfile(userId)
    // Get the handle from the first user in the first item's context
    const firstItem = userProfile.items?.[0]
    const user = firstItem?.context?.users?.[0]
    if (!user?.handle) {
      throw new Error('Could not find user handle in profile')
    }
    const publicProfile = await this.getPublicProfile(user.handle)
    return {
      ...publicProfile,
      userProfile: userProfile
    }
  }

  /**
   * Get the list of user IDs that the current user follows
   * @returns Promise of an array of user IDs
   */
  async getFollowingIds(): Promise<number[]> {
    const url = this.buildUrl('/feed/following')
    return this.request<number[]>(url)
  }

  /**
   * Get full profiles of all users that the current user follows
   * @returns Promise of an array of full profiles
   */
  async getFollowingProfiles(): Promise<SubstackFullProfile[]> {
    const userIds = await this.getFollowingIds()
    const profiles: SubstackFullProfile[] = []

    for (const id of userIds) {
      try {
        const userProfile = await this.getUserProfile(id)
        const firstItem = userProfile.items?.[0]
        const user = firstItem?.context?.users?.[0]
        if (!user?.handle) {
          continue
        }
        const publicProfile = await this.getPublicProfile(user.handle)
        profiles.push({
          ...publicProfile,
          userProfile: {
            originalCursorTimestamp: firstItem.context.timestamp,
            nextCursor: '',
            items: [
              {
                entity_key: firstItem.entity_key,
                type: firstItem.type,
                context: {
                  type: firstItem.context.type,
                  timestamp: firstItem.context.timestamp,
                  isFresh: firstItem.context.isFresh,
                  source: firstItem.context.source,
                  page_rank: firstItem.context.page_rank,
                  users: [user]
                },
                publication: null,
                post: null,
                comment: null,
                parentComments: [],
                canReply: firstItem.canReply,
                isMuted: firstItem.isMuted,
                trackingParameters: firstItem.trackingParameters
              }
            ]
          }
        })
      } catch {
        // Skip profiles that can't be fetched
        continue
      }
    }

    return profiles
  }

  async publishNote(text: string): Promise<PublishNoteResponse> {
    const request: PublishNoteRequest = {
      bodyJson: {
        type: 'doc',
        attrs: {
          schemaVersion: 'v1'
        },
        content: [
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                text
              }
            ]
          }
        ]
      },
      replyMinimumRole: 'everyone'
    }

    return this.publishNoteRequest(request)
  }
}
export * from './types'
