import { NoteWithLinkBuilder } from '@substack-api/domain/note-builder'
import { HttpClient } from '@substack-api/internal/http-client'

jest.mock('@substack-api/internal/http-client')
const MockHttpClient = HttpClient as jest.MockedClass<typeof HttpClient>

describe('NoteWithLinkBuilder', () => {
  let mockClient: jest.Mocked<HttpClient>
  let builder: NoteWithLinkBuilder

  beforeEach(() => {
    mockClient = new MockHttpClient('https://example.com', {
      token: 'dummy-token',
      publicationUrl: 'https://pub.com'
    }) as jest.Mocked<HttpClient>
    mockClient.post = jest.fn().mockResolvedValue({ id: 67890 })
    builder = new NoteWithLinkBuilder(mockClient, 'https://example.com/test')
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('publish', () => {
    it('should POST to /notes with { content, attachment } in a single call', async () => {
      const result = await builder.paragraph().text('Check out this link!').publish()

      expect(mockClient.post).toHaveBeenCalledTimes(1)
      expect(mockClient.post).toHaveBeenCalledWith('/notes', {
        content: 'Check out this link!',
        attachment: 'https://example.com/test'
      })
      expect(result).toEqual({ id: 67890 })
    })

    it('should include the attachment URL for complex notes', async () => {
      await builder
        .paragraph()
        .text('This is ')
        .bold('bold')
        .text(' and ')
        .italic('italic')
        .paragraph()
        .text('Second paragraph with ')
        .link('a link', 'https://example.com')
        .publish()

      expect(mockClient.post).toHaveBeenCalledTimes(1)
      expect(mockClient.post).toHaveBeenCalledWith('/notes', {
        content:
          'This is **bold** and _italic_\n\nSecond paragraph with [a link](https://example.com)',
        attachment: 'https://example.com/test'
      })
    })

    it('should use the correct link URL passed to constructor', async () => {
      const specificUrl = 'https://specific-article.com/path/to/post'
      const specificBuilder = new NoteWithLinkBuilder(mockClient, specificUrl)
      await specificBuilder.paragraph().text('My note').publish()

      expect(mockClient.post).toHaveBeenCalledWith('/notes', {
        content: 'My note',
        attachment: specificUrl
      })
    })

    it('should throw when note has no content', async () => {
      await expect(
        new NoteWithLinkBuilder(mockClient, 'https://example.com').publish()
      ).rejects.toThrow()
      expect(mockClient.post).not.toHaveBeenCalled()
    })

    it('should propagate errors from the HTTP client', async () => {
      mockClient.post.mockRejectedValueOnce(new Error('Network error'))

      await expect(builder.paragraph().text('Test').publish()).rejects.toThrow('Network error')
      expect(mockClient.post).toHaveBeenCalledTimes(1)
    })
  })
})
