import type { GatewayNote } from '@substack-api/internal/types'

export class Note {
  public readonly id: number
  public readonly body: string
  public readonly likesCount: number
  public readonly author: {
    id: number
    name: string
    handle: string
    avatarUrl: string
  }
  public readonly publishedAt: Date

  constructor(private readonly rawData: GatewayNote) {
    this.id = rawData.id
    this.body = rawData.body
    this.likesCount = rawData.likes_count
    this.publishedAt = new Date(rawData.published_at)
    this.author = {
      id: rawData.author.id,
      name: rawData.author.name,
      handle: rawData.author.handle,
      avatarUrl: rawData.author.avatar_url
    }
  }
}
