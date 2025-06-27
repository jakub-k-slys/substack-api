import { Substack } from '../../src/client'
import { SubstackConfig } from '../../src/types'

describe('Substack', () => {
  let client: Substack

  beforeEach(() => {
    client = new Substack({
      apiKey: 'test-api-key'
    })
    global.fetch = jest.fn()
  })

  describe('constructor', () => {
    it('should throw error if apiKey is not provided', () => {
      expect(() => new Substack({} as unknown as SubstackConfig)).toThrow(
        'apiKey is required in SubstackConfig'
      )
    })

    it('should use default hostname if not provided', () => {
      const client = new Substack({ apiKey: 'test' })
      expect(client['baseUrl']).toBe('https://substack.com')
    })

    it('should use custom hostname if provided', () => {
      const client = new Substack({ apiKey: 'test', hostname: 'test.com' })
      expect(client['baseUrl']).toBe('https://test.com')
    })

    it('should use custom apiVersion if provided', () => {
      const client = new Substack({ apiKey: 'test', apiVersion: 'v2' })
      expect(client['apiVersion']).toBe('v2')
    })

    it('should use default perPage of 25 if not provided', () => {
      const client = new Substack({ apiKey: 'test' })
      expect(client['perPage']).toBe(25)
    })

    it('should use custom perPage if provided', () => {
      const client = new Substack({ apiKey: 'test', perPage: 50 })
      expect(client['perPage']).toBe(50)
    })

    it('should use default cacheTTL of 300 if not provided', () => {
      const client = new Substack({ apiKey: 'test' })
      expect(client['cacheTTL']).toBe(300)
    })

    it('should use custom cacheTTL if provided', () => {
      const client = new Substack({ apiKey: 'test', cacheTTL: 600 })
      expect(client['cacheTTL']).toBe(600)
    })
  })

  describe('request handling', () => {
    it('should build URL with query parameters', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      // Start iteration to trigger the request
      const iterator = client.getPosts({ limit: 20 })[Symbol.asyncIterator]()
      await iterator.next()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('?offset=0&limit=20'),
        expect.any(Object)
      )
    })

    it('should handle pagination correctly', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      // Start iteration to trigger the request
      const iterator = client.getPosts({ limit: 10 })[Symbol.asyncIterator]()
      await iterator.next()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('?offset=0&limit=10'),
        expect.any(Object)
      )
    })
  })

  describe('caching', () => {
    it('should cache GET requests', async () => {
      const mockResponse = [{ id: 1, title: 'Test Post' }]
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      // First call
      const iterator1 = client.getPosts({ limit: 1 })[Symbol.asyncIterator]()
      await iterator1.next()

      // Second call should use cache
      const iterator2 = client.getPosts({ limit: 1 })[Symbol.asyncIterator]()
      await iterator2.next()

      // Should only make one fetch call due to caching
      expect(global.fetch).toHaveBeenCalledTimes(1)
    })

    it('should not cache POST requests', async () => {
      const mockResponse = { id: 1, body: 'Test note' }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      // Make two POST requests (note publishing)
      await client.publishNoteRequest({
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'test' }]
            }
          ]
        },
        replyMinimumRole: 'everyone'
      })

      await client.publishNoteRequest({
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'test2' }]
            }
          ]
        },
        replyMinimumRole: 'everyone'
      })

      // Should make two fetch calls since POST requests are not cached
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should respect cache TTL', async () => {
      // Create client with very short TTL for testing
      const shortTTLClient = new Substack({
        apiKey: 'test-api-key',
        cacheTTL: 0.001 // 1ms TTL
      })

      const mockResponse = [{ id: 1, title: 'Test Post' }]
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      // First call
      const iterator1 = shortTTLClient.getPosts({ limit: 1 })[Symbol.asyncIterator]()
      await iterator1.next()

      // Wait for cache to expire
      await new Promise((resolve) => global.setTimeout(resolve, 10))

      // Second call should not use expired cache
      const iterator2 = shortTTLClient.getPosts({ limit: 1 })[Symbol.asyncIterator]()
      await iterator2.next()

      // Should make two fetch calls since cache expired
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })
  })
})
