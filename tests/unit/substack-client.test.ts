import { SubstackClient } from '@substack-api/substack-client'
import { Profile, FullPost, Note, OwnProfile } from '@substack-api/domain'
import { HttpClient } from '@substack-api/internal/http-client'
import {
  PostService,
  NoteService,
  ProfileService,
  CommentService,
  FollowingService,
  ConnectivityService
} from '@substack-api/internal/services'

jest.mock('@substack-api/internal/http-client')
jest.mock('@substack-api/internal/services')

describe('SubstackClient', () => {
  let client: SubstackClient
  let mockClient: jest.Mocked<HttpClient>
  let mockPostService: jest.Mocked<PostService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockProfileService: jest.Mocked<ProfileService>
  let mockCommentService: jest.Mocked<CommentService>
  let mockFollowingService: jest.Mocked<FollowingService>
  let mockConnectivityService: jest.Mocked<ConnectivityService>

  const gatewayConfig = {
    gatewayUrl: 'http://localhost:5001',
    publicationUrl: 'https://test.substack.com',
    token: 'dummy-token'
  }

  const makeGatewayNote = (id: number, body: string) => ({
    id,
    body,
    likes_count: 0,
    author: { id: 123, name: 'Test User', handle: 'testuser', avatar_url: '' },
    published_at: '2023-01-01T00:00:00Z'
  })

  beforeEach(() => {
    jest.clearAllMocks()

    mockClient = new HttpClient('https://test.com', {
      token: 'dummy-token',
      publicationUrl: 'https://pub.com'
    }) as jest.Mocked<HttpClient>
    mockClient.get = jest.fn()
    mockClient.post = jest.fn()

    mockPostService = new PostService(mockClient) as jest.Mocked<PostService>
    mockPostService.getPostById = jest.fn()

    mockNoteService = new NoteService(mockClient) as jest.Mocked<NoteService>
    mockNoteService.getNoteById = jest.fn()

    mockProfileService = new ProfileService(mockClient) as jest.Mocked<ProfileService>
    mockProfileService.getOwnProfile = jest.fn()
    mockProfileService.getProfileBySlug = jest.fn()

    mockCommentService = new CommentService(mockClient) as jest.Mocked<CommentService>
    mockCommentService.getCommentsForPost = jest.fn()

    mockFollowingService = new FollowingService(mockClient) as jest.Mocked<FollowingService>
    mockFollowingService.getFollowing = jest.fn()

    mockConnectivityService = new ConnectivityService(
      mockClient
    ) as jest.Mocked<ConnectivityService>
    mockConnectivityService.isConnected = jest.fn()

    client = new SubstackClient(gatewayConfig)
    ;(client as any).postService = mockPostService
    ;(client as any).noteService = mockNoteService
    ;(client as any).profileService = mockProfileService
    ;(client as any).commentService = mockCommentService
    ;(client as any).followingService = mockFollowingService
    ;(client as any).connectivityService = mockConnectivityService
  })

  describe('constructor', () => {
    it('should create client instance with gateway config', () => {
      expect(client).toBeInstanceOf(SubstackClient)
    })

    it('should construct HttpClient with gatewayUrl', () => {
      jest.clearAllMocks()
      new SubstackClient(gatewayConfig)
      const calls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect(calls[0][0]).toContain('localhost:5001')
    })

    it('should use default gateway URL when gatewayUrl is not provided', () => {
      jest.clearAllMocks()
      const { gatewayUrl: _, ...configWithoutUrl } = gatewayConfig
      new SubstackClient(configWithoutUrl)
      const calls = (HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls
      expect(calls[0][0]).toContain('substack-gateway.vercel.app')
    })
  })

  describe('testConnectivity', () => {
    it('should return true when gateway is accessible', async () => {
      mockConnectivityService.isConnected.mockResolvedValue(true)
      const result = await client.testConnectivity()
      expect(result).toBe(true)
      expect(mockConnectivityService.isConnected).toHaveBeenCalled()
    })

    it('should return false when gateway is not accessible', async () => {
      mockConnectivityService.isConnected.mockResolvedValue(false)
      const result = await client.testConnectivity()
      expect(result).toBe(false)
    })
  })

  describe('ownProfile', () => {
    it('should return OwnProfile when authenticated', async () => {
      const mockProfile = {
        id: 123,
        name: 'Test User',
        handle: 'testuser',
        url: 'https://substack.com/@testuser',
        avatar_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getOwnProfile.mockResolvedValueOnce(mockProfile)

      const result = await client.ownProfile()
      expect(result).toBeInstanceOf(OwnProfile)
      expect(result.id).toBe(123)
      expect(result.name).toBe('Test User')
      expect(mockProfileService.getOwnProfile).toHaveBeenCalled()
    })

    it('should throw error when authentication fails', async () => {
      mockProfileService.getOwnProfile.mockRejectedValue(new Error('Unauthorized'))
      await expect(client.ownProfile()).rejects.toThrow('Failed to get own profile: Unauthorized')
    })
  })

  describe('profileForSlug', () => {
    it('should return Profile by slug', async () => {
      const mockProfile = {
        id: 123,
        handle: 'testuser',
        name: 'Test User',
        url: 'https://substack.com/@testuser',
        avatar_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getProfileBySlug.mockResolvedValue(mockProfile)

      const profile = await client.profileForSlug('testuser')
      expect(profile).toBeInstanceOf(Profile)
      expect(mockProfileService.getProfileBySlug).toHaveBeenCalledWith('testuser')
    })

    it('should throw for empty slug', async () => {
      await expect(client.profileForSlug('')).rejects.toThrow('Profile slug cannot be empty')
      await expect(client.profileForSlug('   ')).rejects.toThrow('Profile slug cannot be empty')
    })

    it('should throw when profile not found', async () => {
      mockProfileService.getProfileBySlug.mockRejectedValue(new Error('Not found'))
      await expect(client.profileForSlug('nonexistent')).rejects.toThrow(
        // eslint-disable-next-line quotes
        "Profile with slug 'nonexistent' not found: Not found"
      )
    })
  })

  describe('postForId', () => {
    it('should return FullPost by ID', async () => {
      const mockPost = {
        id: 456,
        title: 'Test Post',
        slug: 'test-post',
        url: 'https://example.com/test-post',
        published_at: '2023-01-01T00:00:00Z',
        html_body: '<p>Test body</p>'
      }
      mockPostService.getPostById.mockResolvedValueOnce(mockPost)

      const post = await client.postForId(456)
      expect(post).toBeInstanceOf(FullPost)
      expect(mockPostService.getPostById).toHaveBeenCalledWith(456)
    })

    it('should throw when post not found', async () => {
      mockPostService.getPostById.mockRejectedValueOnce(new Error('HTTP 404: Not found'))
      await expect(client.postForId(999)).rejects.toThrow('Post with ID 999 not found')
    })
  })

  describe('noteForId', () => {
    it('should return Note by ID', async () => {
      const mockNote = makeGatewayNote(789, 'Test note')
      mockNoteService.getNoteById.mockResolvedValue(mockNote)

      const note = await client.noteForId(789)
      expect(note).toBeInstanceOf(Note)
      expect(note.id).toBe(789)
      expect(note.body).toBe('Test note')
      expect(mockNoteService.getNoteById).toHaveBeenCalledWith(789)
    })

    it('should throw when note not found', async () => {
      mockNoteService.getNoteById.mockRejectedValue(new Error('Not found'))
      await expect(client.noteForId(999)).rejects.toThrow('Note with ID 999 not found')
    })
  })
})
