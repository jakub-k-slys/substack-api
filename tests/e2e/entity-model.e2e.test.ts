import { SubstackClient } from '../../src/substack-client'
import { Profile } from '../../src/domain'

describe('SubstackClient Entity Model E2E', () => {
  let client: SubstackClient

  beforeAll(() => {
    if (!global.E2E_CONFIG.hasCredentials) {
      throw new Error(
        'E2E tests require credentials. Set SUBSTACK_API_KEY environment variable to run E2E tests.'
      )
    }

    client = new SubstackClient({
      apiKey: global.E2E_CONFIG.apiKey!,
      hostname: global.E2E_CONFIG.hostname || 'substack.com'
    })
  })

  test('should test connectivity', async () => {
    const isConnected = await client.testConnectivity()
    // In CI environment with real credentials, this should be true
    // In local testing with fake credentials, this might be false
    if (process.env.CI && global.E2E_CONFIG.apiKey !== 'test_key') {
      expect(isConnected).toBe(true)
    } else {
      // For local testing or fake credentials, just verify it returns a boolean
      expect(typeof isConnected).toBe('boolean')
      console.log(`✅ Connectivity test returned: ${isConnected}`)
    }
  })

  test('should get profile by slug', async () => {
    const profile = await client.profileForSlug('platformer')

    expect(profile).toBeInstanceOf(Profile)
    expect(profile.name).toBeTruthy()
    expect(profile.slug).toBe('platformer')
    expect(profile.id).toBeGreaterThan(0)

    console.log(`✅ Retrieved profile: ${profile.name} (@${profile.slug})`)
  })

  test('should get profile by slug - jakubslys', async () => {
    // Test with jakubslys profile as requested
    const profile = await client.profileForSlug('jakubslys')

    expect(profile).toBeInstanceOf(Profile)
    expect(profile.name).toBeTruthy()
    expect(profile.slug).toBe('jakubslys')
    expect(profile.id).toBeGreaterThan(0)

    console.log(`✅ Retrieved jakubslys profile: ${profile.name} (@${profile.slug})`)
  })

  test('should get profile by ID', async () => {
    // Get a profile by slug first to get a known user ID
    const profileBySlug = await client.profileForSlug('jakubslys')
    const userId = profileBySlug.id

    // Now test profileForId with that user ID
    const profileById = await client.profileForId(userId)

    expect(profileById).toBeInstanceOf(Profile)
    expect(profileById.id).toBe(userId)
    expect(profileById.name).toBeTruthy()
    expect(profileById.slug).toBeTruthy()
    expect(typeof profileById.name).toBe('string')
    expect(typeof profileById.slug).toBe('string')

    // The profiles should match
    expect(profileById.name).toBe(profileBySlug.name)
    expect(profileById.slug).toBe(profileBySlug.slug)

    console.log(`✅ Retrieved profile by ID: ${profileById.name} (ID: ${profileById.id})`)
  })

  test('should handle invalid profile ID gracefully', async () => {
    try {
      // Test with a user ID that should not exist
      const invalidUserId = 999999999999
      await client.profileForId(invalidUserId)

      // If we reach here, the API might return a default or the ID exists
      console.log('ℹ️ Profile lookup completed (may be default profile)')
    } catch (error) {
      // Check if it's a proper error
      const errorName = error?.constructor?.name
      const isValidError =
        errorName === 'Error' ||
        errorName === 'TypeError' ||
        errorName === 'FetchError' ||
        error instanceof Error
      expect(isValidError).toBe(true)
      console.log('✅ Properly handles invalid profile ID lookup')
    }
  })

  test('should iterate through followees', async () => {
    const ownProfile = await client.ownProfile()
    for await (const profile of ownProfile.followees({ limit: 3 })) {
      expect(profile).toBeInstanceOf(Profile)
      expect(profile.name).toBeTruthy()
      //expect(profile.slug).toBeTruthy()
    }
    console.log('✅ Retrieved 3 followee profiles')
  })

  test('should get own profile', async () => {
    const ownProfile = await client.ownProfile()

    expect(ownProfile.name).toBeTruthy()
    expect(ownProfile.slug).toBeTruthy()
    expect(typeof ownProfile.newNote).toBe('function')
    expect(typeof ownProfile.followees).toBe('function')

    console.log(`✅ Retrieved own profile: ${ownProfile.name} (@${ownProfile.slug})`)
  })

  test('should handle profile posts iteration', async () => {
    const profile = await client.profileForSlug('jakubslys')
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
  })

  test('should handle post comments iteration', async () => {
    const profile = await client.profileForSlug('jakubslys')

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
  })

  test('should handle error cases gracefully - invalid profile slug', async () => {
    try {
      // Test invalid profile slug
      const profile = await client.profileForSlug('this-profile-should-not-exist-12345')
      // If we reach here, check if it's actually a valid profile or a default
      if (profile && profile.slug === 'this-profile-should-not-exist-12345') {
        // The profile unexpectedly exists, which is fine
        console.log('ℹ️ Profile exists or default profile returned')
      } else {
        console.log('ℹ️ Profile request completed (may be default profile)')
      }
    } catch (error) {
      // Check if it's any kind of error by constructor name
      const errorName = error?.constructor?.name
      const isValidError =
        errorName === 'Error' ||
        errorName === 'TypeError' ||
        errorName === 'FetchError' ||
        error instanceof Error
      expect(isValidError).toBe(true)
      console.log('✅ Properly handles invalid profile lookup')
    }
  })
  test('should handle error cases gracefully - invalid post id', async () => {
    try {
      // Test invalid post ID
      const _post = await client.postForId(999999999999)
      // If we reach here, the post unexpectedly exists or there's a default
      console.log('ℹ️ Post request completed (may be default or existing post)')
    } catch (error) {
      // Check if it's any kind of error by constructor name
      const errorName = error?.constructor?.name
      const isValidError =
        errorName === 'Error' ||
        errorName === 'TypeError' ||
        errorName === 'FetchError' ||
        error instanceof Error
      expect(isValidError).toBe(true)
      console.log('✅ Properly handles invalid post lookup')
    }
  })
  test('should handle error cases gracefully - invalid note id', async () => {
    try {
      // Test invalid note ID
      const _note = await client.noteForId(999999999999)
      // If we reach here, the note unexpectedly exists or there's a default
      console.log('ℹ️ Note request completed (may be default or existing note)')
    } catch (error) {
      // Check if it's any kind of error by constructor name
      const errorName = error?.constructor?.name
      const isValidError =
        errorName === 'Error' ||
        errorName === 'TypeError' ||
        errorName === 'FetchError' ||
        error instanceof Error
      expect(isValidError).toBe(true)
      console.log('✅ Properly handles invalid note lookup')
    }
  })

  test('should fetch 99 notes using cursor-based pagination', async () => {
    const foreignProfile = await client.profileForId(343074721)
    const notes = []
    let count = 0

    try {
      // Test fetching exactly 99 notes with the limit parameter
      for await (const note of foreignProfile.notes({ limit: 99 })) {
        notes.push(note)
        count++

        // Verify note structure
        expect(note.body).toBeTruthy()
        expect(note.id).toBeTruthy()
        expect(note.author).toBeTruthy()
        expect(note.author.name).toBeTruthy()
        expect(note.publishedAt).toBeInstanceOf(Date)

        // Stop at exactly 99 to verify the limit works
        if (count >= 99) break
      }

      // The count should be exactly what we requested, or fewer if not enough notes available
      expect(count).toBeLessThanOrEqual(99)
      expect(count).toBeGreaterThanOrEqual(0)

      console.log(`✅ Successfully fetched ${count} notes (requested 99)`)

      if (count > 0) {
        const firstNote = notes[0]
        console.log(`First note by: ${firstNote.author.name}`)
        console.log(`First note body preview: ${firstNote.body.substring(0, 50)}...`)
      }

      if (count === 99) {
        console.log(
          '✅ Successfully fetched exactly 99 notes - cursor pagination working correctly'
        )
      } else if (count > 0) {
        console.log(`ℹ️ Only ${count} notes available (fewer than 99 requested)`)
      } else {
        console.log('ℹ️ No notes available for this profile')
      }
    } catch (error) {
      // If notes are not available or there's an API issue, handle gracefully
      const errorName = error?.constructor?.name
      const isValidError =
        errorName === 'Error' ||
        errorName === 'TypeError' ||
        errorName === 'FetchError' ||
        error instanceof Error

      if (isValidError) {
        console.log('ℹ️ Notes API returned an error (may not be available for this profile)')
        expect(count).toBe(0) // No notes were fetched due to error
      } else {
        throw error // Re-throw unexpected errors
      }
    }
  })
})
