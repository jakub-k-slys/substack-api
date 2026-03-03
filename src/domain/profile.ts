import type { GatewayProfile } from '@substack-api/internal/types'
import type { CommentService, PostService, NoteService } from '@substack-api/internal/services'
import { PreviewPost } from '@substack-api/domain/post'
import { Note } from '@substack-api/domain/note'

export class Profile {
  public readonly id: number
  public readonly slug: string
  public readonly handle: string
  public readonly name: string
  public readonly url: string
  public readonly avatarUrl: string
  public readonly bio?: string

  constructor(
    protected readonly rawData: GatewayProfile,
    protected readonly postService: PostService,
    protected readonly noteService: NoteService,
    protected readonly commentService: CommentService,
    protected readonly perPage: number
  ) {
    this.id = rawData.id
    this.slug = rawData.handle
    this.handle = rawData.handle
    this.name = rawData.name
    this.url = rawData.url
    this.avatarUrl = rawData.avatar_url
    this.bio = rawData.bio ?? undefined
  }

  async *posts(options: { limit?: number } = {}): AsyncIterable<PreviewPost> {
    try {
      let offset = 0
      let totalYielded = 0

      while (true) {
        const postsData = await this.postService.getPostsForProfile(this.slug, {
          limit: this.perPage,
          offset
        })

        if (!postsData || postsData.length === 0) {
          break
        }

        for (const postData of postsData) {
          if (options.limit && totalYielded >= options.limit) {
            return
          }
          yield new PreviewPost(postData, this.commentService, this.postService)
          totalYielded++
        }

        if (postsData.length < this.perPage) {
          break
        }

        offset += this.perPage
      }
    } catch {
      yield* []
    }
  }

  async *notes(options: { limit?: number } = {}): AsyncIterable<Note> {
    try {
      let cursor: string | undefined = undefined
      let totalYielded = 0

      while (true) {
        const paginatedNotes = await this.noteService.getNotesForProfile(this.slug, { cursor })

        for (const item of paginatedNotes.notes) {
          if (options.limit && totalYielded >= options.limit) {
            return
          }
          yield new Note(item)
          totalYielded++
        }

        if (!paginatedNotes.nextCursor) {
          break
        }

        cursor = paginatedNotes.nextCursor
      }
    } catch {
      yield* []
    }
  }
}
