/**
 * HTTP client utility for Substack API requests
 */
import axios, { AxiosInstance } from 'axios'
import rateLimit from 'axios-rate-limit'

export class HttpClient {
  private readonly httpClient: AxiosInstance

  constructor(baseUrl: string, token: string, maxRequestsPerSecond: number = 25) {
    if (!token) {
      throw new Error('API token is required')
    }
    const instance = axios.create({
      baseURL: baseUrl,
      headers: {
        Cookie: `substack.sid=${token}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    })
    this.httpClient = rateLimit(instance, {
      maxRequests: maxRequestsPerSecond,
      perMilliseconds: 1000
    })
  }

  async get<T>(path: string): Promise<T> {
    const response = await this.httpClient.get(path)
    if (response.status != 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.data
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.httpClient.post(path, data)
    if (response.status != 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.data
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.httpClient.put(path, data)
    if (response.status != 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.data
  }
}
