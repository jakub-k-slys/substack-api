import type { HttpClient } from '@/internal/http-client'
import { SubscriberLists } from '@/internal/types/subscriber-lists'
import { isLeft } from 'fp-ts/Either'
import { PathReporter } from 'io-ts/PathReporter'

export type FollowingUser = {
  id: number
  handle: string
}
/**
 * Service responsible for following-related HTTP operations
 * Returns internal types that can be transformed into domain models
 */
export class FollowingService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly substackClient: HttpClient
  ) {}

  async getOwnId(): Promise<number> {
    const { user_id } = await this.substackClient.put<{ user_id: number }>('/api/v1/user-setting', {
      type: 'last_home_tab',
      value_text: 'inbox'
    })
    return user_id
  }
  /**
   * Get users that the authenticated user follows
   * @returns Promise<FollowingUser[]> - Array of users that the authenticated user follows
   * @throws {Error} When following list cannot be retrieved
   */
  async getFollowing(): Promise<FollowingUser[]> {
    const userId = await this.getOwnId()
    const data = await this.httpClient.get(
      `/api/v1/user/${userId}/subscriber-lists?lists=following`
    )

    const lists = SubscriberLists.decode(data)
    if (isLeft(lists)) {
      throw Error(`Could not validate data: ${PathReporter.report(lists).join('\n')}`)
    }
    return lists.right.subscriberLists[0].groups[0].users.map((user) => user)
  }
}
