import type { SubstackComment } from '../internal'
import type { HttpClient } from '../internal/http-client'

/**
 * Comment entity representing a comment on a post or note
 */
export class Comment {
  public readonly id: number
  public readonly body: string
  public readonly author: {
    id: number
    name: string
    isAdmin?: boolean
  }
  public readonly createdAt: Date
  public readonly likesCount?: number

  constructor(
    private readonly rawData: SubstackComment,
    private readonly client: HttpClient
  ) {
    this.id = rawData.id
    this.body = rawData.body
    this.author = {
      id: rawData.author_id,
      name: rawData.author_name,
      isAdmin: rawData.author_is_admin
    }
    this.createdAt = new Date(rawData.created_at)
    this.likesCount = undefined // TODO: Extract from rawData when available
  }
}
