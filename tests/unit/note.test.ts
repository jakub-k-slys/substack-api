import { Note } from '@substack-api/domain/note'

const makeGatewayNote = (id: number, body: string, likesCount = 0) => ({
  id,
  body,
  likes_count: likesCount,
  author: {
    id: 123,
    name: 'Test User',
    handle: 'testuser',
    avatar_url: 'https://example.com/photo.jpg'
  },
  published_at: '2023-01-01T00:00:00Z'
})

describe('Note Entity', () => {
  describe('properties', () => {
    it('should expose id as number', () => {
      const note = new Note(makeGatewayNote(789, 'Test note content', 15))
      expect(note.id).toBe(789)
      expect(typeof note.id).toBe('number')
    })

    it('should expose body', () => {
      const note = new Note(makeGatewayNote(1, 'Hello world'))
      expect(note.body).toBe('Hello world')
    })

    it('should expose likesCount', () => {
      const note = new Note(makeGatewayNote(1, 'body', 42))
      expect(note.likesCount).toBe(42)
    })

    it('should expose author with id, name, handle, and avatarUrl', () => {
      const note = new Note(makeGatewayNote(1, 'body'))
      expect(note.author.id).toBe(123)
      expect(note.author.name).toBe('Test User')
      expect(note.author.handle).toBe('testuser')
      expect(note.author.avatarUrl).toBe('https://example.com/photo.jpg')
    })

    it('should expose publishedAt as Date', () => {
      const note = new Note(makeGatewayNote(1, 'body'))
      expect(note.publishedAt).toBeInstanceOf(Date)
      expect(note.publishedAt.toISOString()).toContain('2023-01-01')
    })

    it('should handle zero likesCount', () => {
      const note = new Note(makeGatewayNote(1, 'body', 0))
      expect(note.likesCount).toBe(0)
    })
  })
})
