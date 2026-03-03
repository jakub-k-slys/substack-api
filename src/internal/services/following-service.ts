import type { HttpClient } from '@substack-api/internal/http-client'
import { GatewayFollowingResponseC } from '@substack-api/internal/types'
import type { GatewayFollowingUser } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

export class FollowingService {
  constructor(private readonly client: HttpClient) {}

  async getFollowing(): Promise<GatewayFollowingUser[]> {
    const raw = await this.client.get<unknown>('/me/following')
    const response = decodeOrThrow(GatewayFollowingResponseC, raw, 'GatewayFollowingResponse')
    return response.items
  }
}
