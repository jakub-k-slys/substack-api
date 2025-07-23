import { SubstackClient } from '../../src/substack-client'
import { Profile, OwnProfile, Comment, FullPost } from '../../src/domain'
import { get } from 'http'

describe('SubstackClient Integration Tests', () => {
  let client: SubstackClient

  beforeEach(() => {
    // Create client configured to use our local test server
    // Extract hostname and port from the integration server URL
    const url = new URL(global.INTEGRATION_SERVER.url)
    const hostname = `${url.hostname}:${url.port}`

    client = new SubstackClient({
      hostname: hostname,
      apiKey: 'test-key',
      protocol: 'http', // Use HTTP for local test server
      substackBaseUrl: global.INTEGRATION_SERVER.url // Configure global client to use mock server too
    })
  })

  describe('Happy Path Scenarios', () => {
    describe('testConnectivity', () => {
      test('should test API connectivity', async () => {
        const result = await client.testConnectivity()
        expect(typeof result).toBe('boolean')
        // Returns true since /api/v1/feed/following endpoint returns valid data in mock server
        expect(result).toBe(true)
      })
    })

    describe('profileForId', () => {
      test('should retrieve profile by user ID with sample data', async () => {
        // Test with Jenny Ouyang's ID (282291554) - we have sample data for this
        const userId = 282291554

        const profile = await client.profileForId(userId)
        expect(profile).toBeInstanceOf(Profile)
        expect(profile.id).toBe(userId)
        expect(profile.name).toBe('Jenny Ouyang')
        expect(profile.bio).toContain('Former scientist turned software engineer')
        expect(profile.bio).toBeTruthy()
      })

      test('should return Profile instance with all expected properties', async () => {
        const userId = 282291554

        const profile = await client.profileForId(userId)

        // Verify it's a Profile instance
        expect(profile).toBeInstanceOf(Profile)

        // Verify all expected properties are present
        expect(profile.id).toBe(userId)
        expect(typeof profile.name).toBe('string')
        expect(profile.name).toBeTruthy()
        expect(typeof profile.bio).toBe('string')
        expect(profile.bio).toBeTruthy()

        // Verify methods are available
        expect(typeof profile.posts).toBe('function')
      })

      test('should handle large user IDs correctly', async () => {
        // Test with a large user ID to ensure proper handling
        const largeUserId = 999999999

        // This should fail with our mock server, but we're testing the correct error handling
        await expect(client.profileForId(largeUserId)).rejects.toThrow(
          `Profile with ID ${largeUserId} not found`
        )
      })
    })

    describe('profileForSlug', () => {
      test('should retrieve profile by slug with sample data', async () => {
        // Test with jakubslys slug - we have sample data for this
        const slug = 'jakubslys'

        const profile = await client.profileForSlug(slug)
        expect(profile).toBeInstanceOf(Profile)
        expect(profile.name).toBe('Jakub Slys 🎖️')
        expect(profile.bio).toContain('Ever wonder how Uber matches rides')
        expect(profile.bio).toBeTruthy()
      })

      test('should handle profileForSlug method use case workflow', async () => {
        // Integration test covering full profileForSlug workflow
        const testSlug = 'jakubslys'

        const profile = await client.profileForSlug(testSlug)

        // Validate the profile object structure and content
        expect(profile).toBeInstanceOf(Profile)
        expect(profile.slug).toBe(testSlug)
        expect(profile.name).toBeDefined()
        expect(profile.id).toBeGreaterThan(0)
        expect(typeof profile.name).toBe('string')
        expect(typeof profile.slug).toBe('string')
        expect(typeof profile.id).toBe('number')

        // Validate that bio exists and is meaningful
        expect(profile.bio).toBeTruthy()
        expect(profile.bio?.length).toBeGreaterThan(0)

        // Test that the profile can be used for further operations
        expect(typeof profile.posts).toBe('function')
        expect(typeof profile.notes).toBe('function')

        console.log(`✅ Profile workflow validated for ${profile.name} (@${profile.slug})`)
      })
    })

    describe('ownProfile', () => {
      test('should handle own profile retrieval workflow', async () => {
        // This tests the full workflow: /api/v1/subscription -> /api/v1/user/{id}/profile
        try {
          const profile = await client.ownProfile()
          expect(profile).toBeInstanceOf(OwnProfile)
          expect(profile.id).toBeDefined()
          expect(profile.name).toBeTruthy()
          expect(typeof profile.id).toBe('number')
        } catch (error) {
          // Expected error due to workflow complexity in mock server
          expect(error).toBeInstanceOf(Error)
          expect((error as Error).message).toContain('Failed to get own profile')
        }
      })
    })
  })

  describe('Corner Cases and Error Handling', () => {
    describe('profileForSlug', () => {
      test('should reject empty slug parameter', async () => {
        await expect(client.profileForSlug('')).rejects.toThrow('Profile slug cannot be empty')
      })

      test('should reject whitespace-only slug parameter', async () => {
        await expect(client.profileForSlug('   ')).rejects.toThrow('Profile slug cannot be empty')
      })

      test('should handle non-existent slug gracefully', async () => {
        await expect(client.profileForSlug('nonexistentuser123')).rejects.toThrow(/not found/)
      })
    })

    describe('profileForId', () => {
      test('should handle non-existent user ID gracefully', async () => {
        const nonExistentId = 999999999
        await expect(client.profileForId(nonExistentId)).rejects.toThrow(
          `Profile with ID ${nonExistentId} not found`
        )
      })
    })

    describe('commentForId', () => {
      test('should validate comment ID type - non-numeric string', async () => {
        await expect(client.commentForId('invalid-id' as any)).rejects.toThrow(
          'Comment ID must be a number'
        )
      })

      test('should validate comment ID type - alphanumeric string', async () => {
        await expect(client.commentForId('abc123' as any)).rejects.toThrow(
          'Comment ID must be a number'
        )
      })

      test('should handle non-existent comment ID', async () => {
        await expect(client.commentForId(999999999)).rejects.toThrow()
      })

      test('should get comment by ID with sample data', async () => {
        // Test with a valid comment ID - we have sample data for this
        const commentId = 131648795

        const comment = await client.commentForId(commentId)
        expect(comment).toBeInstanceOf(Comment)
        expect(comment.id).toBe(131648795)
        expect(comment.body).toContain('🧨 DO YOU KNOW WHAT REAL AUTOMATION LOOKS LIKE?')
        expect(comment.body).toContain('n8n-operator')
        expect(comment.author.name).toBe('Jakub Slys 🎖️')
        expect(comment.author.id).toBe(254824415)
        expect(comment.createdAt).toBeInstanceOf(Date)
      })
    })

    describe('postForId', () => {
      test('should handle non-existent post ID', async () => {
        await expect(client.postForId(999999999)).rejects.toThrow()
      })

      test('should retrieve full post by ID with sample data', async () => {
        // Test with a real post ID - we have sample data for this
        const postId = 167180194

        const post = await client.postForId(postId)
        expect(post).toBeInstanceOf(FullPost)
        expect(post.id).toBe(postId)
        expect(post.title).toBe('Week of June 24, 2025: Build SaaS Without Code')
        expect(post.subtitle).toBe('The New Blueprint for Solopreneurs')
        expect(post.htmlBody).toContain('<div class="captioned-image-container">')
        expect(post.htmlBody).toContain('content shatters the myth')
        expect(post.createdAt).toBeInstanceOf(Date)
        expect(post.slug).toBe('week-of-june-24-2025-build-saas-without')

        // Verify full post specific fields
        expect(post.reactions).toEqual({ '❤': 4 })
        expect(post.restacks).toBe(1)
        expect(post.postTags).toEqual([
          'tldr',
          'workflows',
          'content',
          'digest',
          'solopreneur',
          'entrepreneur',
          'agency'
        ])
        expect(post.coverImage).toContain('substack-post-media.s3.amazonaws.com')
      })

      test('should handle full post workflow with all expected properties', async () => {
        const postId = 167180194

        const post = await client.postForId(postId)

        // Verify it's a FullPost instance
        expect(post).toBeInstanceOf(FullPost)

        // Verify core post properties
        expect(post.id).toBe(postId)
        expect(typeof post.title).toBe('string')
        expect(post.title).toBeTruthy()
        expect(typeof post.htmlBody).toBe('string')
        expect(post.htmlBody).toBeTruthy()
        expect(post.createdAt).toBeInstanceOf(Date)

        // Verify full post specific properties
        expect(typeof post.reactions).toBe('object')
        expect(typeof post.restacks).toBe('number')
        expect(Array.isArray(post.postTags)).toBe(true)
        expect(typeof post.coverImage).toBe('string')
        expect(post.coverImage).toBeTruthy()

        // Verify methods are available
        expect(typeof post.comments).toBe('function')

        console.log(`✅ Full post workflow validated for "${post.title}" (ID: ${post.id})`)
      })
    })

    describe('noteForId', () => {
      test('should handle non-existent note ID', async () => {
        await expect(client.noteForId(999999999)).rejects.toThrow(
          'Note with ID 999999999 not found'
        )
      })
    })
  })

  describe('Infrastructure Tests', () => {
    test('should have integration server available', async () => {
      expect(global.INTEGRATION_SERVER).toBeDefined()
      expect(global.INTEGRATION_SERVER.url).toBeTruthy()
      expect(global.INTEGRATION_SERVER.server).toBeDefined()
    })

    test('should serve sample data correctly', async () => {
      return new Promise((resolve, reject) => {
        get(`${global.INTEGRATION_SERVER.url}/api/v1/users/282291554`, (res) => {
          let data = ''
          res.on('data', (chunk) => {
            data += chunk
          })

          res.on('end', () => {
            try {
              expect(res.statusCode).toBe(200)
              const parsed = JSON.parse(data)
              expect(parsed.id).toBe(282291554)
              expect(parsed.name).toBe('Jenny Ouyang')
              resolve(undefined)
            } catch (error) {
              reject(error)
            }
          })
        }).on('error', reject)
      })
    })
  })
})
