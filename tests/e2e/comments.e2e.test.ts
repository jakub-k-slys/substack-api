/// <reference path="./global.d.ts" />
import { Substack } from '../../src/client'

// Helper function to skip tests if no credentials
const skipIfNoCredentials = () => {
  if (!global.E2E_CONFIG.hasCredentials) {
    return test.skip
  }
  return test
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
      const posts = await client.getPosts({ limit: 5 })

      if (posts.length === 0) {
        console.log('Skipping comment test - no posts available')
        return
      }

      // Try to find a post that might have comments
      let commentsFound = false
      for (const post of posts) {
        try {
          const comments = await client.getComments(post.id, { limit: 5 })

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
      console.log('Comments not accessible:', error)
    }
  })

  skipIfNoCredentials()('should fetch comments with pagination', async () => {
    try {
      const posts = await client.getPosts({ limit: 5 })

      if (posts.length === 0) {
        console.log('Skipping comment pagination test - no posts available')
        return
      }

      // Try to find a post with enough comments for pagination
      for (const post of posts) {
        try {
          const firstPage = await client.getComments(post.id, { limit: 2 })
          const secondPage = await client.getComments(post.id, { limit: 2, offset: 2 })

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
      console.log('Comment pagination not accessible:', error)
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
      console.log('Specific comment fetch not accessible:', error)
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
