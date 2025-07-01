/**
 * HTTP client utility for Substack API requests
 */
import type { SubstackConfig } from './types'

export class SubstackHttpClient {
  private readonly baseUrl: string
  private readonly cookie: string

  constructor(config: SubstackConfig) {
    if (!config.apiKey) {
      throw new Error('apiKey is required in SubstackConfig')
    }
    this.baseUrl = `https://${config.hostname || 'substack.com'}`
    this.cookie = `connect.sid=${config.apiKey}`
  }

  async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`
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
