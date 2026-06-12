import type { SubstackComment } from '@substackular/internal'
import type { HttpClient } from '@substackular/internal/http-client'

/**
 * Comment entity representing a comment on a post or note
 */
export class Comment {
  public readonly id: number
  public readonly body: string
  public readonly isAdmin?: boolean
  public readonly likesCount?: number

  constructor(
    private readonly rawData: SubstackComment,
    private readonly publicationClient: HttpClient
  ) {
    this.id = rawData.id
    this.body = rawData.body
    this.isAdmin = rawData.author_is_admin
    this.likesCount = undefined // TODO: Extract from rawData when available
  }
}
