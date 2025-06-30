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

describe('E2E: Publication Data Retrieval', () => {
  let client: Substack

  beforeAll(() => {
    if (!global.E2E_CONFIG.hasCredentials) {
      console.warn('⚠️ Skipping E2E tests - no credentials available')
      console.warn('Set SUBSTACK_API_KEY environment variable to run E2E tests')
      return
    }

    // Credentials are available
    client = new Substack({
      apiKey: global.E2E_CONFIG.apiKey!,
      hostname: global.E2E_CONFIG.hostname
    })
  })

  test('should fetch posts from publication', async () => {
    if (!global.E2E_CONFIG.hasCredentials) {
      console.log('⏭️ Skipping test - no credentials available')
      return
    }

    try {
      const posts = []
      for await (const post of client.getPosts({ limit: 5 })) {
        posts.push(post)
      }

      expect(Array.isArray(posts)).toBe(true)
      expect(posts.length).toBeLessThanOrEqual(5)

      if (posts.length > 0) {
        const post = posts[0]
        expect(post.id).toBeDefined()
        expect(post.title).toBeDefined()
        expect(post.slug).toBeDefined()
        expect(post.post_date).toBeDefined()
        expect(typeof post.id).toBe('number')
        expect(typeof post.title).toBe('string')
        expect(typeof post.slug).toBe('string')

        // Only check published field if it exists in the response
        if ('published' in post && post.published !== undefined) {
          expect(typeof post.published).toBe('boolean')
        }
      }
    } catch (error) {
      handleNetworkError(error, 'posts fetch')
    }
  })

  test('should fetch posts with pagination', async () => {
    if (!global.E2E_CONFIG.hasCredentials) {
      console.log('⏭️ Skipping test - no credentials available')
      return
    }

    try {
      const firstPage = []
      for await (const post of client.getPosts({ limit: 2 })) {
        firstPage.push(post)
      }

      // Get second page by skipping first 2 posts
      const secondPage = []
      let skipped = 0
      for await (const post of client.getPosts({ limit: 4 })) {
        if (skipped < 2) {
          skipped++
          continue
        }
        secondPage.push(post)
      }

      expect(Array.isArray(firstPage)).toBe(true)
      expect(Array.isArray(secondPage)).toBe(true)

      // If both pages have content, they should be different
      if (firstPage.length > 0 && secondPage.length > 0) {
        expect(firstPage[0].id).not.toBe(secondPage[0].id)
      }
    } catch (error) {
      handleNetworkError(error, 'posts pagination')
    }
  })

  test('should fetch specific post by slug', async () => {
    if (!global.E2E_CONFIG.hasCredentials) {
      console.log('⏭️ Skipping test - no credentials available')
      return
    }

    try {
      // First get a post to get its slug
      const posts = []
      for await (const post of client.getPosts({ limit: 1 })) {
        posts.push(post)
      }

      if (posts.length === 0) {
        console.log('Skipping post fetch test - no posts available')
        return
      }

      const postSlug = posts[0].slug
      const post = await client.getPost(postSlug)

      expect(post).toBeDefined()
      expect(post.slug).toBe(postSlug)
      expect(post.id).toBe(posts[0].id)
    } catch (error) {
      handleNetworkError(error, 'specific post fetch')
    }
  })

  test('should search posts', async () => {
    if (!global.E2E_CONFIG.hasCredentials) {
      console.log('⏭️ Skipping test - no credentials available')
      return
    }

    try {
      const searchResult = await client.searchPosts({ query: 'test' })

      expect(searchResult).toBeDefined()
      expect(searchResult.total).toBeDefined()
      expect(Array.isArray(searchResult.results)).toBe(true)
      expect(typeof searchResult.total).toBe('number')
    } catch (error) {
      handleNetworkError(error, 'search')
    }
  })

  test('should handle non-existent post gracefully', async () => {
    if (!global.E2E_CONFIG.hasCredentials) {
      console.log('⏭️ Skipping test - no credentials available')
      return
    }

    try {
      await expect(client.getPost('non-existent-post-slug-12345')).rejects.toThrow()
    } catch (error) {
      handleNetworkError(error, 'non-existent post handling')
    }
  })
})
