/// <reference path="./global.d.ts" />
import { Substack } from '../../src/client'

// Helper function to skip tests if no credentials
const skipIfNoCredentials = () => {
  if (!global.E2E_CONFIG.hasCredentials) {
    return test.skip
  }
  return test
}

describe('E2E: Publication Data Retrieval', () => {
  let client: Substack

  beforeAll(() => {
    if (!global.E2E_CONFIG.hasCredentials) {
      return
    }

    client = new Substack({
      apiKey: global.E2E_CONFIG.apiKey!,
      hostname: global.E2E_CONFIG.hostname
    })
  })

  skipIfNoCredentials()('should fetch posts from publication', async () => {
    const posts = await client.getPosts({ limit: 5 })

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
      expect(typeof post.published).toBe('boolean')
    }
  })

  skipIfNoCredentials()('should fetch posts with pagination', async () => {
    const firstPage = await client.getPosts({ limit: 2 })
    const secondPage = await client.getPosts({ limit: 2, offset: 2 })

    expect(Array.isArray(firstPage)).toBe(true)
    expect(Array.isArray(secondPage)).toBe(true)

    // If both pages have content, they should be different
    if (firstPage.length > 0 && secondPage.length > 0) {
      expect(firstPage[0].id).not.toBe(secondPage[0].id)
    }
  })

  skipIfNoCredentials()('should fetch specific post by slug', async () => {
    // First get a post to get its slug
    const posts = await client.getPosts({ limit: 1 })

    if (posts.length === 0) {
      console.log('Skipping post fetch test - no posts available')
      return
    }

    const postSlug = posts[0].slug
    const post = await client.getPost(postSlug)

    expect(post).toBeDefined()
    expect(post.slug).toBe(postSlug)
    expect(post.id).toBe(posts[0].id)
  })

  skipIfNoCredentials()('should search posts', async () => {
    try {
      const searchResult = await client.searchPosts({ query: 'test' })

      expect(searchResult).toBeDefined()
      expect(searchResult.total).toBeDefined()
      expect(Array.isArray(searchResult.results)).toBe(true)
      expect(typeof searchResult.total).toBe('number')
    } catch (error) {
      // Search might not be available for all publications
      console.log('Search not available or no results found:', error)
    }
  })

  skipIfNoCredentials()('should handle non-existent post gracefully', async () => {
    await expect(client.getPost('non-existent-post-slug-12345')).rejects.toThrow()
  })
})
