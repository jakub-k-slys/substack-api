/**
 * Internal API response types - not exported from the public API
 * These represent raw response shapes from Substack's API endpoints
 * Using io-ts codecs for runtime validation
 */

import * as t from 'io-ts'

/**
 * Raw API response shape for publications - flattened
 */
export const SubstackPublicationCodec = t.intersection([
  t.type({
    name: t.string,
    hostname: t.string,
    subdomain: t.string
  }),
  t.partial({
    logo_url: t.string,
    description: t.string
  })
])

export type SubstackPublication = t.TypeOf<typeof SubstackPublicationCodec>

/**
 * Raw API response shape for posts
 */
export const SubstackPostCodec = t.intersection([
  t.type({
    id: t.number,
    title: t.string,
    slug: t.string,
    post_date: t.string,
    canonical_url: t.string,
    type: t.union([t.literal('newsletter'), t.literal('podcast'), t.literal('thread')])
  }),
  t.partial({
    subtitle: t.string,
    description: t.string,
    audience: t.string,
    cover_image: t.string,
    podcast_url: t.string,
    published: t.boolean,
    paywalled: t.boolean,
    truncated_body_text: t.string,
    htmlBody: t.string
  })
])

export type SubstackPost = t.TypeOf<typeof SubstackPostCodec>

/**
 * Raw API response shape for full posts from /posts/by-id/:id endpoint
 * Includes body_html and additional fields not present in preview responses
 *
 * Key differences from SubstackPostCodec:
 * - body_html is required (contains full HTML content)
 * - Includes postTags, reactions, restacks, and publication fields
 * - Used specifically for FullPost construction via getPostById()
 * - SubstackPostCodec should be used for preview/list responses
 */
export const SubstackFullPostCodec = t.intersection([
  t.type({
    id: t.number,
    title: t.string,
    slug: t.string,
    post_date: t.string,
    canonical_url: t.string,
    type: t.union([t.literal('newsletter'), t.literal('podcast'), t.literal('thread')]),
    body_html: t.string
  }),
  t.partial({
    subtitle: t.string,
    description: t.string,
    audience: t.string,
    cover_image: t.string,
    podcast_url: t.string,
    published: t.boolean,
    paywalled: t.boolean,
    truncated_body_text: t.string,
    htmlBody: t.string, // Legacy field for backward compatibility
    postTags: t.array(t.string),
    reactions: t.record(t.string, t.number),
    restacks: t.number,
    publication: t.type({
      id: t.number,
      name: t.string,
      subdomain: t.string
    })
  })
])

export type SubstackFullPost = t.TypeOf<typeof SubstackFullPostCodec>

/**
 * Raw API response shape for comments - flattened
 */
export const SubstackCommentCodec = t.intersection([
  t.type({
    id: t.number,
    body: t.string,
    created_at: t.string,
    parent_post_id: t.number,
    author_id: t.number,
    author_name: t.string
  }),
  t.partial({
    author_is_admin: t.boolean
  })
])

export type SubstackComment = t.TypeOf<typeof SubstackCommentCodec>

/**
 * Response structure from /api/v1/reader/comment/{id} endpoint - keeping wrapper structure
 */
export const SubstackCommentResponseCodec = t.type({
  item: t.type({
    comment: t.intersection([
      t.type({
        id: t.number,
        body: t.string,
        user_id: t.number,
        name: t.string,
        date: t.string
      }),
      t.partial({
        post_id: t.union([t.number, t.null])
      })
    ])
  })
})

export type SubstackCommentResponse = t.TypeOf<typeof SubstackCommentResponseCodec>

/**
 * Raw API response shape for search results
 */
export const SubstackSearchResultCodec = t.type({
  total: t.number,
  results: t.array(SubstackPostCodec)
})

export type SubstackSearchResult = t.TypeOf<typeof SubstackSearchResultCodec>

/**
 * Subscription types for internal API responses
 */
export interface SubstackSubscription {
  id: number
  user_id: number
  publication_id: number
  expiry: string | null
  email_disabled: boolean
  membership_state: string
  type: string | null
  gift_user_id: number | null
  created_at: string
  gifted_at: string | null
  paused: string | null
  is_group_parent: boolean
  visibility: string
  is_founding: boolean
  is_favorite: boolean
  podcast_rss_token: string
  email_settings: Record<string, unknown> | null
  section_podcasts_enabled: string[] | null
}

export interface SubstackPublicationUser {
  id: number
  publication_id: number
  user_id: number
  public: boolean
  created_at: string
  updated_at: string
  public_rank: number
  name: string | null
  bio: string | null
  photo_url: string | null
  role: string
  is_primary: boolean
  show_badge: boolean | null
  is_in_notes_feed: boolean
  twitter_screen_name: string | null
  email: string | null
  primary_section_id: number | null
}

export interface SubstackSubscriptionPublication {
  id: number
  name: string
  subdomain: string
  custom_domain?: string | null
  is_on_substack: boolean
  author_id: number
  author_handle: string
  created_at: string
  logo_url?: string
  cover_photo_url?: string
  twitter_screen_name?: string | null
  community_enabled: boolean
  copyright?: string
  founding_subscription_benefits?: string[]
  paid_subscription_benefits?: string[]
  free_subscription_benefits?: string[]
  stripe_user_id?: string
  stripe_country?: string
  payments_state?: string
  language?: string
  email_from_name?: string
  homepage_type?: string
  theme_background_pop_color?: string
  theme_web_bg_color?: string
  theme_cover_bg_color?: string | null
}

export interface SubstackSubscriptionsResponse {
  subscriptions: SubstackSubscription[]
  publicationUsers: SubstackPublicationUser[]
  publications: SubstackSubscriptionPublication[]
}
