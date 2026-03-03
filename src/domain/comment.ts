import type { GatewayComment } from '@substack-api/internal/types'

export class Comment {
  public readonly id: number
  public readonly body: string
  public readonly isAdmin?: boolean

  constructor(private readonly rawData: GatewayComment) {
    this.id = rawData.id
    this.body = rawData.body
    this.isAdmin = rawData.is_admin
  }
}
