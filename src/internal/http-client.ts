/**
 * HTTP client utility for Substack API requests
 */
import type { SubstackConfig } from '../types'

export class HttpClient {
  private readonly baseUrl: string
  private readonly cookie: string
  private readonly perPage: number

  constructor(baseUrl: string, config: SubstackConfig) {
    if (!config.apiKey) {
      throw new Error('apiKey is required in SubstackConfig')
    }
    this.baseUrl = baseUrl
    this.cookie = `connect.sid=${config.apiKey}`
    this.perPage = config.perPage || 25
  }

  /**
   * Get the configured items per page for pagination
   */
  getPerPage(): number {
    return this.perPage
  }

  private async makeRequest<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      headers: {
        Cookie: this.cookie,
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    return response.json()
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`
    return this.makeRequest<T>(url, options)
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path)
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    })
  }
}
