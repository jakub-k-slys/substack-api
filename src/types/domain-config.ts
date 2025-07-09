/**
 * Configuration interfaces for the Substack API client
 */

export interface SubstackConfig {
  hostname: string
  apiVersion?: string
  apiKey: string
  perPage?: number // Default items per page for pagination (default: 25)
  cacheTTL?: number // Cache TTL in seconds (default: 300)
  protocol?: 'http' | 'https' // Protocol to use (default: 'https')
  substackBaseUrl?: string // Base URL for global Substack endpoints (default: 'https://substack.com')
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
