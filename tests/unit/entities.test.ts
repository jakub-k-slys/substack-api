import { SubstackClient } from '../../src/substack-client'
import { Profile, Post, Comment, OwnProfile } from '../../src/entities'
import type { SubstackHttpClient } from '../../src/http-client'

describe('SubstackClient Entity Model', () => {
  let client: SubstackClient

  beforeEach(() => {
    client = new SubstackClient({
      apiKey: 'test-api-key',
      hostname: 'test.substack.com'
    })
  })

  describe('SubstackClient', () => {
    it('should create client instance', () => {
      expect(client).toBeInstanceOf(SubstackClient)
    })

    it('should handle invalid user ID', async () => {
      await expect(client.profileForId('invalid')).rejects.toThrow(
        'Invalid user ID - must be numeric'
      )
    })

    it('should handle invalid comment ID', async () => {
      await expect(client.commentForId('invalid')).rejects.toThrow(
        'Invalid comment ID - must be numeric'
      )
    })

    it('should create own profile', async () => {
      const ownProfile = await client.ownProfile()
      expect(ownProfile).toBeInstanceOf(OwnProfile)
      expect(ownProfile.name).toBe('Unknown User')
    })
  })

  describe('Entity Creation', () => {
    it('should create Profile entity', () => {
      const mockData = {
        id: 123,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg',
        profile_set_up_at: new Date().toISOString(),
        reader_installed_at: new Date().toISOString(),
        profile_disabled: false,
        publicationUsers: [],
        userLinks: [],
        subscriptions: [],
        subscriptionsTruncated: false,
        hasGuestPost: false,
        max_pub_tier: 0,
        hasActivity: false,
        hasLikes: false,
        lists: [],
        rough_num_free_subscribers_int: 0,
        rough_num_free_subscribers: '0',
        bestseller_badge_disabled: false,
        subscriberCountString: '0',
        subscriberCount: '0',
        subscriberCountNumber: 0,
        hasHiddenPublicationUsers: false,
        visibleSubscriptionsCount: 0,
        slug: 'testuser',
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'not_subscribed',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      }
      const httpClient = (client as unknown as { httpClient: SubstackHttpClient }).httpClient
      const profile = new Profile(mockData, httpClient)

      expect(profile).toBeInstanceOf(Profile)
      expect(profile.id).toBe(123)
      expect(profile.name).toBe('Test User')
      expect(profile.slug).toBe('testuser')
    })

    it('should create Post entity', () => {
      const mockData = {
        id: 456,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter' as const
      }
      const httpClient = (client as unknown as { httpClient: SubstackHttpClient }).httpClient
      const post = new Post(mockData, httpClient)

      expect(post).toBeInstanceOf(Post)
      expect(post.id).toBe(456)
      expect(post.title).toBe('Test Post')
    })

    it('should create Comment entity', () => {
      const mockData = {
        id: 789,
        body: 'Test comment',
        created_at: '2023-01-01T00:00:00Z',
        parent_post_id: 456,
        author: { id: 123, name: 'Test User' }
      }
      const httpClient = (client as unknown as { httpClient: SubstackHttpClient }).httpClient
      const comment = new Comment(mockData, httpClient)

      expect(comment).toBeInstanceOf(Comment)
      expect(comment.id).toBe(789)
      expect(comment.body).toBe('Test comment')
    })
  })
})
