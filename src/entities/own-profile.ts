import { Profile } from './profile'
import { Post } from './post'
import { Note } from './note'

/**
 * OwnProfile extends Profile with write capabilities for the authenticated user
 */
export class OwnProfile extends Profile {
  /**
   * Create a new post
   */
  async createPost(_data: {
    title: string
    body: string
    subtitle?: string
    isDraft?: boolean
  }): Promise<Post> {
    // Implementation will create a post via the client
    throw new Error('Post creation not implemented yet - requires post creation API')
  }

  /**
   * Create a new note
   */
  async createNote(data: {
    body: string
    formatting?: Array<{ start: number; end: number; type: 'bold' | 'italic' }>
  }): Promise<Note> {
    // Use the client's note publishing functionality
    const response = await this.client.publishNote(data.body)

    // Convert the response back to a Note entity
    // This is a bit of a workaround since the API response format may differ
    const noteData = {
      entity_key: `note_${response.id}`,
      type: 'note',
      context: {
        type: 'note',
        timestamp: response.date,
        users: [
          {
            id: this.id,
            name: this.name,
            handle: this.slug,
            photo_url: this.avatarUrl,
            bio: this.bio,
            profile_set_up_at: new Date().toISOString(),
            reader_installed_at: new Date().toISOString()
          }
        ],
        isFresh: true,
        page_rank: 0
      },
      comment: {
        name: response.name,
        handle: this.slug,
        photo_url: response.photo_url,
        id: response.id,
        body: response.body,
        body_json: response.body_json as unknown as Record<string, unknown>,
        publication_id: response.publication_id,
        post_id: response.post_id,
        user_id: response.user_id,
        type: response.type,
        date: response.date,
        ancestor_path: response.ancestor_path,
        reply_minimum_role: response.reply_minimum_role,
        media_clip_id: response.media_clip_id,
        reaction_count: response.reaction_count,
        reactions: response.reactions,
        restacks: response.restacks,
        restacked: response.restacked,
        children_count: response.children_count,
        attachments: response.attachments,
        user_bestseller_tier: response.user_bestseller_tier,
        user_primary_publication: response.user_primary_publication
      },
      publication: null,
      post: null,
      parentComments: [],
      canReply: true,
      isMuted: false,
      trackingParameters: {
        item_primary_entity_key: `note_${response.id}`,
        item_entity_key: `note_${response.id}`,
        item_type: 'note',
        item_content_user_id: response.user_id,
        item_context_type: 'note',
        item_context_type_bucket: 'note',
        item_context_timestamp: response.date,
        item_context_user_id: response.user_id,
        item_context_user_ids: [response.user_id],
        item_can_reply: true,
        item_is_fresh: true,
        item_last_impression_at: null,
        item_page: null,
        item_page_rank: 0,
        impression_id: `impression_${Date.now()}`,
        followed_user_count: 0,
        subscribed_publication_count: 0,
        is_following: false,
        is_explicitly_subscribed: false
      }
    }

    return new Note(noteData, this.client)
  }

  /**
   * Get followers of this profile
   */
  async *followers(_options: { limit?: number } = {}): AsyncIterable<Profile> {
    // Implementation will get followers via the client
    // For now, this is not available in the current API
    // Return empty iterator as placeholder
    yield* []
  }
}
