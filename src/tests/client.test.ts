import { Substack } from '../client'
import { SubstackConfig } from '../types'

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
  })

  describe('request handling', () => {
    it('should build URL with query parameters', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      await client.getPosts({ offset: 10, limit: 20 })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('?offset=10&limit=20'),
        expect.any(Object)
      )
    })

    it('should handle undefined query parameters', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([])
      })

      await client.getPosts({ offset: undefined, limit: 20 })

      expect(global.fetch).toHaveBeenCalledWith(
        expect.not.stringContaining('offset'),
        expect.any(Object)
      )
    })
  })
})
