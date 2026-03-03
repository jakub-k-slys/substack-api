import { SubstackClient } from '@substack-api/substack-client'
import { Profile, FullPost, Note, OwnProfile } from '@substack-api/domain'
import { HttpClient } from '@substack-api/internal/http-client'
import {
  PostService,
  NoteService,
  ProfileService,
  ConnectivityService,
  NewNoteService
} from '@substack-api/internal/services'
import { makeGatewayNote } from '@test/unit/fixtures'

jest.mock('@substack-api/internal/http-client')
jest.mock('@substack-api/internal/services')

const MockPostService = PostService as jest.MockedClass<typeof PostService>
const MockNoteService = NoteService as jest.MockedClass<typeof NoteService>
const MockProfileService = ProfileService as jest.MockedClass<typeof ProfileService>
const MockConnectivityService = ConnectivityService as jest.MockedClass<typeof ConnectivityService>
const MockNewNoteService = NewNoteService as jest.MockedClass<typeof NewNoteService>

describe('SubstackClient', () => {
  let client: SubstackClient
  let mockPostService: jest.Mocked<PostService>
  let mockNoteService: jest.Mocked<NoteService>
  let mockProfileService: jest.Mocked<ProfileService>
  let mockConnectivityService: jest.Mocked<ConnectivityService>
  let mockNewNoteService: jest.Mocked<NewNoteService>

  const gatewayConfig = {
    gatewayUrl: 'http://localhost:5001',
    publicationUrl: 'https://test.substack.com',
    token: 'dummy-token'
  }

  beforeEach(() => {
    jest.clearAllMocks()
    client = new SubstackClient(gatewayConfig)

    // Retrieve service instances created inside the SubstackClient constructor
    mockPostService = MockPostService.mock.instances[0] as jest.Mocked<PostService>
    mockNoteService = MockNoteService.mock.instances[0] as jest.Mocked<NoteService>
    mockProfileService = MockProfileService.mock.instances[0] as jest.Mocked<ProfileService>
    mockConnectivityService = MockConnectivityService.mock
      .instances[0] as jest.Mocked<ConnectivityService>
    mockNewNoteService = MockNewNoteService.mock.instances[0] as jest.Mocked<NewNoteService>
  })

  describe('constructor', () => {
    it('should create client instance', () => {
      expect(client).toBeInstanceOf(SubstackClient)
    })

    it('should construct HttpClient with the provided gatewayUrl', () => {
      jest.clearAllMocks()
      new SubstackClient(gatewayConfig)
      expect((HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls[0][0]).toContain(
        'localhost:5001'
      )
    })

    it('should use default gateway URL when gatewayUrl is not provided', () => {
      jest.clearAllMocks()
      const { gatewayUrl: _, ...configWithoutUrl } = gatewayConfig
      new SubstackClient(configWithoutUrl)
      expect((HttpClient as jest.MockedClass<typeof HttpClient>).mock.calls[0][0]).toContain(
        'substack-gateway.vercel.app'
      )
    })
  })

  describe('testConnectivity', () => {
    it('should return true when gateway is accessible', async () => {
      mockConnectivityService.isConnected.mockResolvedValue(true)
      expect(await client.testConnectivity()).toBe(true)
    })

    it('should return false when gateway is not accessible', async () => {
      mockConnectivityService.isConnected.mockResolvedValue(false)
      expect(await client.testConnectivity()).toBe(false)
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
    })

    it('should throw when authentication fails', async () => {
      mockProfileService.getOwnProfile.mockRejectedValue(new Error('Unauthorized'))
      await expect(client.ownProfile()).rejects.toThrow('Failed to get own profile: Unauthorized')
    })

    it('should return OwnProfile with working publishNote method', async () => {
      const mockProfile = {
        id: 123,
        name: 'Test User',
        handle: 'testuser',
        url: 'https://substack.com/@testuser',
        avatar_url: 'https://example.com/photo.jpg'
      }
      mockProfileService.getOwnProfile.mockResolvedValueOnce(mockProfile)
      mockNewNoteService.publishNote = jest.fn().mockResolvedValue({ id: 42 })

      const profile = await client.ownProfile()
      const result = await profile.publishNote('Hello world')

      expect(mockNewNoteService.publishNote).toHaveBeenCalledWith('Hello world', undefined)
      expect(result).toEqual({ id: 42 })
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
        /Profile with slug.*nonexistent.*not found/
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
    })

    it('should throw when note not found', async () => {
      mockNoteService.getNoteById.mockRejectedValue(new Error('Not found'))
      await expect(client.noteForId(999)).rejects.toThrow('Note with ID 999 not found')
    })
  })
})
