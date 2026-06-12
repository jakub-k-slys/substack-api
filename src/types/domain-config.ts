/**
 * Configuration interfaces for the Substack API client
 */

export interface SubstackConfig {
  publicationUrl: string // Publication base URL (mandatory, e.g., 'https://yourpub.substack.com')
  substackSid?: string // Value of the "substack.sid" cookie. Provide this and/or connectSid.
  connectSid?: string // Value of the "connect.sid" cookie. Provide this and/or substackSid.
  /** @deprecated Alias for substackSid, kept for substack-api compatibility. */
  token?: string
  substackUrl?: string // Base URL for global Substack endpoints (optional, defaults to 'https://substack.com')
  urlPrefix?: string // URL prefix for API endpoints (optional, defaults to 'api/v1/')
  perPage?: number // Default items per page for pagination (optional, defaults to 25)
  maxRequestsPerSecond?: number // Maximum API requests per second (optional, defaults to 25)
  retryAttempts?: number // Retries for transient failures: network errors, 408/425/429/5xx (optional, defaults to 3)
}

export interface PaginationParams {
  limit?: number
  offset?: number
}

export interface SearchParams extends PaginationParams {
  query: string
  sort?: 'top' | 'new'
  author?: string
}
