/**
 * Raw comment API response types (internal implementation details)
 */

export interface RawSubstackComment {
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

export interface RawSubstackCommentResponse {
  item: {
    comment: {
      id: number
      body: string
      user_id: number
      name: string
      date: string
      post_id?: number | null
      // Additional fields that may be present but not needed for our Comment entity
      [key: string]: unknown
    }
  }
}