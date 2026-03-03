import { SubstackClient } from '@substack-api/substack-client'
import { Profile, OwnProfile, FullPost, Note, Comment, PreviewPost } from '@substack-api/domain'

describe('SubstackClient Integration Tests', () => {
  let client: SubstackClient

  beforeEach(() => {
    client = new SubstackClient({
      gatewayUrl: global.INTEGRATION_SERVER.url,
      publicationUrl: 'https://test.substack.com',
      token: 'dummy-token'
    })
  })

  describe('Infrastructure Tests', () => {
    test('should have integration server available', () => {
      expect(global.INTEGRATION_SERVER).toBeDefined()
      expect(global.INTEGRATION_SERVER.url).toBeTruthy()
      expect(global.INTEGRATION_SERVER.server).toBeDefined()
    })

    test('should serve gateway health endpoint', async () => {
      const res = await fetch(`${global.INTEGRATION_SERVER.url}/api/v1/health/ready`)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.status).toBe('ok')
    })
  })

  describe('testConnectivity', () => {
    test('should return true when gateway is accessible', async () => {
      const result = await client.testConnectivity()
      expect(result).toBe(true)
    })
  })

  describe('ownProfile', () => {
    test('should return OwnProfile instance with required fields', async () => {
      const profile = await client.ownProfile()
      expect(profile).toBeInstanceOf(OwnProfile)
      expect(profile.id).toBeGreaterThan(0)
      expect(profile.name).toBeTruthy()
      expect(profile.slug).toBeTruthy()
      expect(profile.bio).toBeTruthy()
    })
  })

  describe('profileForSlug', () => {
    test('should retrieve profile by slug', async () => {
      const profile = await client.profileForSlug('jakubslys')
      expect(profile).toBeInstanceOf(Profile)
      expect(profile.id).toBeGreaterThan(0)
      expect(profile.name).toBeTruthy()
      expect(profile.slug).toBe('jakubslys')
      expect(profile.bio).toBeTruthy()
      expect(typeof profile.posts).toBe('function')
      expect(typeof profile.notes).toBe('function')
    })

    test('should reject empty slug', async () => {
      await expect(client.profileForSlug('')).rejects.toThrow('Profile slug cannot be empty')
      await expect(client.profileForSlug('   ')).rejects.toThrow('Profile slug cannot be empty')
    })

    test('should throw when profile not found', async () => {
      await expect(client.profileForSlug('nonexistentuser123')).rejects.toThrow(/not found/)
    })
  })

  describe('postForId', () => {
    test('should retrieve full post by ID', async () => {
      const post = await client.postForId(167180194)
      expect(post).toBeInstanceOf(FullPost)
      expect(post.id).toBe(167180194)
      expect(post.title).toBeTruthy()
      expect(post.subtitle).toBeTruthy()
      expect(post.slug).toBeTruthy()
      expect(post.htmlBody).toBeTruthy()
      expect(post.createdAt).toBeInstanceOf(Date)
      expect(typeof post.reactions).toBe('object')
      expect(typeof post.restacks).toBe('number')
      expect(Array.isArray(post.postTags)).toBe(true)
      expect(typeof post.coverImage).toBe('string')
      expect(typeof post.comments).toBe('function')
    })

    test('should throw when post not found', async () => {
      await expect(client.postForId(999999999)).rejects.toThrow()
    })
  })

  describe('noteForId', () => {
    test('should retrieve note by ID', async () => {
      const note = await client.noteForId(789)
      expect(note).toBeInstanceOf(Note)
      expect(note.id).toBeGreaterThan(0)
      expect(note.body).toBeTruthy()
      expect(note.author).toBeTruthy()
      expect(note.publishedAt).toBeInstanceOf(Date)
    })

    test('should throw when note not found', async () => {
      await expect(client.noteForId(999999999)).rejects.toThrow('Note with ID 999999999 not found')
    })
  })

  describe('profile.posts() iteration', () => {
    test('should yield PreviewPost instances', async () => {
      const profile = await client.profileForSlug('jakubslys')
      const posts: PreviewPost[] = []
      for await (const post of profile.posts()) {
        posts.push(post)
      }
      expect(posts.length).toBeGreaterThan(0)
      expect(posts[0]).toBeInstanceOf(PreviewPost)
      expect(posts[0].id).toBeGreaterThan(0)
      expect(posts[0].title).toBeTruthy()
      expect(posts[0].publishedAt).toBeInstanceOf(Date)
    })
  })

  describe('profile.notes() iteration', () => {
    test('should yield Note instances', async () => {
      const profile = await client.profileForSlug('jakubslys')
      const notes: Note[] = []
      for await (const note of profile.notes()) {
        notes.push(note)
      }
      expect(notes.length).toBeGreaterThan(0)
      expect(notes[0]).toBeInstanceOf(Note)
      expect(notes[0].id).toBeGreaterThan(0)
      expect(notes[0].body).toBeTruthy()
    })
  })

  describe('post.comments() iteration', () => {
    test('should yield Comment instances', async () => {
      const post = await client.postForId(167180194)
      const comments: Comment[] = []
      for await (const comment of post.comments()) {
        comments.push(comment)
      }
      expect(comments.length).toBeGreaterThan(0)
      expect(comments[0]).toBeInstanceOf(Comment)
      expect(comments[0].body).toBeTruthy()
    })
  })
})
