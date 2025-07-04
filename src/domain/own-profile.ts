import { Profile } from './profile'
import { Note } from './note'
import { NoteBuilder } from '../note-builder'
import type { SubstackNote, SubstackFullProfile } from '../internal'

/**
 * OwnProfile extends Profile with write capabilities for the authenticated user
 */
export class OwnProfile extends Profile {
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
    // First, get the list of user IDs that the user follows
    const followingResponse = await this.client.get<number[]>('/api/v1/feed/following')

    // Then, for each user ID, fetch their detailed profile
    let count = 0
    for (const userId of followingResponse) {
      if (options.limit && count >= options.limit) break

      try {
        const profileResponse = await this.client.get<SubstackFullProfile>(
          `/api/v1/user/${userId}/profile`
        )

        // Use the same slug resolution as the main client if available
        let resolvedSlug = profileResponse.handle
        if (this.slugResolver) {
          resolvedSlug =
            (await this.slugResolver(userId, profileResponse.handle)) || profileResponse.handle
        }

        yield new Profile(profileResponse, this.client, resolvedSlug, this.slugResolver)
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
      // Fetch notes for the authenticated user
      const response = await this.client.get<{ items?: SubstackNote[] }>('/api/v1/notes')

      if (response.items) {
        let count = 0
        for (const noteData of response.items) {
          if (options.limit && count >= options.limit) break
          yield new Note(noteData, this.client)
          count++
        }
      }
    } catch {
      // If the endpoint doesn't exist or fails, return empty iterator
      yield* []
    }
  }
}
