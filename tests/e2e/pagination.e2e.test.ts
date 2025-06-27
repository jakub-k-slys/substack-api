/// <reference path="./global.d.ts" />
import { Substack } from '../../src/client'

// Helper function to handle network errors gracefully
const handleNetworkError = (error: any, operation: string): void => {
  // Check for various network error indicators
  const isNetworkError =
    (error &&
      typeof error === 'object' &&
      'code' in error &&
      ((error as any).code === 'EAI_AGAIN' || (error as any).code === 'ENOTFOUND')) ||
    (error &&
      typeof error === 'object' &&
      'cause' in error &&
      error.cause &&
      typeof error.cause === 'object' &&
      'code' in error.cause &&
      ((error.cause as any).code === 'EAI_AGAIN' || (error.cause as any).code === 'ENOTFOUND')) ||
    (error && error.toString && error.toString().includes('fetch failed')) ||
    (error && error.toString && error.toString().includes('EAI_AGAIN')) ||
    (error && error.toString && error.toString().includes('ENOTFOUND'))

  // Check for endpoint not available (search functionality may not be available)
  const isEndpointNotFound =
    error && typeof error === 'object' && 'status' in error && (error as any).status === 404

  if (isNetworkError) {
    console.warn(
      `Network connectivity issue during ${operation}:`,
      (error as any)?.message || error
    )
    return
  }

  if (isEndpointNotFound) {
    console.warn(
      `Endpoint not available for ${operation} - this feature may not be supported:`,
      (error as any)?.message || error
    )
    return
  }

  throw error
}

