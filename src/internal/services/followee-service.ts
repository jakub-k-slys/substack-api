import type { HttpClient } from '../http-client'

/**
 * Service responsible for followee-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class FolloweeService {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Get users that the authenticated user follows
   * @returns Promise<number[]> - Array of user IDs that the user follows
   * @throws {Error} When following list cannot be retrieved
   */
  async getFollowees(): Promise<number[]> {
    return await this.httpClient.get<number[]>('/api/v1/feed/following')
  }
}
