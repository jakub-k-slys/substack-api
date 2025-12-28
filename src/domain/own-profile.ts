import { Profile } from './profile'
import { Note } from './note'
import { NoteBuilder, NoteWithLinkBuilder } from './note-builder'
import type { SubstackFullProfile } from '../internal'
import type { HttpClient } from '../internal/http-client'
import type {
  ProfileService,
  PostService,
  NoteService,
  FollowingService,
  CommentService
} from '../internal/services'

/**
 * OwnProfile extends Profile with write capabilities for the authenticated user
 */
export class OwnProfile extends Profile {
  constructor(
    rawData: SubstackFullProfile,
    client: HttpClient,
    profileService: ProfileService,
    postService: PostService,
    noteService: NoteService,
    commentService: CommentService,
    private readonly followingService: FollowingService,
    resolvedSlug?: string
  ) {
    super(rawData, client, profileService, postService, noteService, commentService, resolvedSlug)
  }

  /**
   * Create a new note using the builder pattern
   */
  newNote(): NoteBuilder {
    return new NoteBuilder(this.client)
  }

  /**
   * Create a new note with a link attachment using the builder pattern
   */
  newNoteWithLink(link: string): NoteWithLinkBuilder {
    return new NoteWithLinkBuilder(this.client, link)
  }

  /**
   * Get users that the authenticated user follows
   */
  async *following(options: { limit?: number } = {}): AsyncIterable<Profile> {
    const followingUsers = await this.followingService.getFollowing()

    let count = 0
    for (const user of followingUsers) {
      if (options.limit && count >= options.limit) break

      try {
        const profileResponse = await this.profileService.getProfileBySlug(user.handle)
        yield new Profile(
          profileResponse,
          this.client,
          this.profileService,
          this.postService,
          this.noteService,
          this.commentService,
          user.handle
        )
        count++
      } catch {
        /* empty */
      }
    }
  }

  /**
   * Get notes from the authenticated user's profile
   */
  async *notes(options: { limit?: number } = {}): AsyncIterable<Note> {
    try {
      let cursor: string | undefined = undefined
      let totalYielded = 0

      while (true) {
        // Use NoteService to fetch notes for the authenticated user with cursor-based pagination
        const paginatedNotes = await this.noteService.getNotesForLoggedUser({
          cursor
        })

        if (!paginatedNotes.notes) {
          break // No more notes to fetch
        }

        for (const noteData of paginatedNotes.notes) {
          if (options.limit && totalYielded >= options.limit) {
            return // Stop if we've reached the requested limit
          }
          yield new Note(noteData, this.client)
          totalYielded++
        }

        // If there's no next cursor, we've reached the end
        if (!paginatedNotes.nextCursor) {
          break
        }

        cursor = paginatedNotes.nextCursor
      }
    } catch {
      // If the endpoint doesn't exist or fails, return empty iterator
      yield* []
    }
  }
}
