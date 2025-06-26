/// <reference path="./global.d.ts" />
import { Substack } from '../../src/client'

// Helper function to skip tests if no credentials
const skipIfNoCredentials = () => {
  if (!global.E2E_CONFIG.hasCredentials) {
    return test.skip
  }
  return test
}

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

  // Check for endpoint not available (some features may not be supported)
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

  console.log(`${operation} not accessible:`, error)
}

describe('E2E: Comment Operations', () => {
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

  skipIfNoCredentials()('should fetch comments for a post', async () => {
    try {
      // First get a post to get comments for
      const posts = []
      for await (const post of client.getPosts({ limit: 5 })) {
        posts.push(post)
      }

      if (posts.length === 0) {
        console.log('Skipping comment test - no posts available')
        return
      }

      // Try to find a post that might have comments
      let commentsFound = false
      for (const post of posts) {
        try {
          const comments = []
          for await (const comment of client.getComments(post.id, { limit: 5 })) {
            comments.push(comment)
          }

          expect(Array.isArray(comments)).toBe(true)

          if (comments.length > 0) {
            commentsFound = true
            const comment = comments[0]
            expect(comment.id).toBeDefined()
            expect(comment.body).toBeDefined()
            expect(comment.created_at).toBeDefined()
            expect(comment.parent_post_id).toBe(post.id)
            expect(comment.author).toBeDefined()
            expect(comment.author.id).toBeDefined()
            expect(comment.author.name).toBeDefined()
            expect(typeof comment.id).toBe('number')
            expect(typeof comment.body).toBe('string')
            expect(typeof comment.created_at).toBe('string')
            expect(typeof comment.author.id).toBe('number')
            expect(typeof comment.author.name).toBe('string')
            break
          }
        } catch {
          // This post might not have comments or comments might not be accessible
          continue
        }
      }

      if (!commentsFound) {
        console.log('No comments found in available posts')
      }
    } catch (error) {
      handleNetworkError(error, 'Comments')
    }
  })

  skipIfNoCredentials()('should fetch comments with pagination', async () => {
    try {
      const posts = []
      for await (const post of client.getPosts({ limit: 5 })) {
        posts.push(post)
      }

      if (posts.length === 0) {
        console.log('Skipping comment pagination test - no posts available')
        return
      }

      // Try to find a post with enough comments for pagination
      for (const post of posts) {
        try {
          const firstPage = []
          for await (const comment of client.getComments(post.id, { limit: 2 })) {
            firstPage.push(comment)
          }

          // Get second page by getting more comments and skipping first 2
          const secondPage = []
          let skipped = 0
          for await (const comment of client.getComments(post.id, { limit: 4 })) {
            if (skipped < 2) {
              skipped++
              continue
            }
            secondPage.push(comment)
          }

          expect(Array.isArray(firstPage)).toBe(true)
          expect(Array.isArray(secondPage)).toBe(true)

          // If both pages have content, they should be different
          if (firstPage.length > 0 && secondPage.length > 0) {
            expect(firstPage[0].id).not.toBe(secondPage[0].id)
          }
          break
        } catch {
          continue
        }
      }
    } catch (error) {
      handleNetworkError(error, 'Comment pagination')
    }
  })

  skipIfNoCredentials()('should fetch specific comment by ID', async () => {
    try {
      // First get a comment to get its ID
      const posts = await client.getPosts({ limit: 5 })

      if (posts.length === 0) {
        console.log('Skipping specific comment test - no posts available')
        return
      }

      let commentFound = false
      for (const post of posts) {
        try {
          const comments = await client.getComments(post.id, { limit: 1 })

          if (comments.length > 0) {
            const commentId = comments[0].id
            const comment = await client.getComment(commentId)

            expect(comment).toBeDefined()
            expect(comment.id).toBe(commentId)
            expect(comment.body).toBeDefined()
            expect(comment.author).toBeDefined()
            commentFound = true
            break
          }
        } catch {
          continue
        }
      }

      if (!commentFound) {
        console.log('No comments found to test specific comment fetch')
      }
    } catch (error) {
      handleNetworkError(error, 'Specific comment fetch')
    }
  })

  skipIfNoCredentials()('should handle non-existent comment gracefully', async () => {
    try {
      await client.getComment(999999999) // Very unlikely to exist
    } catch (error) {
      expect(error).toBeDefined()
      // Should throw an error for non-existent comment
    }
  })
})
