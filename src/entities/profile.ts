import type { SubstackPublicProfile, SubstackFullProfile } from '../types'
import type { Substack } from '../client'
import { Post } from './post'
import { Note } from './note'

/**
 * Base Profile class representing a Substack user profile (read-only)
 */
export class Profile {
  public readonly id: number
  public readonly slug: string
  public readonly name: string
  public readonly url: string
  public readonly avatarUrl: string
  public readonly bio?: string

  constructor(
    protected readonly rawData: SubstackPublicProfile | SubstackFullProfile,
    protected readonly client: Substack
  ) {
    this.id = rawData.id
    this.slug = rawData.handle
    this.name = rawData.name
    this.url = `https://substack.com/@${rawData.handle}`
    this.avatarUrl = rawData.photo_url
    this.bio = rawData.bio
  }

  /**
   * Get posts from this profile's publications
   */
  async *posts(options: { limit?: number } = {}): AsyncIterable<Post> {
    // Get posts from the publications this profile is associated with
    // For now, use the client's general getPosts method
    // This could be enhanced to filter by publication if needed
    let count = 0
    for await (const post of this.client.getPosts(options)) {
      if (options.limit && count >= options.limit) {
        break
      }
      yield new Post(post, this.client)
      count++
    }
  }

  /**
   * Get notes from this profile
   */
  async *notes(options: { limit?: number } = {}): AsyncIterable<Note> {
    // Get notes from the authenticated user's feed
    // This may not work for other profiles unless the API supports it
    let count = 0
    for await (const note of this.client.getNotes(options)) {
      if (options.limit && count >= options.limit) {
        break
      }

      // Filter notes by this profile's user ID if possible
      const noteUserId = note.context.users[0]?.id
      if (noteUserId === this.id) {
        yield new Note(note, this.client)
        count++
      }
    }
  }
}
