/**
 * Configuration interfaces for the Substack API client
 */

export interface SubstackConfig {
  publicationUrl: string // Publication base URL (mandatory, e.g., 'https://yourpub.substack.com')
  token: string // API authentication token (mandatory)
  substackUrl?: string // Base URL for global Substack endpoints (optional, defaults to 'https://substack.com')
  urlPrefix?: string // URL prefix for API endpoints (optional, defaults to 'api/v1/')
  perPage?: number // Default items per page for pagination (optional, defaults to 25)
  maxRequestsPerSecond?: number // Maximum API requests per second (optional, defaults to 25)
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
