import type { HttpClient } from '@substack-api/internal/http-client'

/**
 * Service responsible for checking API connectivity and session validity
 * Provides a clean boolean indicator of whether the API is accessible
 */
export class ConnectivityService {
  constructor(private readonly substackClient: HttpClient) {}

  /**
   * Check if the API is connected and accessible
   * Uses a lightweight endpoint to verify connectivity without side effects
   * @returns Promise<boolean> - true if API is accessible, false otherwise
   */
  async isConnected(): Promise<boolean> {
    try {
      await this.substackClient.get('/feed/following')
      return true
    } catch {
      return false
    }
  }
}
