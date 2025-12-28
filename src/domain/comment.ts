import type { SubstackComment } from '@/internal'
import type { HttpClient } from '@/internal/http-client'

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
    private readonly client: HttpClient
  ) {
    this.id = rawData.id
    this.body = rawData.body
    this.isAdmin = rawData.author_is_admin
    this.likesCount = undefined // TODO: Extract from rawData when available
  }
}