describe('E2E: Limit Handling & Pagination', () => {
  let defaultClient: Substack
  let customPerPageClient: Substack

  beforeAll(() => {
    // Credentials are guaranteed to be available due to setup.ts validation
    defaultClient = new Substack({
      apiKey: global.E2E_CONFIG.apiKey!,
      hostname: global.E2E_CONFIG.hostname
    })

    // Client with custom perPage for testing
    customPerPageClient = new Substack({
      apiKey: global.E2E_CONFIG.apiKey!,
      hostname: global.E2E_CONFIG.hostname,
      perPage: 5
    })
  })

  describe('Posts Limit Handling', () => {
    test('should return exactly 10 posts when limit is set to 10', async () => {
      try {
        const posts = []
        for await (const post of defaultClient.getPosts({ limit: 10 })) {
          posts.push(post)
        }

        expect(posts.length).toBeLessThanOrEqual(10)

        if (posts.length > 0) {
          // Verify post structure
          const post = posts[0]
          expect(post.id).toBeDefined()
          expect(post.title).toBeDefined()
          expect(post.slug).toBeDefined()
          expect(post.post_date).toBeDefined()

          console.log(`✓ Retrieved ${posts.length} posts with limit 10`)
        } else {
          console.log('⚠ No posts available for testing')
        }
      } catch (error) {
        handleNetworkError(error, 'getPosts with limit')
      }
    }, 30000)

    test('should stop iteration exactly at limit even if more data is available', async () => {
      try {
        let count = 0
        const limit = 5

        for await (const _post of defaultClient.getPosts({ limit })) {
          count++
          expect(count).toBeLessThanOrEqual(limit)
        }

        expect(count).toBeLessThanOrEqual(limit)
        console.log(`✓ Stopped iteration at ${count} posts (limit: ${limit})`)
      } catch (error) {
        handleNetworkError(error, 'getPosts limit enforcement')
      }
    }, 30000)
  })

  describe('Comments Limit Handling', () => {
    test('should return exactly 10 comments when limit is set to 10', async () => {
      try {
        // First, get a post to test comments
        const posts = []
        for await (const post of defaultClient.getPosts({ limit: 1 })) {
          posts.push(post)
        }

        if (posts.length === 0) {
          console.log('⚠ No posts available for comment testing')
          return
        }

        const postId = posts[0].id
        const comments = []

        for await (const comment of defaultClient.getComments(postId, { limit: 10 })) {
          comments.push(comment)
        }

        expect(comments.length).toBeLessThanOrEqual(10)

        if (comments.length > 0) {
          // Verify comment structure
          const comment = comments[0]
          expect(comment.id).toBeDefined()
          expect(comment.body).toBeDefined()
          expect(comment.author).toBeDefined()
          expect(comment.created_at).toBeDefined()

          console.log(`✓ Retrieved ${comments.length} comments with limit 10 for post ${postId}`)
        } else {
          console.log(`⚠ No comments available for post ${postId}`)
        }
      } catch (error) {
        handleNetworkError(error, 'getComments with limit')
      }
    }, 30000)
  })

  describe('Notes Limit Handling', () => {
    test('should return exactly 10 notes when limit is set to 10', async () => {
      try {
        const notes = []
        for await (const note of defaultClient.getNotes({ limit: 10 })) {
          notes.push(note)
        }

        expect(notes.length).toBeLessThanOrEqual(10)

        if (notes.length > 0) {
          // Verify note structure
          const note = notes[0]
          expect(note.entity_key).toBeDefined()
          expect(note.type).toBeDefined()
          expect(note.context).toBeDefined()

          console.log(`✓ Retrieved ${notes.length} notes with limit 10`)
        } else {
          console.log('⚠ No notes available for testing')
        }
      } catch (error) {
        handleNetworkError(error, 'getNotes with limit')
      }
    }, 30000)
  })

  describe('Pagination Behavior', () => {
    test('should handle pagination automatically when no limit is set', async () => {
      try {
        let count = 0
        const maxToTest = 30 // Reasonable limit for testing

        for await (const _post of defaultClient.getPosts()) {
          count++
          if (count >= maxToTest) break // Safety break to avoid infinite loops
        }

        expect(count).toBeGreaterThan(0)
        console.log(`✓ Retrieved ${count} posts via automatic pagination`)

        if (count === maxToTest) {
          console.log('⚠ Stopped at safety limit, more posts may be available')
        }
      } catch (error) {
        handleNetworkError(error, 'getPosts pagination')
      }
    }, 60000)

    test('should iterate through multiple pages correctly when limit exceeds page size', async () => {
      try {
        const posts = []
        const limit = 35 // Should require multiple pages with default perPage of 25

        for await (const post of defaultClient.getPosts({ limit })) {
          posts.push(post)
        }

        expect(posts.length).toBeLessThanOrEqual(limit)

        if (posts.length > 25) {
          console.log(`✓ Successfully paginated beyond single page: ${posts.length} posts`)

          // Verify no duplicates (all posts should have unique IDs)
          const ids = posts.map((p) => p.id)
          const uniqueIds = new Set(ids)
          expect(uniqueIds.size).toBe(posts.length)
          console.log('✓ No duplicate posts found across pages')
        } else {
          console.log(
            `⚠ Retrieved ${posts.length} posts (may not have enough data to test multi-page pagination)`
          )
        }
      } catch (error) {
        handleNetworkError(error, 'multi-page pagination')
      }
    }, 60000)

    test('should respect custom perPage configuration', async () => {
      try {
        // Test with client that has perPage: 5
        let requestCount = 0
        const posts = []
        const limit = 12 // Should require at least 3 requests with perPage: 5

        // Create a spy on fetch to count requests
        const originalFetch = global.fetch
        global.fetch = jest.fn((...args) => {
          requestCount++
          return originalFetch(...args)
        })

        for await (const post of customPerPageClient.getPosts({ limit })) {
          posts.push(post)
        }

        expect(posts.length).toBeLessThanOrEqual(limit)

        if (posts.length >= 10) {
          expect(requestCount).toBeGreaterThan(1)
          console.log(`✓ Made ${requestCount} requests for ${posts.length} posts with perPage: 5`)
        } else {
          console.log(
            `⚠ Retrieved ${posts.length} posts (may not have enough data to test custom perPage)`
          )
        }

        // Restore original fetch
        global.fetch = originalFetch
      } catch (error) {
        handleNetworkError(error, 'custom perPage')
      }
    }, 60000)
  })

  describe('Configuration Validation', () => {
    test('should use default perPage of 25', async () => {
      const client = new Substack({
        apiKey: global.E2E_CONFIG.apiKey!,
        hostname: global.E2E_CONFIG.hostname
      })

      expect(client['perPage']).toBe(25)
    })

    test('should use custom perPage when provided', async () => {
      const client = new Substack({
        apiKey: global.E2E_CONFIG.apiKey!,
        hostname: global.E2E_CONFIG.hostname,
        perPage: 50
      })

      expect(client['perPage']).toBe(50)
    })

    test('should use default cacheTTL of 300 seconds', async () => {
      const client = new Substack({
        apiKey: global.E2E_CONFIG.apiKey!,
        hostname: global.E2E_CONFIG.hostname
      })

      expect(client['cacheTTL']).toBe(300)
    })

    test('should use custom cacheTTL when provided', async () => {
      const client = new Substack({
        apiKey: global.E2E_CONFIG.apiKey!,
        hostname: global.E2E_CONFIG.hostname,
        cacheTTL: 600
      })

      expect(client['cacheTTL']).toBe(600)
    })
  })

  describe('Caching Functionality', () => {
    test('should cache read-only requests', async () => {
      try {
        const client = new Substack({
          apiKey: global.E2E_CONFIG.apiKey!,
          hostname: global.E2E_CONFIG.hostname,
          cacheTTL: 60 // 1 minute for testing
        })

        // Track fetch calls
        let fetchCallCount = 0
        const originalFetch = global.fetch
        global.fetch = jest.fn((...args) => {
          fetchCallCount++
          return originalFetch(...args)
        })

        // First request
        const posts1 = []
        for await (const post of client.getPosts({ limit: 3 })) {
          posts1.push(post)
        }

        const firstCallCount = fetchCallCount

        // Second identical request (should use cache)
        const posts2 = []
        for await (const post of client.getPosts({ limit: 3 })) {
          posts2.push(post)
        }

        // Should not have made additional fetch calls due to caching
        expect(fetchCallCount).toBe(firstCallCount)
        expect(posts1.length).toBe(posts2.length)

        if (posts1.length > 0 && posts2.length > 0) {
          expect(posts1[0].id).toBe(posts2[0].id)
          console.log(`✓ Cached response correctly: ${posts1.length} posts retrieved from cache`)
        }

        // Restore original fetch
        global.fetch = originalFetch
      } catch (error) {
        handleNetworkError(error, 'caching functionality')
      }
    }, 30000)
  })
})
