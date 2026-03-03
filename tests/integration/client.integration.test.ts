import { SubstackClient } from '@substack-api/substack-client'
import { Profile, OwnProfile, FullPost } from '@substack-api/domain'

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
    test('should return OwnProfile instance', async () => {
      const profile = await client.ownProfile()
      expect(profile).toBeInstanceOf(OwnProfile)
      expect(profile.id).toBe(27968736)
      expect(profile.name).toBe('Jakub Slys 🎖️')
      expect(profile.bio).toContain('Ever wonder how Uber matches rides')
    })
  })

  describe('profileForSlug', () => {
    test('should retrieve profile by slug', async () => {
      const profile = await client.profileForSlug('jakubslys')
      expect(profile).toBeInstanceOf(Profile)
      expect(profile.id).toBe(27968736)
      expect(profile.name).toBe('Jakub Slys 🎖️')
      expect(profile.slug).toBe('jakubslys')
      expect(profile.bio).toContain('Ever wonder how Uber matches rides')
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
      expect(post.title).toBe('Week of June 24, 2025: Build SaaS Without Code')
      expect(post.subtitle).toBe('The New Blueprint for Solopreneurs')
      expect(post.slug).toBe('week-of-june-24-2025-build-saas-without')
      expect(post.htmlBody).toContain('<div class="captioned-image-container">')
      expect(post.htmlBody).toContain('content shatters the myth')
      expect(post.createdAt).toBeInstanceOf(Date)
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
      expect(typeof post.comments).toBe('function')
    })

    test('should throw when post not found', async () => {
      await expect(client.postForId(999999999)).rejects.toThrow()
    })
  })

  describe('noteForId', () => {
    test('should retrieve note by ID', async () => {
      const note = await client.noteForId(789)
      expect(note.id).toBe(789)
      expect(note.body).toBe('Test note body')
    })

    test('should throw when note not found', async () => {
      await expect(client.noteForId(999999999)).rejects.toThrow('Note with ID 999999999 not found')
    })
  })
})
