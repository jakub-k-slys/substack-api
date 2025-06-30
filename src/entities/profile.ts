import type { SubstackPublicProfile, SubstackFullProfile } from '../types'
import type { SubstackHttpClient } from '../http-client'
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
    protected readonly client: SubstackHttpClient
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
  async *posts(_options: { limit?: number } = {}): AsyncIterable<Post> {
    // Mock implementation - in real API, this would fetch posts for this profile
    // For now, return empty iterator
    yield* []
  }

  /**
   * Get notes from this profile
   */
  async *notes(_options: { limit?: number } = {}): AsyncIterable<Note> {
    // Mock implementation - in real API, this would fetch notes for this profile
    // For now, return empty iterator
    yield* []
  }
}
