/**
 * Configuration interfaces for the Substack Gateway client
 */

export interface SubstackConfig {
  gatewayUrl?: string // Gateway base URL (defaults to 'https://substack-gateway.vercel.app')
  publicationUrl: string // Publication base URL sent as x-publication-url header
  token: string // Bearer token: btoa(JSON.stringify({substack_sid, connect_sid}))
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
