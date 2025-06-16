import { Substack, SubstackError } from './client'
import type { SubstackPublication, SubstackPost, SubstackComment, SubstackSearchResult, SubstackConfig } from './types'
import { describe, expect, it, jest, beforeAll, afterAll, beforeEach } from '@jest/globals'

function createMockResponse<T>(data: T, options: Partial<Response> = {}): Response {
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' })
  const init = {
    status: 200,
    statusText: 'OK',
    headers: { 'content-type': 'application/json' },
    ...options
  }
  const response = new Response(blob, init)
  response.json = () => Promise.resolve(data)
  return response
}

describe('Substack', () => {
  let globalFetch: typeof global.fetch

  beforeAll(() => {
    globalFetch = global.fetch
  })

  afterAll(() => {
    global.fetch = globalFetch
  })

  beforeEach(() => {
    global.fetch = jest.fn() as jest.MockedFunction<typeof global.fetch>
  })

  describe('constructor', () => {
    it('should require apiKey in constructor', () => {
      expect(() => new Substack({} as SubstackConfig)).toThrow()
    })

    it('should use default hostname and v1 API version when only apiKey provided', () => {
      const client = new Substack({ apiKey: 'test-key' })
      expect((client as any).baseUrl).toBe('https://substack.com')
      expect((client as any).apiVersion).toBe('v1')
      expect((client as any).cookie).toBe('connect.sid=s%3Atest-key')
    })

    it('should use custom hostname and API version when provided', () => {
      const client = new Substack({ 
        hostname: 'example.substack.com',
        apiVersion: 'v2',
        apiKey: 'test-key'
      })
      expect((client as any).baseUrl).toBe('https://example.substack.com')
      expect((client as any).apiVersion).toBe('v2')
    })
  })

  describe('getPublication', () => {
    const mockPublication: SubstackPublication = {
      name: 'Test Publication',
      hostname: 'test.substack.com',
      subdomain: 'test',
      description: 'Test description'
    }

    it('should fetch publication details successfully', async () => {
      (global.fetch as jest.MockedFunction<typeof global.fetch>).mockResolvedValueOnce(
        createMockResponse(mockPublication)
      )

      const client = new Substack({ apiKey: 'test-key' })
      const result = await client.getPublication('test.substack.com')

      expect(result).toEqual(mockPublication)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.substack.com/api/v1/publication',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Cookie: 'connect.sid=s%3Atest-key'
          })
        })
      )
    })

    it('should throw SubstackError when fetch fails', async () => {
      const client = new Substack({ apiKey: 'test-key' })
      const errorMessage = 'Not Found'
      ;(global.fetch as jest.MockedFunction<typeof global.fetch>).mockResolvedValueOnce(
        createMockResponse(null, { ok: false, status: 404, statusText: errorMessage })
      )

      await expect(client.getPublication('test.substack.com'))
        .rejects
        .toThrow(SubstackError)
    })

    it('should use baseUrl when no hostname provided', async () => {
      (global.fetch as jest.MockedFunction<typeof global.fetch>).mockResolvedValueOnce(
        createMockResponse(mockPublication)
      )

      const client = new Substack({ hostname: 'test.substack.com', apiKey: 'test-key' })
      await client.getPublication()

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.substack.com/api/v1/publication',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            Cookie: 'connect.sid=s%3Atest-key'
          })
        })
      )
    })
  })

  describe('getPosts', () => {
    const mockPosts: SubstackPost[] = [
      {
        id: 1,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-06-16T12:00:00Z',
        canonical_url: 'https://test.substack.com/p/test-post',
        type: 'newsletter',
        published: true,
        paywalled: false
      }
    ]

    it('should include cookie header in requests', async () => {
      (global.fetch as jest.MockedFunction<typeof global.fetch>).mockResolvedValueOnce(
        createMockResponse(mockPosts)
      )

      const client = new Substack({ hostname: 'test.substack.com', apiKey: 'test-key' })
      await client.getPosts()

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            Cookie: 'connect.sid=s%3Atest-key'
          })
        })
      )
    })

    it('should fetch posts with pagination', async () => {
      (global.fetch as jest.MockedFunction<typeof global.fetch>).mockResolvedValueOnce(
        createMockResponse(mockPosts)
      )

      const client = new Substack({ hostname: 'test.substack.com', apiKey: 'test-key' })
      const result = await client.getPosts({ offset: 0, limit: 10 })

      expect(result).toEqual(mockPosts)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://test.substack.com/api/v1/posts'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=0'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      )
    })

    it('should fetch posts without pagination', async () => {
      (global.fetch as jest.MockedFunction<typeof global.fetch>).mockResolvedValueOnce(
        createMockResponse(mockPosts)
      )

      const client = new Substack({ hostname: 'test.substack.com', apiKey: 'test-key' })
      const result = await client.getPosts()

      expect(result).toEqual(mockPosts)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.substack.com/api/v1/posts',
        expect.any(Object)
      )
    })
  })

  describe('searchPosts', () => {
    const mockSearchResult: SubstackSearchResult = {
      total: 1,
      results: [{
        id: 1,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-06-16T12:00:00Z',
        canonical_url: 'https://test.substack.com/p/test-post',
        type: 'newsletter',
        published: true,
        paywalled: false
      }]
    }

    it('should search posts with all parameters', async () => {
      (global.fetch as jest.MockedFunction<typeof global.fetch>).mockResolvedValueOnce(
        createMockResponse(mockSearchResult)
      )

      const client = new Substack({ hostname: 'test.substack.com', apiKey: 'test-key' })
      const result = await client.searchPosts({
        query: 'test',
        type: 'newsletter',
        limit: 10,
        offset: 0,
        published_before: '2023-12-31',
        published_after: '2023-01-01'
      })

      expect(result).toEqual(mockSearchResult)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('query=test'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('type=newsletter'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('published_before=2023-12-31'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('published_after=2023-01-01'),
        expect.any(Object)
      )
    })

    it('should search posts with minimal parameters', async () => {
      (global.fetch as jest.MockedFunction<typeof global.fetch>).mockResolvedValueOnce(
        createMockResponse(mockSearchResult)
      )

      const client = new Substack({ hostname: 'test.substack.com', apiKey: 'test-key' })
      const result = await client.searchPosts({ query: 'test' })

      expect(result).toEqual(mockSearchResult)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.substack.com/api/v1/search?query=test',
        expect.any(Object)
      )
    })
  })

  describe('comments', () => {
    const mockComments: SubstackComment[] = [{
      id: 1,
      body: 'Test comment',
      created_at: '2023-06-16T12:00:00Z',
      parent_post_id: 1,
      author: {
        id: 1,
        name: 'Test User'
      }
    }]

    it('should fetch comments for a post with pagination', async () => {
      (global.fetch as jest.MockedFunction<typeof global.fetch>).mockResolvedValueOnce(
        createMockResponse(mockComments)
      )

      const client = new Substack({ hostname: 'test.substack.com', apiKey: 'test-key' })
      const result = await client.getComments(1, { limit: 10, offset: 0 })

      expect(result).toEqual(mockComments)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://test.substack.com/api/v1/posts/1/comments'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('limit=10'),
        expect.any(Object)
      )
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('offset=0'),
        expect.any(Object)
      )
    })

    it('should fetch comments without pagination', async () => {
      (global.fetch as jest.MockedFunction<typeof global.fetch>).mockResolvedValueOnce(
        createMockResponse(mockComments)
      )

      const client = new Substack({ hostname: 'test.substack.com', apiKey: 'test-key' })
      const result = await client.getComments(1)

      expect(result).toEqual(mockComments)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.substack.com/api/v1/posts/1/comments',
        expect.any(Object)
      )
    })

    it('should fetch a single comment', async () => {
      (global.fetch as jest.MockedFunction<typeof global.fetch>).mockResolvedValueOnce(
        createMockResponse(mockComments[0])
      )

      const client = new Substack({ hostname: 'test.substack.com', apiKey: 'test-key' })
      const result = await client.getComment(1)

      expect(result).toEqual(mockComments[0])
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test.substack.com/api/v1/comments/1',
        expect.any(Object)
      )
    })
  })
})
