import { Substack } from '../../src/client'

describe('Substack Content', () => {
  let client: Substack

  beforeEach(() => {
    client = new Substack({
      apiKey: 'test-api-key'
    })
    global.fetch = jest.fn()
  })

  describe('posts', () => {
    it('should get posts with async iteration', async () => {
      const mockResponse = [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = []
      for await (const post of client.getPosts({ limit: 2 })) {
        result.push(post)
      }
      expect(result).toEqual(mockResponse)
    })

    it('should get posts with limit', async () => {
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

    it('should handle empty response', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      const result = []
      for await (const post of client.getPosts()) {
        result.push(post)
      }
      expect(result).toEqual([])
    })

    it('should get a specific post', async () => {
      const mockResponse = {
        id: 1,
        title: 'Test Post',
        slug: 'test-post'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getPost('test-post')
      expect(result).toEqual(mockResponse)
    })

    it('should search posts', async () => {
      const mockResponse = {
        total: 1,
        results: [{ id: 1, title: 'Test Post' }]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.searchPosts({ query: 'test' })
      expect(result).toEqual(mockResponse)
    })
  })

  describe('comments', () => {
    it('should get comments for a post with async iteration', async () => {
      const mockResponse = [
        { id: 1, body: 'Comment 1' },
        { id: 2, body: 'Comment 2' }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = []
      for await (const comment of client.getComments(1)) {
        result.push(comment)
      }
      expect(result).toEqual(mockResponse)
    })

    it('should get comments with limit', async () => {
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
      for await (const comment of client.getComments(1, { limit: 2 })) {
        result.push(comment)
      }
      expect(result).toHaveLength(2)
      expect(result[0]).toEqual(mockResponse[0])
      expect(result[1]).toEqual(mockResponse[1])
    })

    it('should handle empty response for comments', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      const result = []
      for await (const comment of client.getComments(1)) {
        result.push(comment)
      }
      expect(result).toEqual([])
    })

    it('should get a specific comment', async () => {
      const mockResponse = {
        id: 1,
        body: 'Test Comment'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getComment(1)
      expect(result).toEqual(mockResponse)
    })
  })
})
