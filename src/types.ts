export interface SubstackPublication {
  name: string
  hostname: string
  subdomain: string
  logo?: {
    url: string
  }
  description?: string
}

export interface SubstackPost {
  id: number
  title: string
  subtitle?: string
  slug: string
  post_date: string
  description?: string
  audience?: string
  canonical_url: string
  cover_image?: string
  podcast_url?: string
  type: 'newsletter' | 'podcast' | 'thread'
  published: boolean
  paywalled: boolean
}

export interface SubstackComment {
  id: number
  body: string
  created_at: string
  parent_post_id: number
  author: {
    id: number
    name: string
    is_admin?: boolean
  }
}

export interface SubstackSearchResult {
  total: number
  results: SubstackPost[]
}

export interface SubstackConfig {
  hostname?: string
  apiVersion?: string
  apiKey: string
}

export interface PaginationParams {
  offset?: number
  limit?: number
}

export interface SearchParams extends PaginationParams {
  query: string
  published_before?: string
  published_after?: string
  type?: 'newsletter' | 'podcast' | 'thread'
}
