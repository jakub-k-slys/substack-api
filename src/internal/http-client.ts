/**
 * HTTP client for the Substack Gateway proxy
 *
 * All requests are authenticated via a base64-encoded JSON Bearer token
 * (containing substack_sid and connect_sid) and the x-publication-url header.
 */
import axios, { AxiosInstance } from 'axios'
import rateLimit from 'axios-rate-limit'

export interface GatewayCredentials {
  token: string
  publicationUrl: string
}

export class HttpClient {
  private readonly httpClient: AxiosInstance

  constructor(baseUrl: string, creds: GatewayCredentials, maxRequestsPerSecond: number = 25) {
    const token = creds.token
    const instance = axios.create({
      baseURL: baseUrl,
      headers: {
        Authorization: `Bearer ${token}`,
        'x-publication-url': creds.publicationUrl,
        Accept: 'application/json',
        'Content-Type': 'application/json'
      }
    })
    this.httpClient = rateLimit(instance, {
      maxRequests: maxRequestsPerSecond,
      perMilliseconds: 1000
    })
  }

  async get<T>(path: string, params?: Record<string, string | number | undefined>): Promise<T> {
    const response = await this.httpClient.get(path, { params })
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.data
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.httpClient.post(path, data)
    if (response.status !== 200 && response.status !== 201) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.data
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    const response = await this.httpClient.put(path, data)
    if (response.status !== 200) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    return response.data
  }

  async delete(path: string): Promise<void> {
    const response = await this.httpClient.delete(path)
    if (response.status !== 200 && response.status !== 204) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
  }
}
