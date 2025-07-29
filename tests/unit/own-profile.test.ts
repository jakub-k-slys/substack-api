import { OwnProfile } from '../../src/domain/own-profile'
import { Note } from '../../src/domain/note'
import { Profile } from '../../src/domain/profile'
import { NoteBuilder } from '../../src/domain/note-builder'
import {
  ProfileService,
  PostService,
  NoteService,
  CommentService,
  FolloweeService
} from '../../src/internal/services'
import type { SubstackFullProfile } from '../../src/internal'
import type { HttpClient } from '../../src/internal/http-client'

describe('OwnProfile Entity', () => {
  let mockProfileData: SubstackFullProfile
  let mockProfileService: jest.Mocked<ProfileService>
  let mockPostService: jest.Mocked<PostService>
  let mockCommentService: jest.Mocked<CommentService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockFolloweeService: jest.Mocked<FolloweeService>
  let ownProfile: OwnProfile

  beforeEach(() => {
    mockProfileData = {
      id: 123,
      name: 'Test User',
      handle: 'testuser',
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
      max_pub_tier: 1,
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
      primaryPublicationSubscriptionState: 'none',
      isSubscribed: false,
      isFollowing: false,
      followsViewer: false,
      can_dm: false,
      dm_upgrade_options: []
    } as SubstackFullProfile

    // Mock the legacy client
    const mockClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    } as unknown as jest.Mocked<HttpClient>

    mockProfileService = {
      getOwnProfile: jest.fn(),
      getProfileById: jest.fn(),
      getProfileBySlug: jest.fn(),
      getPostsForProfile: jest.fn(),
      getNotesForProfile: jest.fn()
    } as unknown as jest.Mocked<ProfileService>

    mockPostService = {
      getPostById: jest.fn()
    } as unknown as jest.Mocked<PostService>

    mockCommentService = {
      getCommentsForPost: jest.fn(),
      getCommentById: jest.fn()
    } as unknown as jest.Mocked<CommentService>

    mockNoteService = {
      getNoteById: jest.fn(),
      getNotesForLoggedUser: jest.fn(),
      getNotesForProfile: jest.fn()
    } as unknown as jest.Mocked<NoteService>

    mockFolloweeService = {
      getFollowees: jest.fn()
    } as unknown as jest.Mocked<FolloweeService>

    ownProfile = new OwnProfile(
      mockProfileData,
      mockClient,
      mockProfileService,
      mockPostService,
      mockNoteService,
      mockCommentService,
      mockFolloweeService
    )
  })

  it('should inherit from Profile', () => {
    expect(ownProfile.id).toBe(123)
    expect(ownProfile.name).toBe('Test User')
    expect(ownProfile.slug).toBe('testuser')
  })

  it('should have additional write methods', () => {
    expect(typeof ownProfile.newNote).toBe('function')
    expect(typeof ownProfile.followees).toBe('function')
    expect(typeof ownProfile.notes).toBe('function')
  })

  it('should create a note builder without initial text', () => {
    const builder = ownProfile.newNote()
    expect(builder).toBeInstanceOf(NoteBuilder)
  })

  it('should iterate through followees using correct endpoint chain', async () => {
    // Mock the response from /api/v1/feed/following (returns array of user IDs)
    const mockFollowingIds = [1, 2]

    // Mock the responses from /api/v1/user/{id}/profile
    const mockProfile1 = {
      id: 1,
      handle: 'user1',
      name: 'User One',
      photo_url: 'https://example.com/user1.jpg',
      bio: 'Bio for User One',
      profile_set_up_at: '2023-01-01T00:00:00Z',
      reader_installed_at: '2023-01-01T00:00:00Z',
      profile_disabled: false,
      publicationUsers: [],
      userLinks: [],
      subscriptions: [],
      subscriptionsTruncated: false,
      hasGuestPost: false,
      max_pub_tier: 1,
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
      slug: 'user1',
      primaryPublicationIsPledged: false,
      primaryPublicationSubscriptionState: 'none',
      isSubscribed: false,
      isFollowing: false,
      followsViewer: false,
      can_dm: false,
      dm_upgrade_options: []
    } as SubstackFullProfile

    const mockProfile2 = {
      id: 2,
      handle: 'user2',
      name: 'User Two',
      photo_url: 'https://example.com/user2.jpg',
      bio: 'Bio for User Two',
      profile_set_up_at: '2023-01-01T00:00:00Z',
      reader_installed_at: '2023-01-01T00:00:00Z',
      profile_disabled: false,
      publicationUsers: [],
      userLinks: [],
      subscriptions: [],
      subscriptionsTruncated: false,
      hasGuestPost: false,
      max_pub_tier: 1,
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
      slug: 'user2',
      primaryPublicationIsPledged: false,
      primaryPublicationSubscriptionState: 'none',
      isSubscribed: false,
      isFollowing: false,
      followsViewer: false,
      can_dm: false,
      dm_upgrade_options: []
    } as SubstackFullProfile

    // Setup service mocks
    mockFolloweeService.getFollowees.mockResolvedValue(mockFollowingIds)
    mockProfileService.getProfileById
      .mockResolvedValueOnce(mockProfile1)
      .mockResolvedValueOnce(mockProfile2)

    const followees = []
    for await (const profile of ownProfile.followees()) {
      followees.push(profile)
    }

    expect(followees).toHaveLength(2)
    expect(followees[0]).toBeInstanceOf(Profile)
    expect(followees[0].name).toBe('User One')
    expect(followees[1].name).toBe('User Two')

    // Verify correct service calls were made
    expect(mockFolloweeService.getFollowees).toHaveBeenCalledTimes(1)
    expect(mockProfileService.getProfileById).toHaveBeenCalledWith(1)
    expect(mockProfileService.getProfileById).toHaveBeenCalledWith(2)
    expect(mockProfileService.getProfileById).toHaveBeenCalledTimes(2)
  })

  it('should handle empty followees response', async () => {
    mockFolloweeService.getFollowees.mockResolvedValue([]) // Empty array of user IDs

    const followees = []
    for await (const profile of ownProfile.followees()) {
      followees.push(profile)
    }

    expect(followees).toHaveLength(0)
    expect(mockFolloweeService.getFollowees).toHaveBeenCalledTimes(1)
    expect(mockProfileService.getProfileById).not.toHaveBeenCalled() // No profile calls should be made
  })

  it('should handle profile fetch errors gracefully', async () => {
    // Mock the FolloweeService to return user IDs
    const mockFollowingIds = [1, 2, 3]
    mockFolloweeService.getFollowees.mockResolvedValue(mockFollowingIds)

    // Mock ProfileService where one profile fetch fails
    mockProfileService.getProfileById.mockImplementation((userId: number) => {
      if (userId === 1) {
        return Promise.resolve({
          id: 1,
          handle: 'user1',
          name: 'User One',
          photo_url: 'https://example.com/user1.jpg',
          bio: 'Bio for User One',
          profile_set_up_at: '2023-01-01T00:00:00Z',
          reader_installed_at: '2023-01-01T00:00:00Z',
          profile_disabled: false,
          publicationUsers: [],
          userLinks: [],
          subscriptions: [],
          subscriptionsTruncated: false,
          hasGuestPost: false,
          max_pub_tier: 1,
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
          slug: 'user1',
          primaryPublicationIsPledged: false,
          primaryPublicationSubscriptionState: 'none',
          isSubscribed: false,
          isFollowing: false,
          followsViewer: false,
          can_dm: false,
          dm_upgrade_options: []
        } as SubstackFullProfile)
      } else if (userId === 2) {
        // This one fails (e.g., deleted account)
        return Promise.reject(new Error('Profile not found'))
      } else if (userId === 3) {
        return Promise.resolve({
          id: 3,
          handle: 'user3',
          name: 'User Three',
          photo_url: 'https://example.com/user3.jpg',
          bio: 'Bio for User Three',
          profile_set_up_at: '2023-01-01T00:00:00Z',
          reader_installed_at: '2023-01-01T00:00:00Z',
          profile_disabled: false,
          publicationUsers: [],
          userLinks: [],
          subscriptions: [],
          subscriptionsTruncated: false,
          hasGuestPost: false,
          max_pub_tier: 1,
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
          slug: 'user3',
          primaryPublicationIsPledged: false,
          primaryPublicationSubscriptionState: 'none',
          isSubscribed: false,
          isFollowing: false,
          followsViewer: false,
          can_dm: false,
          dm_upgrade_options: []
        } as SubstackFullProfile)
      }
      return Promise.reject(new Error(`Unexpected userId: ${userId}`))
    })

    const followees = []
    for await (const profile of ownProfile.followees()) {
      followees.push(profile)
    }

    // Should get 2 profiles (skipping the failed one)
    expect(followees).toHaveLength(2)
    expect(followees[0].name).toBe('User One')
    expect(followees[1].name).toBe('User Three')

    // Verify service calls were made
    expect(mockFolloweeService.getFollowees).toHaveBeenCalledTimes(1)
    expect(mockProfileService.getProfileById).toHaveBeenCalledWith(1)
    expect(mockProfileService.getProfileById).toHaveBeenCalledWith(2)
    expect(mockProfileService.getProfileById).toHaveBeenCalledWith(3)
    expect(mockProfileService.getProfileById).toHaveBeenCalledTimes(3)
  })

  it('should use slug resolver for followees when available', async () => {
    // Create a mock slug resolver
    const mockSlugResolver = jest.fn()

    // Setup mock slug resolver to return different slugs than the handle
    mockSlugResolver.mockImplementation((userId: number, fallbackHandle?: string) => {
      if (userId === 1) return Promise.resolve('resolved-slug-1')
      if (userId === 2) return Promise.resolve('resolved-slug-2')
      return Promise.resolve(fallbackHandle)
    })

    // Create fresh service mocks for this test
    const localFolloweeService = {
      getFollowees: jest.fn()
    } as unknown as jest.Mocked<FolloweeService>

    const localProfileService = {
      getOwnProfile: jest.fn(),
      getProfileById: jest.fn(),
      getProfileBySlug: jest.fn()
    } as unknown as jest.Mocked<ProfileService>

    // Create OwnProfile with the slug resolver
    const ownProfileWithResolver = new OwnProfile(
      mockProfileData,
      {
        get: jest.fn(),
        post: jest.fn(),
        request: jest.fn(),
        getPerPage: jest.fn().mockReturnValue(25)
      } as unknown as jest.Mocked<HttpClient>,
      localProfileService,
      mockPostService,
      mockNoteService,
      mockCommentService,
      localFolloweeService,
      'resolved-own-slug',
      mockSlugResolver
    )

    // Mock the services
    const mockFollowingIds = [1, 2]
    localFolloweeService.getFollowees.mockResolvedValue(mockFollowingIds)

    localProfileService.getProfileById.mockImplementation((userId: number) => {
      if (userId === 1) {
        return Promise.resolve({
          id: 1,
          handle: 'user1',
          name: 'User One',
          photo_url: 'https://example.com/user1.jpg'
        } as SubstackFullProfile)
      } else if (userId === 2) {
        return Promise.resolve({
          id: 2,
          handle: 'user2',
          name: 'User Two',
          photo_url: 'https://example.com/user2.jpg'
        } as SubstackFullProfile)
      }
      return Promise.reject(new Error(`Unexpected userId: ${userId}`))
    })

    const followees = []
    for await (const profile of ownProfileWithResolver.followees()) {
      followees.push(profile)
    }

    expect(followees).toHaveLength(2)

    // Check that the slug resolver was called for each user
    expect(mockSlugResolver).toHaveBeenCalledWith(1, 'user1')
    expect(mockSlugResolver).toHaveBeenCalledWith(2, 'user2')
    expect(mockSlugResolver).toHaveBeenCalledTimes(2)

    // Check that the resolved slugs are used
    expect(followees[0].slug).toBe('resolved-slug-1')
    expect(followees[1].slug).toBe('resolved-slug-2')
  })

  describe('notes()', () => {
    it('should iterate through own profile notes', async () => {
      const mockNotes = [
        {
          entity_key: '1',
          type: 'note',
          context: {
            type: 'feed',
            timestamp: '2023-01-01T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                bio: 'Test bio',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 1
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 1,
            body: 'Note 1',
            user_id: 123,
            type: 'feed',
            date: '2023-01-01T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 0,
            reactions: {},
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: '1',
            item_entity_key: '1',
            item_type: 'note',
            item_content_user_id: 123,
            item_context_type: 'feed',
            item_context_type_bucket: 'note',
            item_context_timestamp: '2023-01-01T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 1,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        },
        {
          entity_key: '2',
          type: 'note',
          context: {
            type: 'feed',
            timestamp: '2023-01-02T00:00:00Z',
            users: [
              {
                id: 123,
                name: 'Test User',
                handle: 'testuser',
                photo_url: 'https://example.com/photo.jpg',
                bio: 'Test bio',
                profile_set_up_at: '2023-01-01T00:00:00Z',
                reader_installed_at: '2023-01-01T00:00:00Z'
              }
            ],
            isFresh: false,
            page_rank: 1
          },
          comment: {
            name: 'Test User',
            handle: 'testuser',
            photo_url: 'https://example.com/photo.jpg',
            id: 2,
            body: 'Note 2',
            user_id: 123,
            type: 'feed',
            date: '2023-01-02T00:00:00Z',
            ancestor_path: '',
            reply_minimum_role: 'everyone',
            reaction_count: 0,
            reactions: {},
            restacks: 0,
            restacked: false,
            children_count: 0,
            attachments: []
          },
          parentComments: [],
          canReply: true,
          isMuted: false,
          trackingParameters: {
            item_primary_entity_key: '2',
            item_entity_key: '2',
            item_type: 'note',
            item_content_user_id: 123,
            item_context_type: 'feed',
            item_context_type_bucket: 'note',
            item_context_timestamp: '2023-01-02T00:00:00Z',
            item_context_user_id: 123,
            item_context_user_ids: [123],
            item_can_reply: true,
            item_is_fresh: false,
            item_last_impression_at: null,
            item_page: null,
            item_page_rank: 1,
            impression_id: 'test-impression',
            followed_user_count: 0,
            subscribed_publication_count: 0,
            is_following: false,
            is_explicitly_subscribed: false
          }
        }
      ]

      mockNoteService.getNotesForLoggedUser.mockResolvedValue({
        notes: mockNotes,
        nextCursor: undefined
      })

      const notes = []
      for await (const note of ownProfile.notes({ limit: 2 })) {
        notes.push(note)
      }

      expect(notes).toHaveLength(2)
      expect(notes[0]).toBeInstanceOf(Note)
      expect(notes[0].body).toBe('Note 1')
      expect(notes[1].body).toBe('Note 2')
      expect(mockNoteService.getNotesForLoggedUser).toHaveBeenCalledTimes(1)
    })

    it('should handle limit parameter for notes', async () => {
      const mockResponse = {
        items: [
          {
            entity_key: '1',
            type: 'note',
            context: {
              type: 'feed',
              timestamp: '2023-01-01T00:00:00Z',
              users: [
                {
                  id: 123,
                  name: 'Test User',
                  handle: 'testuser',
                  photo_url: 'https://example.com/photo.jpg',
                  bio: 'Test bio',
                  profile_set_up_at: '2023-01-01T00:00:00Z',
                  reader_installed_at: '2023-01-01T00:00:00Z'
                }
              ],
              isFresh: false,
              page_rank: 1
            },
            comment: {
              name: 'Test User',
              handle: 'testuser',
              photo_url: 'https://example.com/photo.jpg',
              id: 1,
              body: 'Note 1',
              user_id: 123,
              type: 'feed',
              date: '2023-01-01T00:00:00Z',
              ancestor_path: '',
              reply_minimum_role: 'everyone',
              reaction_count: 0,
              reactions: {},
              restacks: 0,
              restacked: false,
              children_count: 0,
              attachments: []
            },
            parentComments: [],
            canReply: true,
            isMuted: false,
            trackingParameters: {
              item_primary_entity_key: '1',
              item_entity_key: '1',
              item_type: 'note',
              item_content_user_id: 123,
              item_context_type: 'feed',
              item_context_type_bucket: 'note',
              item_context_timestamp: '2023-01-01T00:00:00Z',
              item_context_user_id: 123,
              item_context_user_ids: [123],
              item_can_reply: true,
              item_is_fresh: false,
              item_last_impression_at: null,
              item_page: null,
              item_page_rank: 1,
              impression_id: 'test-impression',
              followed_user_count: 0,
              subscribed_publication_count: 0,
              is_following: false,
              is_explicitly_subscribed: false
            }
          },
          {
            entity_key: '2',
            type: 'note',
            context: {
              type: 'feed',
              timestamp: '2023-01-02T00:00:00Z',
              users: [
                {
                  id: 123,
                  name: 'Test User',
                  handle: 'testuser',
                  photo_url: 'https://example.com/photo.jpg',
                  bio: 'Test bio',
                  profile_set_up_at: '2023-01-01T00:00:00Z',
                  reader_installed_at: '2023-01-01T00:00:00Z'
                }
              ],
              isFresh: false,
              page_rank: 1
            },
            comment: {
              name: 'Test User',
              handle: 'testuser',
              photo_url: 'https://example.com/photo.jpg',
              id: 2,
              body: 'Note 2',
              user_id: 123,
              type: 'feed',
              date: '2023-01-02T00:00:00Z',
              ancestor_path: '',
              reply_minimum_role: 'everyone',
              reaction_count: 0,
              reactions: {},
              restacks: 0,
              restacked: false,
              children_count: 0,
              attachments: []
            },
            parentComments: [],
            canReply: true,
            isMuted: false,
            trackingParameters: {
              item_primary_entity_key: '2',
              item_entity_key: '2',
              item_type: 'note',
              item_content_user_id: 123,
              item_context_type: 'feed',
              item_context_type_bucket: 'note',
              item_context_timestamp: '2023-01-02T00:00:00Z',
              item_context_user_id: 123,
              item_context_user_ids: [123],
              item_can_reply: true,
              item_is_fresh: false,
              item_last_impression_at: null,
              item_page: null,
              item_page_rank: 1,
              impression_id: 'test-impression',
              followed_user_count: 0,
              subscribed_publication_count: 0,
              is_following: false,
              is_explicitly_subscribed: false
            }
          }
        ]
      }

      // Mock the NoteService instead of the HTTP client
      mockNoteService.getNotesForLoggedUser.mockResolvedValue({
        notes: mockResponse.items,
        nextCursor: undefined
      })

      const notes = []
      for await (const note of ownProfile.notes({ limit: 1 })) {
        notes.push(note)
      }

      expect(notes).toHaveLength(1)
      expect(notes[0].body).toBe('Note 1')
    })

    it('should handle empty notes response', async () => {
      const mockResponse = { notes: [] }
      const mockClient = ownProfile['client'] as jest.Mocked<HttpClient>
      mockClient.get.mockResolvedValue(mockResponse)

      const notes = []
      for await (const note of ownProfile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(0)
    })

    it('should handle missing notes property', async () => {
      const mockResponse = {}
      const mockClient = ownProfile['client'] as jest.Mocked<HttpClient>
      mockClient.get.mockResolvedValue(mockResponse)

      const notes = []
      for await (const note of ownProfile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(0)
    })

    it('should handle API error gracefully for notes', async () => {
      const mockClient = ownProfile['client'] as jest.Mocked<HttpClient>
      mockClient.get.mockRejectedValue(new Error('API error'))

      const notes = []
      for await (const note of ownProfile.notes()) {
        notes.push(note)
      }

      expect(notes).toHaveLength(0)
    })
  })
})
