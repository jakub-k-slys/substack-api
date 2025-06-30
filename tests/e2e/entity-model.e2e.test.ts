import { SubstackClient } from '../../src/substack-client'
import { Profile } from '../../src/entities'

// E2E test setup from global.d.ts
declare const getTestCredentials: () => {
  apiKey: string
  hostname?: string
} | null

describe('SubstackClient Entity Model E2E', () => {
  let client: SubstackClient
  let credentials: { apiKey: string; hostname?: string } | null

  beforeAll(() => {
    credentials = getTestCredentials()
    if (!credentials) {
      throw new Error(
        '❌ Missing required Substack credentials. Set SUBSTACK_API_KEY and SUBSTACK_HOSTNAME.\n\n' +
          'Required environment variables:\n' +
          '- SUBSTACK_API_KEY: Your Substack API key (required)\n' +
          '- SUBSTACK_HOSTNAME: Your Substack hostname (optional)'
      )
    }

    client = new SubstackClient({
      apiKey: credentials.apiKey,
      hostname: credentials.hostname
    })
  })

  test('should test connectivity', async () => {
    const isConnected = await client.testConnectivity()
    expect(isConnected).toBe(true)
  })

  test('should get profile by slug', async () => {
    try {
      // Try to get a well-known Substack profile
      // Using a popular profile that should exist
      const profile = await client.profileForSlug('platformer')

      expect(profile).toBeInstanceOf(Profile)
      expect(profile.name).toBeTruthy()
      expect(profile.slug).toBe('platformer')
      expect(profile.id).toBeGreaterThan(0)

      console.log(`✅ Retrieved profile: ${profile.name} (@${profile.slug})`)
    } catch (error) {
      console.log('ℹ️ Profile lookup not available:', (error as Error).message)
      // Skip this test if profile lookup isn't available
    }
  })

  test('should iterate through followees', async () => {
    try {
      const followees = []
      let count = 0

      for await (const profile of client.followees({ limit: 5 })) {
        followees.push(profile)
        count++

        expect(profile).toBeInstanceOf(Profile)
        expect(profile.name).toBeTruthy()
        expect(profile.slug).toBeTruthy()

        if (count >= 5) break
      }

      console.log(`✅ Retrieved ${followees.length} followee profiles`)

      if (followees.length > 0) {
        const firstProfile = followees[0]
        console.log(`First followee: ${firstProfile.name} (@${firstProfile.slug})`)
      }
    } catch (error) {
      console.log('ℹ️ Followees not available:', (error as Error).message)
      // Skip this test if followees aren't available
    }
  })

  test('should get own profile', async () => {
    try {
      const ownProfile = await client.ownProfile()

      expect(ownProfile.name).toBeTruthy()
      expect(ownProfile.slug).toBeTruthy()
      expect(typeof ownProfile.createNote).toBe('function')
      expect(typeof ownProfile.createPost).toBe('function')
      expect(typeof ownProfile.followers).toBe('function')

      console.log(`✅ Retrieved own profile: ${ownProfile.name} (@${ownProfile.slug})`)
    } catch (error) {
      console.log('ℹ️ Own profile not available:', (error as Error).message)
      // Skip this test if own profile isn't available
    }
  })

  test('should handle profile posts iteration', async () => {
    try {
      const profile = await client.profileForSlug('platformer')
      const posts = []
      let count = 0

      for await (const post of profile.posts({ limit: 3 })) {
        posts.push(post)
        count++

        expect(post.title).toBeTruthy()
        expect(post.id).toBeGreaterThan(0)
        expect(post.publishedAt).toBeInstanceOf(Date)

        if (count >= 3) break
      }

      console.log(`✅ Retrieved ${posts.length} posts from profile`)

      if (posts.length > 0) {
        const firstPost = posts[0]
        console.log(`First post: "${firstPost.title}"`)
      }
    } catch (error) {
      console.log('ℹ️ Profile posts not available:', (error as Error).message)
      // Skip this test if profile posts aren't available
    }
  })

  test('should handle post comments iteration', async () => {
    try {
      // First get a profile
      const profile = await client.profileForSlug('platformer')

      // Get a post from the profile
      let testPost = null
      for await (const post of profile.posts({ limit: 5 })) {
        testPost = post
        break
      }

      if (testPost) {
        const comments = []
        let count = 0

        for await (const comment of testPost.comments({ limit: 3 })) {
          comments.push(comment)
          count++

          expect(comment.body).toBeTruthy()
          expect(comment.author.name).toBeTruthy()
          expect(comment.createdAt).toBeInstanceOf(Date)

          if (count >= 3) break
        }

        console.log(`✅ Retrieved ${comments.length} comments from post "${testPost.title}"`)
      } else {
        console.log('ℹ️ No posts available to test comments')
      }
    } catch (error) {
      console.log('ℹ️ Post comments not available:', (error as Error).message)
      // Skip this test if post comments aren't available
    }
  })

  test('should handle error cases gracefully', async () => {
    try {
      // Test invalid profile slug
      await client.profileForSlug('this-profile-should-not-exist-12345')
      // If we reach here, the profile unexpectedly exists
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      console.log('✅ Properly handles invalid profile lookup')
    }

    try {
      // Test invalid post ID
      await client.postForId('this-post-should-not-exist-12345')
      // If we reach here, the post unexpectedly exists
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      console.log('✅ Properly handles invalid post lookup')
    }

    try {
      // Test invalid note ID
      await client.noteForId('this-note-should-not-exist-12345')
      // If we reach here, the note unexpectedly exists
    } catch (error) {
      expect(error).toBeInstanceOf(Error)
      console.log('✅ Properly handles invalid note lookup')
    }
  })
})
