import { Profile } from '@substack-api/domain/profile'
import { Note } from '@substack-api/domain/note'
import type { GatewayProfile } from '@substack-api/internal/types'
import type { GatewayCreateNoteResponse } from '@substack-api/internal/types'
import type {
  ProfileService,
  PostService,
  NoteService,
  FollowingService,
  CommentService,
  NewNoteService
} from '@substack-api/internal/services'

export class OwnProfile extends Profile {
  constructor(
    rawData: GatewayProfile,
    postService: PostService,
    noteService: NoteService,
    commentService: CommentService,
    private readonly profileService: ProfileService,
    private readonly followingService: FollowingService,
    private readonly newNoteService: NewNoteService,
    perPage: number
  ) {
    super(rawData, postService, noteService, commentService, perPage)
  }

  async publishNote(
    content: string,
    options?: { attachment?: string }
  ): Promise<GatewayCreateNoteResponse> {
    return this.newNoteService.publishNote(content, options?.attachment)
  }

  async *following(options: { limit?: number } = {}): AsyncIterable<Profile> {
    const followingUsers = await this.followingService.getFollowing()

    let count = 0
    for (const user of followingUsers) {
      if (options.limit && count >= options.limit) break

      try {
        const profileData = await this.profileService.getProfileBySlug(user.handle)
        yield new Profile(
          profileData,
          this.postService,
          this.noteService,
          this.commentService,
          this.perPage
        )
        count++
      } catch {
        /* empty */
      }
    }
  }

  async *notes(options: { limit?: number } = {}): AsyncIterable<Note> {
    try {
      let cursor: string | undefined = undefined
      let totalYielded = 0

      while (true) {
        const paginatedNotes = await this.noteService.getNotesForLoggedUser({ cursor })

        for (const noteData of paginatedNotes.notes) {
          if (options.limit && totalYielded >= options.limit) {
            return
          }
          yield new Note(noteData)
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
