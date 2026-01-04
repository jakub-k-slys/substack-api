import { SubstackClient } from '@substack-api/substack-client'
import { Profile, FullPost, Note, Comment, OwnProfile } from '@substack-api/domain'
import { HttpClient } from '@substack-api/internal/http-client'
import {
  PostService,
  NoteService,
  ProfileService,
  CommentService,
  FollowingService,
  ConnectivityService
} from '@substack-api/internal/services'
import type { SubstackFullProfile } from '@substack-api/internal'

// Mock the http client and services
jest.mock('@substack-api/internal/http-client')
jest.mock('@substack-api/internal/services')

// Mock the global fetch function
global.fetch = jest.fn()

describe('SubstackClient', () => {
  let client: SubstackClient
  let mockPublicationClient: jest.Mocked<HttpClient>
  let mockSubstackClient: jest.Mocked<HttpClient>
  let mockPostService: jest.Mocked<PostService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockProfileService: jest.Mocked<ProfileService>
  let mockCommentService: jest.Mocked<CommentService>
  let mockFollowingService: jest.Mocked<FollowingService>
  let mockConnectivityService: jest.Mocked<ConnectivityService>

  beforeEach(() => {
    jest.clearAllMocks()
    mockPublicationClient = new HttpClient('https://test.com', 'test') as jest.Mocked<HttpClient>
    mockPublicationClient.get = jest.fn()
    mockPublicationClient.post = jest.fn()

    mockSubstackClient = new HttpClient('https://substack.com', 'test') as jest.Mocked<HttpClient>
    mockSubstackClient.get = jest.fn()
    mockSubstackClient.post = jest.fn()

    mockPostService = new PostService(mockSubstackClient) as jest.Mocked<PostService>
    mockPostService.getPostById = jest.fn()

    mockNoteService = new NoteService(mockPublicationClient) as jest.Mocked<NoteService>
    mockNoteService.getNoteById = jest.fn()

    mockProfileService = new ProfileService(mockSubstackClient) as jest.Mocked<ProfileService>
    mockProfileService.getOwnProfile = jest.fn()
    mockProfileService.getProfileById = jest.fn()
    mockProfileService.getProfileBySlug = jest.fn()

    mockCommentService = new CommentService(mockPublicationClient) as jest.Mocked<CommentService>
    mockCommentService.getCommentById = jest.fn()
    mockCommentService.getCommentsForPost = jest.fn()

    mockFollowingService = new FollowingService(
      mockPublicationClient,
      mockSubstackClient
    ) as jest.Mocked<FollowingService>
    mockFollowingService.getFollowing = jest.fn()

    mockConnectivityService = new ConnectivityService(
      mockSubstackClient
    ) as jest.Mocked<ConnectivityService>
    mockConnectivityService.isConnected = jest.fn()

    client = new SubstackClient({
      token: 'test-api-key',
      publicationUrl: 'test.substack.com'
    })
    // Replace the internal http clients and services with our mocks
    ;(client as unknown as { publicationClient: HttpClient }).publicationClient =
      mockPublicationClient
    ;(client as unknown as { substackClient: HttpClient }).substackClient = mockSubstackClient
    ;(client as unknown as { postService: PostService }).postService = mockPostService
    ;(client as unknown as { noteService: NoteService }).noteService = mockNoteService
    ;(client as unknown as { profileService: ProfileService }).profileService = mockProfileService
    ;(client as unknown as { commentService: CommentService }).commentService = mockCommentService
    ;(client as unknown as { followingService: FollowingService }).followingService =
      mockFollowingService
    ;(client as unknown as { connectivityService: ConnectivityService }).connectivityService =
      mockConnectivityService
  })

  describe('testConnectivity', () => {
    it('should return true when API is accessible', async () => {
      mockConnectivityService.isConnected.mockResolvedValue(true)
      const result = await client.testConnectivity()
      expect(result).toBe(true)
      expect(mockConnectivityService.isConnected).toHaveBeenCalled()
    })

    it('should return false when API is not accessible', async () => {
      mockConnectivityService.isConnected.mockResolvedValue(false)
      const result = await client.testConnectivity()
      expect(result).toBe(false)
      expect(mockConnectivityService.isConnected).toHaveBeenCalled()
    })
  })

  describe('ownProfile', () => {
    it('should get own profile when authenticated', async () => {
      const mockProfile = {
        id: 123,
        name: 'Test User',
        handle: 'testuser',
        photo_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getOwnProfile.mockResolvedValueOnce(mockProfile)

      const ownProfile = await client.ownProfile()
      expect(ownProfile).toBeInstanceOf(OwnProfile)
      expect(ownProfile.id).toBe(123)
      expect(ownProfile.name).toBe('Test User')
      expect(mockProfileService.getOwnProfile).toHaveBeenCalled()
    })

    it('should throw error when authentication fails', async () => {
      mockProfileService.getOwnProfile.mockRejectedValue(new Error('Unauthorized'))

      await expect(client.ownProfile()).rejects.toThrow('Failed to get own profile: Unauthorized')
    })
  })

  describe('profileForId', () => {
    it('should get profile by numeric ID', async () => {
      const mockProfile: Partial<SubstackFullProfile> = {
        id: 123,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getProfileById.mockResolvedValue(mockProfile as any)

      const profile = await client.profileForId(123)
      expect(profile).toBeInstanceOf(Profile)
      expect(mockProfileService.getProfileById).toHaveBeenCalledWith(123)
    })

    it('should handle API error for profileForId', async () => {
      mockProfileService.getProfileById.mockRejectedValue(new Error('Not found'))

      await expect(client.profileForId(999)).rejects.toThrow(
        'Profile with ID 999 not found: Not found'
      )
    })

    it('should accept large numeric IDs', async () => {
      const mockProfile: Partial<SubstackFullProfile> = {
        id: 9876543210,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getProfileById.mockResolvedValue(mockProfile as any)

      const profile = await client.profileForId(9876543210)
      expect(profile).toBeInstanceOf(Profile)
      expect(mockProfileService.getProfileById).toHaveBeenCalledWith(9876543210)
    })
  })

  describe('profileForSlug', () => {
    it('should get profile by slug', async () => {
      const mockProfile: Partial<SubstackFullProfile> = {
        id: 123,
        handle: 'testuser',
        name: 'Test User',
        photo_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getProfileBySlug.mockResolvedValue(mockProfile as any)

      const profile = await client.profileForSlug('testuser')
      expect(profile).toBeInstanceOf(Profile)
      expect(mockProfileService.getProfileBySlug).toHaveBeenCalledWith('testuser')
    })

    it('should handle empty slug', async () => {
      await expect(client.profileForSlug('')).rejects.toThrow('Profile slug cannot be empty')
      await expect(client.profileForSlug('   ')).rejects.toThrow('Profile slug cannot be empty')
    })

    it('should handle API error for profileForSlug', async () => {
      mockProfileService.getProfileBySlug.mockRejectedValue(new Error('Not found'))

      await expect(client.profileForSlug('nonexistent')).rejects.toThrow(
        // eslint-disable-next-line quotes
        "Profile with slug 'nonexistent' not found: Not found"
      )
    })
  })

  describe('postForId', () => {
    it('should get post by ID', async () => {
      const mockPost = {
        id: 456,
        title: 'Test Post',
        slug: 'test-slug',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/test-post',
        body_html: '<p>Test post body content</p>'
      }

      // Mock the PostService's getPostById method
      mockPostService.getPostById.mockResolvedValueOnce(mockPost)

      const post = await client.postForId(456)
      expect(post).toBeInstanceOf(FullPost)

      // Verify that PostService was called with the correct ID
      expect(mockPostService.getPostById).toHaveBeenCalledWith(456)
    })

    it('should handle API error for postForId', async () => {
      // Mock PostService to throw an HTTP error
      mockPostService.getPostById.mockRejectedValueOnce(new Error('HTTP 404: Not found'))

      await expect(client.postForId(999999999)).rejects.toThrow(
        'Post with ID 999999999 not found: HTTP 404: Not found'
      )
    })
  })

  describe('noteForId', () => {
    it('should get note by ID', async () => {
      const mockNoteData = {
        entity_key: '789',
        type: 'note',
        context: {
          type: 'feed',
          timestamp: '2023-01-01T00:00:00Z',
          users: [
            {
              id: 123,
              name: 'Test User',
              handle: '',
              photo_url: '',
              bio: ''
            }
          ],
          isFresh: false,
          page: null,
          page_rank: 1
        },
        comment: {
          id: 789,
          body: 'Test note',
          type: 'feed',
          date: '2023-01-01T00:00:00Z',
          user_id: 123,
          post_id: null,
          name: 'Test User',
          handle: '',
          photo_url: '',
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
          item_primary_entity_key: '789',
          item_entity_key: '789',
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
          impression_id: 'generated',
          followed_user_count: 0,
          subscribed_publication_count: 0,
          is_following: false,
          is_explicitly_subscribed: false
        }
      }
      mockNoteService.getNoteById.mockResolvedValue(mockNoteData)

      const note = await client.noteForId(789)
      expect(note).toBeInstanceOf(Note)
      expect(mockNoteService.getNoteById).toHaveBeenCalledWith(789)

      // Verify Note properties are correctly populated
      expect(note.id).toBe('789')
      expect(note.body).toBe('Test note')
      expect(note.author.id).toBe(123)
      expect(note.author.name).toBe('Test User')
    })

    it('should handle API error for noteForId', async () => {
      mockNoteService.getNoteById.mockRejectedValue(new Error('Not found'))

      await expect(client.noteForId(999)).rejects.toThrow('Note with ID 999 not found')
    })
  })

  describe('commentForId', () => {
    it('should get comment by ID', async () => {
      const mockCommentData = {
        id: 999,
        body: 'Test comment',
        created_at: '2023-01-01T00:00:00Z',
        parent_post_id: 456,
        author_id: 123,
        author_name: 'Test User'
      }
      mockCommentService.getCommentById.mockResolvedValue(mockCommentData)

      const comment = await client.commentForId(999)
      expect(comment).toBeInstanceOf(Comment)
      expect(mockCommentService.getCommentById).toHaveBeenCalledWith(999)
    })
  })

  describe('URL normalization', () => {
    beforeEach(() => {
      jest.clearAllMocks()
    })

    it('should prepend https:// to publicationUrl without protocol', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithoutProtocol = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'iam.slys.dev'
      })

      // Verify HttpClient was constructed with normalized URLs
      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect(httpClientCalls[0][0]).toBe('https://iam.slys.dev/api/v1') // publicationClient
      expect(httpClientCalls[1][0]).toBe('https://substack.com/api/v1') // substackClient (default)
    })

    it('should preserve https:// protocol in publicationUrl', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithHttps = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'https://iam.slys.dev'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect(httpClientCalls[0][0]).toBe('https://iam.slys.dev/api/v1')
    })

    it('should preserve http:// protocol in publicationUrl', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithHttp = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'http://localhost:3000'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect(httpClientCalls[0][0]).toBe('http://localhost:3000/api/v1')
    })

    it('should prepend https:// to substackUrl without protocol', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithoutProtocol = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'https://iam.slys.dev',
        substackUrl: 'custom.substack.com'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect(httpClientCalls[1][0]).toBe('https://custom.substack.com/api/v1') // substackClient
    })

    it('should preserve https:// protocol in substackUrl', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithHttps = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'https://iam.slys.dev',
        substackUrl: 'https://custom.substack.com'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect(httpClientCalls[1][0]).toBe('https://custom.substack.com/api/v1')
    })

    it('should preserve http:// protocol in substackUrl', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithHttp = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'https://iam.slys.dev',
        substackUrl: 'http://localhost:4000'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect(httpClientCalls[1][0]).toBe('http://localhost:4000/api/v1')
    })

    it('should handle both URLs without protocol', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientBothWithoutProtocol = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'iam.slys.dev',
        substackUrl: 'substack.com'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect(httpClientCalls[0][0]).toBe('https://iam.slys.dev/api/v1') // publicationClient
      expect(httpClientCalls[1][0]).toBe('https://substack.com/api/v1') // substackClient
    })

    it('should normalize default substackUrl when not provided', () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const clientWithDefaultSubstack = new SubstackClient({
        token: 'test-api-key',
        publicationUrl: 'iam.slys.dev'
      })

      const httpClientCalls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect(httpClientCalls[1][0]).toBe('https://substack.com/api/v1')
    })
  })
})
