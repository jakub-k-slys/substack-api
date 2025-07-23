import { SubstackClient } from '../../src/substack-client'
import { FullPost } from '../../src/domain'

// Mock the global fetch function
global.fetch = jest.fn()

describe('SubstackClient - Global Post Endpoint', () => {
  let client: SubstackClient
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    jest.clearAllMocks()

    // Configure client with a publication-specific hostname
    client = new SubstackClient({
      apiKey: 'test-api-key',
      hostname: 'someuser.substack.com' // Publication-specific hostname
    })
  })

  describe('postForId', () => {
    it('should use global substack.com endpoint regardless of configured hostname', async () => {
      const mockPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter' as const,
        body_html: '<p>Test post body content</p>'
      }

      // Mock successful response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ post: mockPost }),
        status: 200,
        statusText: 'OK'
      } as Response)

      const post = await client.postForId(123)

      expect(post).toBeInstanceOf(FullPost)
      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Verify the URL uses global substack.com domain, not the configured publication hostname
      const fetchCall = mockFetch.mock.calls[0]
      const requestUrl = fetchCall[0] as string
      expect(requestUrl).toBe('https://substack.com/api/v1/posts/by-id/123')
      expect(requestUrl).not.toContain('someuser.substack.com')
    })

    it('should work with different publication hostnames but always use global endpoint', async () => {
      // Test with another publication-specific hostname
      const anotherClient = new SubstackClient({
        apiKey: 'test-api-key',
        hostname: 'anotherpub.substack.com'
      })

      const mockPost = {
        id: 456,
        title: 'Another Test Post',
        slug: 'another-test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter' as const,
        body_html: '<p>Another test post body content</p>'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ post: mockPost }),
        status: 200,
        statusText: 'OK'
      } as Response)

      await anotherClient.postForId(456)

      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Should still use global endpoint
      const fetchCall = mockFetch.mock.calls[0]
      const requestUrl = fetchCall[0] as string
      expect(requestUrl).toBe('https://substack.com/api/v1/posts/by-id/456')
      expect(requestUrl).not.toContain('anotherpub.substack.com')
    })

    it('should pass through authentication headers correctly to global endpoint', async () => {
      const mockPost = {
        id: 789,
        title: 'Auth Test Post',
        slug: 'auth-test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.com/post',
        type: 'newsletter' as const,
        body_html: '<p>Auth test post body content</p>'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ post: mockPost }),
        status: 200,
        statusText: 'OK'
      } as Response)

      await client.postForId(789)

      expect(mockFetch).toHaveBeenCalledTimes(1)

      // Check that authentication headers are included
      const fetchCall = mockFetch.mock.calls[0]
      const requestInit = fetchCall[1] as RequestInit
      expect(requestInit.headers).toEqual(
        expect.objectContaining({
          Cookie: 'connect.sid=test-api-key',
          'Content-Type': 'application/json'
        })
      )
    })

    it('should handle errors from global endpoint properly', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      } as Response)

      await expect(client.postForId(999999999)).rejects.toThrow(
        'Post with ID 999999999 not found: HTTP 404: Not Found'
      )

      // Verify it still attempted to call the global endpoint
      const fetchCall = mockFetch.mock.calls[0]
      const requestUrl = fetchCall[0] as string
      expect(requestUrl).toBe('https://substack.com/api/v1/posts/by-id/999999999')
    })
  })
})
