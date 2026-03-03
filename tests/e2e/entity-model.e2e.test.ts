import { SubstackClient } from '@substack-api/substack-client'
import { PreviewPost, Profile, Comment } from '@substack-api/domain'
import { validateE2ECredentials } from '@test/e2e/checkEnv'

describe('SubstackClient Entity Model E2E', () => {
  let client: SubstackClient

  beforeAll(() => {
    const { token, publicationUrl } = validateE2ECredentials()
    client = new SubstackClient({ token, publicationUrl })
  })

  test('should test connectivity', async () => {
    const isConnected = await client.testConnectivity()

    expect(typeof isConnected).toBe('boolean')
    expect(isConnected).toBeTruthy()
    console.log(`✅ Connectivity test returned: ${isConnected}`)
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
    const profile = await client.profileForSlug('jakubslys')

    expect(profile).toBeInstanceOf(Profile)
    expect(profile.name).toBeTruthy()
    expect(profile.slug).toBe('jakubslys')
    expect(profile.id).toBeGreaterThan(0)

    console.log(`✅ Retrieved jakubslys profile: ${profile.name} (@${profile.slug})`)
  })

  test('should iterate through following users', async () => {
    const ownProfile = await client.ownProfile()
    let counter = 0
    for await (const profile of ownProfile.following({ limit: 3 })) {
      expect(profile).toBeInstanceOf(Profile)
      expect(profile.name).toBeTruthy()
      expect(profile.slug).toBeTruthy()
      ++counter
    }
    expect(counter).toEqual(3)
    console.log('✅ Retrieved 3 following profiles')
  })

  test('should get own profile', async () => {
    const ownProfile = await client.ownProfile()

    expect(ownProfile.name).toBeTruthy()
    expect(ownProfile.slug).toBeTruthy()
    expect(typeof ownProfile.publishNote).toBe('function')
    expect(typeof ownProfile.following).toBe('function')

    console.log(`✅ Retrieved own profile: ${ownProfile.name} (@${ownProfile.slug})`)
  })

  test('should handle profile posts iteration', async () => {
    const profile = await client.profileForSlug('jakubslys')
    const posts: PreviewPost[] = []

    for await (const post of profile.posts({ limit: 3 })) {
      posts.push(post)
      expect(post.title).toBeTruthy()
      expect(post.id).toBeGreaterThan(0)
      expect(post.publishedAt).toBeInstanceOf(Date)
    }

    expect(posts.length).toEqual(3)
    console.log(`✅ Retrieved ${posts.length} posts from profile`)
    console.log(`First post: "${posts[0].title}"`)
  })

  test('should handle post comments iteration', async () => {
    const testPost = await client.postForId(176729823)
    expect(testPost).not.toBeNull()

    const comments: Comment[] = []
    for await (const comment of testPost.comments({ limit: 3 })) {
      comments.push(comment)
      expect(comment.body).toBeTruthy()
    }

    console.log(`✅ Retrieved ${comments.length} comments from post "${testPost!.title}"`)
  })

  test('should throw for invalid profile slug', async () => {
    await expect(client.profileForSlug('this-profile-should-not-exist-12345')).rejects.toThrow()
    console.log('✅ Properly handles invalid profile lookup')
  })

  test('should throw for invalid post id', async () => {
    await expect(client.postForId(999999999999)).rejects.toThrow()
    console.log('✅ Properly handles invalid post lookup')
  })

  test('should throw for invalid note id', async () => {
    await expect(client.noteForId(999999999999)).rejects.toThrow()
    console.log('✅ Properly handles invalid note lookup')
  })

  test('should fetch notes using cursor-based pagination', async () => {
    const profile = await client.profileForSlug('jakubslys')
    const notes = []

    for await (const note of profile.notes({ limit: 99 })) {
      notes.push(note)
      expect(note.body).toBeTruthy()
      expect(note.id).toBeTruthy()
      expect(note.author).toBeTruthy()
      expect(note.author.name).toBeTruthy()
      expect(note.publishedAt).toBeInstanceOf(Date)
    }

    expect(notes.length).toBeLessThanOrEqual(99)
    expect(notes.length).toBeGreaterThan(0)

    console.log(`✅ Successfully fetched ${notes.length} notes`)
    console.log(`First note by: ${notes[0].author.name}`)
  })
})
