import type { HttpClient } from '@substack-api/internal/http-client'
import { GatewayCommentsResponseC } from '@substack-api/internal/types'
import type { GatewayComment } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

export class CommentService {
  constructor(private readonly client: HttpClient) {}

  async getCommentsForPost(postId: number): Promise<GatewayComment[]> {
    const raw = await this.client.get<unknown>(`/posts/${postId}/comments`)
    const response = decodeOrThrow(GatewayCommentsResponseC, raw, 'GatewayCommentsResponse')
    return response.items
  }
}
