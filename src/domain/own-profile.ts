import { Profile } from './profile'
import { Note } from './note'
import { NoteBuilder, NoteWithLinkBuilder } from './note-builder'
import type { SubstackFullProfile } from '../internal'
import type { HttpClient } from '../internal/http-client'
import type {
  ProfileService,
  PostService,
  NoteService,
  FolloweeService,
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
    private readonly followeeService: FolloweeService,
    resolvedSlug?: string,
    slugResolver?: (userId: number, fallbackHandle?: string) => Promise<string | undefined>
  ) {
    super(
      rawData,
      client,
      profileService,
      postService,
      noteService,
      commentService,
      resolvedSlug,
      slugResolver
    )
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
  async *followees(options: { limit?: number } = {}): AsyncIterable<Profile> {
    // Use FolloweeService to get the list of user IDs that the user follows
    const followingUserIds = await this.followeeService.getFollowees()

    // Then, for each user ID, fetch their detailed profile
    let count = 0
    for (const userId of followingUserIds) {
      if (options.limit && count >= options.limit) break

      try {
        const profileResponse = await this.profileService.getProfileById(userId)

        // Use the same slug resolution as the main client if available
        let resolvedSlug = profileResponse.handle
        if (this.slugResolver) {
          resolvedSlug =
            (await this.slugResolver(userId, profileResponse.handle)) || profileResponse.handle
        }

        yield new Profile(
          profileResponse,
          this.client,
          this.profileService,
          this.postService,
          this.noteService,
          this.commentService,
          resolvedSlug,
          this.slugResolver
        )
        count++
      } catch {
        // Skip profiles that can't be fetched (e.g., deleted accounts, private profiles)
        // This ensures the iterator continues working even if some profiles are inaccessible
        continue
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
