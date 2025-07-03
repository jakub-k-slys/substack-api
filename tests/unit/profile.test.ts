import { Profile } from '../../src/entities/profile'
import { Post } from '../../src/entities'
import type { SubstackHttpClient } from '../../src/http-client'

describe('Profile Entity', () => {
  let mockHttpClient: jest.Mocked<SubstackHttpClient>
  let profile: Profile

  beforeEach(() => {
    mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    } as unknown as jest.Mocked<SubstackHttpClient>

    const mockProfileData = {
      id: 123,
      handle: 'testuser',
      name: 'Test User',
      photo_url: 'https://example.com/photo.jpg',
      bio: 'Test bio',
      profile_set_up_at: '2023-01-01T00:00:00Z',
      reader_installed_at: '2023-01-01T00:00:00Z',
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

    profile = new Profile(mockProfileData, mockHttpClient)
  })

  describe('posts()', () => {
    it('should iterate through profile posts', async () => {
      const mockResponse = {
        posts: [
          {
            id: 1,
            title: 'Post 1',
            slug: 'post-1',
            post_date: '2023-01-01T00:00:00Z',
            canonical_url: 'https://example.com/post1',
            type: 'newsletter' as const
          },
          {
            id: 2,
            title: 'Post 2',
            slug: 'post-2',
            post_date: '2023-01-02T00:00:00Z',
            canonical_url: 'https://example.com/post2',
            type: 'newsletter' as const
          }
        ]
      }
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const posts = []
      for await (const post of profile.posts({ limit: 2 })) {
        posts.push(post)
      }

      expect(posts).toHaveLength(2)
      expect(posts[0]).toBeInstanceOf(Post)
      expect(posts[0].title).toBe('Post 1')
      expect(posts[1].title).toBe('Post 2')
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/profile/posts?profile_user_id=123&limit=25&offset=0'
      )
    })

    it('should handle limit parameter', async () => {
      const mockResponse = {
        posts: [
          {
            id: 1,
            title: 'Post 1',
            slug: 'post-1',
            post_date: '2023-01-01T00:00:00Z',
            canonical_url: 'https://example.com/post1',
            type: 'newsletter' as const
          },
          {
            id: 2,
            title: 'Post 2',
            slug: 'post-2',
            post_date: '2023-01-02T00:00:00Z',
            canonical_url: 'https://example.com/post2',
            type: 'newsletter' as const
          }
        ]
      }
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const posts = []
      for await (const post of profile.posts({ limit: 1 })) {
        posts.push(post)
      }

      expect(posts).toHaveLength(1)
      expect(posts[0].title).toBe('Post 1')
    })

    it('should handle empty posts response', async () => {
      const mockResponse = { posts: [] }
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(0)
    })

    it('should handle missing posts property', async () => {
      const mockResponse = {}
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(0)
    })

    it('should handle API error gracefully', async () => {
      mockHttpClient.get.mockRejectedValue(new Error('API error'))

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(0)
    })

    it('should use perPage configuration from client', async () => {
      // Mock a different perPage value
      mockHttpClient.getPerPage.mockReturnValue(10)

      const mockResponse = {
        posts: [
          {
            id: 1,
            title: 'Post 1',
            slug: 'post-1',
            post_date: '2023-01-01T00:00:00Z',
            canonical_url: 'https://example.com/post1',
            type: 'newsletter' as const
          }
        ]
      }
      mockHttpClient.get.mockResolvedValue(mockResponse)

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(1)
      expect(mockHttpClient.get).toHaveBeenCalledWith(
        '/api/v1/profile/posts?profile_user_id=123&limit=10&offset=0'
      )
    })

    it('should implement pagination with offset for multiple pages', async () => {
      // Reset the mock to avoid interference from other tests
      mockHttpClient.get.mockReset()
      mockHttpClient.getPerPage.mockReturnValue(2) // Set perPage to 2 for this test

      // Mock first page response (full page)
      const firstPageResponse = {
        posts: [
          { id: 1, title: 'Post 1', slug: 'post-1', created_at: '2023-01-01', publication_id: 1 },
          { id: 2, title: 'Post 2', slug: 'post-2', created_at: '2023-01-02', publication_id: 1 }
        ]
      }

      // Mock second page response (full page)
      const secondPageResponse = {
        posts: [
          { id: 3, title: 'Post 3', slug: 'post-3', created_at: '2023-01-03', publication_id: 1 },
          { id: 4, title: 'Post 4', slug: 'post-4', created_at: '2023-01-04', publication_id: 1 }
        ]
      }

      // Mock third page response (partial page - should trigger end of pagination)
      const thirdPageResponse = {
        posts: [
          { id: 5, title: 'Post 5', slug: 'post-5', created_at: '2023-01-05', publication_id: 1 }
        ]
      }

      // Setup sequential responses for pagination
      mockHttpClient.get
        .mockResolvedValueOnce(firstPageResponse) // offset=0, returns 2 posts (full page)
        .mockResolvedValueOnce(secondPageResponse) // offset=2, returns 2 posts (full page)
        .mockResolvedValueOnce(thirdPageResponse) // offset=4, returns 1 post (partial page - end)

      const posts = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }

      expect(posts).toHaveLength(5)
      expect(posts[0].title).toBe('Post 1')
      expect(posts[1].title).toBe('Post 2')
      expect(posts[2].title).toBe('Post 3')
      expect(posts[3].title).toBe('Post 4')
      expect(posts[4].title).toBe('Post 5')

      // Verify all three API calls were made with correct offsets
      expect(mockHttpClient.get).toHaveBeenCalledTimes(3)
      expect(mockHttpClient.get).toHaveBeenNthCalledWith(
        1,
        '/api/v1/profile/posts?profile_user_id=123&limit=2&offset=0'
      )
      expect(mockHttpClient.get).toHaveBeenNthCalledWith(
        2,
        '/api/v1/profile/posts?profile_user_id=123&limit=2&offset=2'
      )
      expect(mockHttpClient.get).toHaveBeenNthCalledWith(
        3,
        '/api/v1/profile/posts?profile_user_id=123&limit=2&offset=4'
      )
    })
  })
})
