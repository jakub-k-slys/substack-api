import type { HttpClient } from '@substack-api/internal/http-client'

export class ConnectivityService {
  constructor(private readonly client: HttpClient) {}

  async isConnected(): Promise<boolean> {
    try {
      await this.client.get('/health/ready')
      return true
    } catch {
      return false
    }
  }
}
