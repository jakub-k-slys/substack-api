import { NewNoteService } from '@substack-api/internal/services/new-note-service'
import { HttpClient } from '@substack-api/internal/http-client'

jest.mock('@substack-api/internal/http-client')

describe('NewNoteService', () => {
  let service: NewNoteService
  let mockClient: jest.Mocked<HttpClient>

  beforeEach(() => {
    jest.clearAllMocks()
    mockClient = new HttpClient('https://test.com', {
      token: 'dummy-token',
      publicationUrl: 'https://pub.com'
    }) as jest.Mocked<HttpClient>
    mockClient.post = jest.fn()
    service = new NewNoteService(mockClient)
  })

  describe('publishNote', () => {
    it('should POST /notes with content and return the note id', async () => {
      mockClient.post.mockResolvedValueOnce({ id: 42 })

      const result = await service.publishNote('Hello world')

      expect(mockClient.post).toHaveBeenCalledWith('/notes', { content: 'Hello world' })
      expect(result).toEqual({ id: 42 })
    })

    it('should include attachment when provided', async () => {
      mockClient.post.mockResolvedValueOnce({ id: 99 })

      await service.publishNote('Check this out', 'https://example.com/article')

      expect(mockClient.post).toHaveBeenCalledWith('/notes', {
        content: 'Check this out',
        attachment: 'https://example.com/article'
      })
    })

    it('should not include attachment key when attachment is undefined', async () => {
      mockClient.post.mockResolvedValueOnce({ id: 1 })

      await service.publishNote('No attachment here')

      const body = mockClient.post.mock.calls[0][1] as Record<string, string>
      expect('attachment' in body).toBe(false)
    })

    it('should throw when response is missing id', async () => {
      mockClient.post.mockResolvedValueOnce({ other: 'field' })

      await expect(service.publishNote('Bad response')).rejects.toThrow(
        'Invalid GatewayCreateNoteResponse'
      )
    })
  })
})
