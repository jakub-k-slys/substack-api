/**
 * HTTP client utility for Substack API requests
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios'
import rateLimit from 'axios-rate-limit'
import axiosRetry from 'axios-retry'
import { SubstackApiError, SubstackAuthError } from '@substackular/errors'

/**
 * Session cookies used to authenticate against Substack.
 * Some accounts only have "substack.sid", others only "connect.sid" —
 * at least one is required, and both are sent when available.
 */
export interface SubstackAuth {
  /** Value of the "substack.sid" cookie */
  substackSid?: string
  /** Value of the "connect.sid" cookie */
  connectSid?: string
}

export interface HttpClientOptions {
  maxRequestsPerSecond?: number
  /** Retries for transient failures (network errors, 408/425/429/5xx). Default 3. */
  retryAttempts?: number
}

const RETRYABLE_STATUS_CODES = new Set([408, 425, 429, 500, 502, 503, 504])

export class HttpClient {
  private readonly httpClient: AxiosInstance

  constructor(baseUrl: string, auth: SubstackAuth, options: HttpClientOptions = {}) {
    const cookies: string[] = []
    if (auth.substackSid) {
      cookies.push(`substack.sid=${auth.substackSid}`)
    }
    if (auth.connectSid) {
      cookies.push(`connect.sid=${auth.connectSid}`)
    }
    if (cookies.length === 0) {
      throw new Error(
        'At least one authentication cookie is required: provide substackSid ("substack.sid") and/or connectSid ("connect.sid")'
      )
    }

    const instance = axios.create({
      baseURL: baseUrl,
      headers: {
        Cookie: cookies.join('; '),
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    })

    axiosRetry(instance, {
      retries: options.retryAttempts ?? 3,
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) =>
        axiosRetry.isNetworkError(error) ||
        (error.response !== undefined && RETRYABLE_STATUS_CODES.has(error.response.status))
    })

    this.httpClient = rateLimit(instance, {
      maxRequests: options.maxRequestsPerSecond ?? 25,
      perMilliseconds: 1000
    })
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(() => this.httpClient.get(path))
  }

  async post<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(() => this.httpClient.post(path, data))
  }

  async put<T>(path: string, data?: unknown): Promise<T> {
    return this.request<T>(() => this.httpClient.put(path, data))
  }

  async delete<T = void>(path: string): Promise<T> {
    return this.request<T>(() => this.httpClient.delete(path))
  }

  private async request<T>(send: () => Promise<AxiosResponse<T>>): Promise<T> {
    let response: AxiosResponse<T>
    try {
      response = await send()
    } catch (error) {
      throw HttpClient.toSubstackError(error)
    }
    if (response.status < 200 || response.status >= 300) {
      throw HttpClient.statusError(response.status, response.statusText)
    }
    return response.data
  }

  private static statusError(status: number, statusText?: string): SubstackApiError {
    const message = statusText ? `HTTP ${status}: ${statusText}` : `HTTP ${status}`
    if (status === 401 || status === 403) {
      return new SubstackAuthError(status, message)
    }
    return new SubstackApiError(status, message)
  }

  private static toSubstackError(error: unknown): Error {
    if (axios.isAxiosError?.(error)) {
      if (error.response) {
        return HttpClient.statusError(error.response.status, error.response.statusText)
      }
      return new SubstackApiError(undefined, `Network error: ${error.message}`)
    }
    return error instanceof Error ? error : new Error(String(error))
  }
}
