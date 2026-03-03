import type { HttpClient } from '@substack-api/internal/http-client'
import { GatewayProfileC } from '@substack-api/internal/types'
import type { GatewayProfile } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

export class ProfileService {
  constructor(private readonly client: HttpClient) {}

  async getOwnProfile(): Promise<GatewayProfile> {
    const raw = await this.client.get<unknown>('/me')
    return decodeOrThrow(GatewayProfileC, raw, 'GatewayProfile')
  }

  async getProfileBySlug(slug: string): Promise<GatewayProfile> {
    const raw = await this.client.get<unknown>(`/profiles/${encodeURIComponent(slug)}`)
    return decodeOrThrow(GatewayProfileC, raw, 'GatewayProfile')
  }
}
