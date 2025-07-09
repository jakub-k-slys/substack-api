import { Profile } from './profile'
import { Note } from './note'
import { NoteBuilder } from '../note-builder'
import type { SubstackNote, SubstackFullProfile } from '../internal'
import type { ProfileService, NoteService } from '../internal/services'

/**
 * OwnProfile extends Profile with write capabilities for the authenticated user
 */
export class OwnProfile extends Profile {
  constructor(
    rawData: SubstackFullProfile,
    client: any,
    profileService: ProfileService,
    postService: any,
    private readonly noteService: NoteService,
    resolvedSlug?: string,
    slugResolver?: (userId: number, fallbackHandle?: string) => Promise<string | undefined>
  ) {
    super(rawData, client, profileService, postService, resolvedSlug, slugResolver)
  }

  /**
   * Create a new note using the builder pattern
   */
  newNote(): NoteBuilder
  newNote(text: string): NoteBuilder
  newNote(text?: string): NoteBuilder {
    return new NoteBuilder(this.client, text)
  }

  /**
   * Get users that the authenticated user follows
   */
  async *followees(options: { limit?: number } = {}): AsyncIterable<Profile> {
    // Use ProfileService to get the list of user IDs that the user follows
    const followingUserIds = await this.profileService.getFollowingUsers()

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
      // Use NoteService to fetch notes for the authenticated user
      const notesData = await this.noteService.getNotesForUser()

      let count = 0
      for (const noteData of notesData) {
        if (options.limit && count >= options.limit) break
        yield new Note(noteData, this.client)
        count++
      }
    } catch {
      // If the endpoint doesn't exist or fails, return empty iterator
      yield* []
    }
  }
}
