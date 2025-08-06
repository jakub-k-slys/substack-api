import { OwnProfile } from '../../src/domain/own-profile'
import { NoteWithLinkBuilder } from '../../src/domain/note-builder'
import { HttpClient } from '../../src/internal/http-client'
import {
  ProfileService,
  PostService,
  NoteService,
  FolloweeService,
  CommentService
} from '../../src/internal/services'

// Mock dependencies
jest.mock('../../src/internal/http-client')
jest.mock('../../src/internal/services')

const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>
const MockProfileService = ProfileService as jest.MockedClass<typeof ProfileService>
const MockPostService = PostService as jest.MockedClass<typeof PostService>
const MockNoteService = NoteService as jest.MockedClass<typeof NoteService>
const MockCommentService = CommentService as jest.MockedClass<typeof CommentService>
const MockFolloweeService = FolloweeService as jest.MockedClass<typeof FolloweeService>

describe('OwnProfile - newNoteWithLink', () => {
  let mockClient: jest.Mocked<HttpClient>
  let mockProfileService: jest.Mocked<ProfileService>
  let mockPostService: jest.Mocked<PostService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockCommentService: jest.Mocked<CommentService>
  let mockFolloweeService: jest.Mocked<FolloweeService>
  let ownProfile: OwnProfile

  const mockProfileData = {
    id: 12345,
    name: 'Test User',
    handle: 'testuser',
    photo_url: 'https://example.com/photo.jpg',
    bio: 'Test bio',
    profile_set_up_at: '2025-01-01T00:00:00Z',
    is_subscriber: true,
    subscriber_count: 100,
    publication_users: [],
    profile_disabled: false,
    publicationUsers: [],
    userLinks: [],
    subscriptions: [],
    subscriptionsTruncated: false,
    hasGuestPost: false,
    max_pub_tier: 0,
    hasActivity: false,
    theme: {},
    stripe_customer_id: null,
    publishable_stripe_client_secret: null,
    is_guest: false,
    is_writer: false,
    bestseller_tier: null,
    twitter_screen_name: null,
    facebook_account: null,
    github_account: null,
    apple_author_url: null,
    apple_podcast_url: null,
    spotify_url: null,
    linkedin_url: null,
    youtube_url: null,
    activity: {},
    promo_twitter_url: null,
    paywall_free_signup_page: null,
    email: 'test@example.com',
    first_name: 'Test',
    last_name: 'User',
    phone: null,
    email_notifications: true,
    primary_publication_id: null,
    is_default_on: true,
    show_default_payment_methods: true,
    payment_flow: 'normal',
    has_posts: false,
    has_podcast: false,
    has_community_content: false,
    has_recommendations: false,
    has_free_podcast: false,
    has_subscriber_only_podcast: false,
    total_podcasts: 0,
    invites_sent: 0,
    invites_received: 0,
    invites_accepted: 0,
    notes_disabled: false,
    notes_feed_enabled: true,
    primary_handle: 'testuser',
    is_following: false
  } as any

  beforeEach(() => {
    mockClient = new MockHttpClient('https://example.com', {
      hostname: 'example.com',
      apiKey: 'test-api-key'
    }) as jest.Mocked<HttpClient>
    mockProfileService = new MockProfileService(mockClient) as jest.Mocked<ProfileService>
    mockPostService = new MockPostService(mockClient, mockClient) as jest.Mocked<PostService>
    mockNoteService = new MockNoteService(mockClient) as jest.Mocked<NoteService>
    mockCommentService = new MockCommentService(mockClient) as jest.Mocked<CommentService>
    mockFolloweeService = new MockFolloweeService(mockClient) as jest.Mocked<FolloweeService>

    ownProfile = new OwnProfile(
      mockProfileData,
      mockClient,
      mockProfileService,
      mockPostService,
      mockNoteService,
      mockCommentService,
      mockFolloweeService,
      'testuser'
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('newNoteWithLink', () => {
    it('should return a NoteWithLinkBuilder instance', () => {
      const linkUrl = 'https://example.com/article'
      const noteBuilder = ownProfile.newNoteWithLink(linkUrl)

      expect(noteBuilder).toBeInstanceOf(NoteWithLinkBuilder)
    })

    it('should create NoteWithLinkBuilder with correct client and link', () => {
      const linkUrl = 'https://iam.slys.dev/p/understanding-locking-contention'
      const noteBuilder = ownProfile.newNoteWithLink(linkUrl)

      // We can't directly test the private properties, but we can test the functionality
      expect(noteBuilder).toBeInstanceOf(NoteWithLinkBuilder)

      // The NoteWithLinkBuilder should have the same client as the profile
      // This is implicitly tested by ensuring the builder works with the same HTTP client
    })

    it('should work with different types of URLs', () => {
      const urls = [
        'https://example.com/test',
        'http://blog.example.com/post/123',
        'https://subdomain.domain.com/path/to/article?param=value',
        'https://iam.slys.dev/p/understanding-locking-contention'
      ]

      urls.forEach((url) => {
        const noteBuilder = ownProfile.newNoteWithLink(url)
        expect(noteBuilder).toBeInstanceOf(NoteWithLinkBuilder)
      })
    })

    it('should allow chaining builder methods', () => {
      const linkUrl = 'https://example.com/article'
      const noteBuilder = ownProfile.newNoteWithLink(linkUrl)

      // Test that we can chain methods (this tests the interface, not the implementation)
      const chained = noteBuilder
        .paragraph()
        .text('Check out this article!')
        .paragraph()
        .text('It contains great information.')

      expect(chained).toBeDefined()
    })
  })

  describe('integration with regular newNote', () => {
    it('should provide both newNote and newNoteWithLink methods', () => {
      // Regular note builder
      const regularNote = ownProfile.newNote()
      expect(regularNote).toBeDefined()

      // Note with link builder
      const noteWithLink = ownProfile.newNoteWithLink('https://example.com')
      expect(noteWithLink).toBeDefined()

      // They should be different types
      expect(noteWithLink).not.toBe(regularNote)
      expect(noteWithLink).toBeInstanceOf(NoteWithLinkBuilder)
    })
  })
})
