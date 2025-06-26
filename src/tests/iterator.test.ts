import { Substack } from '../client'

describe('Substack Iterator Methods', () => {
  let client: Substack

  beforeEach(() => {
    client = new Substack({
      apiKey: 'test-api-key'
    })
    global.fetch = jest.fn()
  })

  describe('getPosts iterator', () => {
    it('should handle pagination automatically across multiple pages', async () => {
      // Mock a scenario where the first page is full and we need to request more
      const firstPageResponse = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `Post ${i + 1}`
      }))
      const secondPageResponse = [
        { id: 21, title: 'Post 21' },
        { id: 22, title: 'Post 22' }
      ]

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(firstPageResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(secondPageResponse)
        })

      const result = []
      for await (const post of client.getPosts({ limit: 22 })) {
        result.push(post)
      }

      expect(result).toHaveLength(22)
      expect(result[0]).toEqual({ id: 1, title: 'Post 1' })
      expect(result[19]).toEqual({ id: 20, title: 'Post 20' })
      expect(result[20]).toEqual({ id: 21, title: 'Post 21' })
      expect(result[21]).toEqual({ id: 22, title: 'Post 22' })

      // Should have made multiple requests for pagination
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should respect limit parameter', async () => {
      const mockResponse = [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' },
        { id: 3, title: 'Post 3' }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = []
      for await (const post of client.getPosts({ limit: 2 })) {
        result.push(post)
      }

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(mockResponse[0])
      expect(result[1]).toEqual(mockResponse[1])
    })

    it('should handle empty responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      const result = []
      for await (const post of client.getPosts()) {
        result.push(post)
      }

      expect(result).toHaveLength(0)
    })
  })

  describe('getComments iterator', () => {
    it('should handle pagination automatically across multiple pages', async () => {
      // Mock a scenario where the first page is full and we need to request more
      const firstPageResponse = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        body: `Comment ${i + 1}`
      }))
      const secondPageResponse = [
        { id: 21, body: 'Comment 21' },
        { id: 22, body: 'Comment 22' }
      ]

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(firstPageResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(secondPageResponse)
        })

      const result = []
      for await (const comment of client.getComments(123, { limit: 22 })) {
        result.push(comment)
      }

      expect(result).toHaveLength(22)
      expect(result[0]).toEqual({ id: 1, body: 'Comment 1' })
      expect(result[19]).toEqual({ id: 20, body: 'Comment 20' })
      expect(result[20]).toEqual({ id: 21, body: 'Comment 21' })
      expect(result[21]).toEqual({ id: 22, body: 'Comment 22' })

      // Should have made multiple requests for pagination
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should respect limit parameter', async () => {
      const mockResponse = [
        { id: 1, body: 'Comment 1' },
        { id: 2, body: 'Comment 2' },
        { id: 3, body: 'Comment 3' }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = []
      for await (const comment of client.getComments(123, { limit: 2 })) {
        result.push(comment)
      }

      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(mockResponse[0])
      expect(result[1]).toEqual(mockResponse[1])
    })

    it('should handle empty responses', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      const result = []
      for await (const comment of client.getComments(123)) {
        result.push(comment)
      }

      expect(result).toHaveLength(0)
    })
  })
})