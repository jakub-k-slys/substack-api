import type { HttpClient } from '@substack-api/internal/http-client'
import { GatewayFullPostC, GatewayPostsPageC } from '@substack-api/internal/types'
import type { GatewayFullPost, GatewayPost } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

export class PostService {
  constructor(private readonly client: HttpClient) {}

  async getPostById(id: number): Promise<GatewayFullPost> {
    const raw = await this.client.get<unknown>(`/posts/${id}`)
    return decodeOrThrow(GatewayFullPostC, raw, 'GatewayFullPost')
  }

  async getPostsForProfile(
    slug: string,
    options: { limit: number; offset: number }
  ): Promise<GatewayPost[]> {
    const raw = await this.client.get<unknown>(`/profiles/${encodeURIComponent(slug)}/posts`, {
      limit: options.limit,
      offset: options.offset
    })
    const page = decodeOrThrow(GatewayPostsPageC, raw, 'GatewayPostsPage')
    return page.items
  }
}
