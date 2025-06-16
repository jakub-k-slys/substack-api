import { Substack } from '../client'

describe('Substack Content', () => {
  let client: Substack

  beforeEach(() => {
    client = new Substack({
      apiKey: 'test-api-key'
    })
    global.fetch = jest.fn()
  })

  describe('publication', () => {
    it('should get publication details', async () => {
      const mockResponse = {
        name: 'Test Publication',
        hostname: 'test.substack.com',
        subdomain: 'test'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getPublication()
      expect(result).toEqual(mockResponse)
    })

    it('should get publication details with custom hostname', async () => {
      const mockResponse = {
        name: 'Test Publication',
        hostname: 'custom.com',
        subdomain: 'test'
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getPublication('custom.com')
      expect(result).toEqual(mockResponse)
    })
  })

  describe('posts', () => {
    it('should get posts with pagination', async () => {
      const mockResponse = [
        { id: 1, title: 'Post 1' },
        { id: 2, title: 'Post 2' }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getPosts({ offset: 0, limit: 2 })
      expect(result).toEqual(mockResponse)
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
    it('should get comments for a post', async () => {
      const mockResponse = [
        { id: 1, body: 'Comment 1' },
        { id: 2, body: 'Comment 2' }
      ]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getComments(1)
      expect(result).toEqual(mockResponse)
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
