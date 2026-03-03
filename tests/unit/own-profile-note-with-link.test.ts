import { OwnProfile } from '@substack-api/domain/own-profile'
import { NoteWithLinkBuilder, NoteBuilder } from '@substack-api/domain/note-builder'
import { HttpClient } from '@substack-api/internal/http-client'
import {
  ProfileService,
  PostService,
  NoteService,
  FollowingService,
  CommentService,
  NewNoteService
} from '@substack-api/internal/services'

jest.mock('@substack-api/internal/http-client')
jest.mock('@substack-api/internal/services')

const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>
const MockProfileService = ProfileService as jest.MockedClass<typeof ProfileService>
const MockPostService = PostService as jest.MockedClass<typeof PostService>
const MockNoteService = NoteService as jest.MockedClass<typeof NoteService>
const MockCommentService = CommentService as jest.MockedClass<typeof CommentService>
const MockFollowingService = FollowingService as jest.MockedClass<typeof FollowingService>
const MockNewNoteService = NewNoteService as jest.MockedClass<typeof NewNoteService>

const mockProfileData = {
  id: 12345,
  name: 'Test User',
  handle: 'testuser',
  url: 'https://substack.com/@testuser',
  avatar_url: 'https://example.com/photo.jpg',
  bio: 'Test bio'
}

describe('OwnProfile - newNoteWithLink', () => {
  let mockClient: jest.Mocked<HttpClient>
  let mockNewNoteService: jest.Mocked<NewNoteService>
  let ownProfile: OwnProfile

  beforeEach(() => {
    mockClient = new MockHttpClient('https://example.com', {
      token: 'dummy-token',
      publicationUrl: 'https://pub.com'
    }) as jest.Mocked<HttpClient>

    const mockPostService = new MockPostService(mockClient) as jest.Mocked<PostService>
    const mockNoteService = new MockNoteService(mockClient) as jest.Mocked<NoteService>
    const mockCommentService = new MockCommentService(mockClient) as jest.Mocked<CommentService>
    const mockProfileService = new MockProfileService(mockClient) as jest.Mocked<ProfileService>
    const mockFollowingService = new MockFollowingService(
      mockClient
    ) as jest.Mocked<FollowingService>

    mockNewNoteService = new MockNewNoteService(mockClient) as jest.Mocked<NewNoteService>
    mockNewNoteService.newNote = jest.fn().mockImplementation(() => {
      const { NoteBuilder: NB } = jest.requireActual('@substack-api/domain/note-builder')
      return new NB(mockClient)
    })
    mockNewNoteService.newNoteWithLink = jest.fn().mockImplementation((link: string) => {
      const { NoteWithLinkBuilder: NWLB } = jest.requireActual('@substack-api/domain/note-builder')
      return new NWLB(mockClient, link)
    })

    ownProfile = new OwnProfile(
      mockProfileData,
      mockPostService,
      mockNoteService,
      mockCommentService,
      mockProfileService,
      mockFollowingService,
      mockNewNoteService,
      25
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('newNoteWithLink', () => {
    it('should return a NoteWithLinkBuilder instance', () => {
      const builder = ownProfile.newNoteWithLink('https://example.com/article')
      expect(builder).toBeInstanceOf(NoteWithLinkBuilder)
    })

    it('should work with various URL formats', () => {
      const urls = [
        'https://example.com/test',
        'http://blog.example.com/post/123',
        'https://subdomain.domain.com/path?param=value'
      ]

      urls.forEach((url) => {
        expect(ownProfile.newNoteWithLink(url)).toBeInstanceOf(NoteWithLinkBuilder)
      })
    })

    it('should allow chaining builder methods', () => {
      const chained = ownProfile
        .newNoteWithLink('https://example.com/article')
        .paragraph()
        .text('Check out this article!')

      expect(chained).toBeDefined()
    })
  })

  describe('integration', () => {
    it('should provide both newNote and newNoteWithLink', () => {
      const regularNote = ownProfile.newNote()
      const noteWithLink = ownProfile.newNoteWithLink('https://example.com')

      expect(regularNote).toBeInstanceOf(NoteBuilder)
      expect(noteWithLink).toBeInstanceOf(NoteWithLinkBuilder)
      expect(noteWithLink).not.toBe(regularNote)
    })
  })
})
