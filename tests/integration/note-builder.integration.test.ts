import { SubstackClient } from '../../src/substack-client'
import { OwnProfile } from '../../src/entities'
import { PublishNoteResponse } from '../../src/types'

describe('NoteBuilder Integration Tests', () => {
  let client: SubstackClient
  let ownProfile: OwnProfile

  beforeEach(() => {
    // Create client configured to use our local test server
    const url = new URL(global.INTEGRATION_SERVER.url)
    const hostname = `${url.hostname}:${url.port}`

    client = new SubstackClient({
      hostname: hostname,
      apiKey: 'test-key',
      protocol: 'http' // Use HTTP for local test server
    })

    // Create a mock OwnProfile for testing
    ownProfile = new OwnProfile(
      {
        id: 254824415,
        name: 'Test User',
        handle: 'testuser',
        photo_url: 'https://example.com/photo.jpg',
        bio: 'Test bio',
        profile_set_up_at: '2023-01-01T00:00:00.000Z',
        reader_installed_at: '2023-01-01T00:00:00.000Z',
        profile_disabled: false,
        publicationUsers: [],
        userLinks: [],
        subscriptions: [],
        subscriptionsTruncated: false,
        hasGuestPost: false,
        max_pub_tier: 1,
        hasActivity: true,
        hasLikes: true,
        lists: [],
        rough_num_free_subscribers_int: 0,
        rough_num_free_subscribers: '0',
        bestseller_badge_disabled: false,
        bestseller_tier: 1,
        subscriberCountString: '0',
        subscriberCount: '0',
        subscriberCountNumber: 0,
        hasHiddenPublicationUsers: false,
        visibleSubscriptionsCount: 0,
        slug: 'testuser',
        primaryPublicationIsPledged: false,
        primaryPublicationSubscriptionState: 'none',
        isSubscribed: false,
        isFollowing: false,
        followsViewer: false,
        can_dm: false,
        dm_upgrade_options: []
      },
      (client as any).httpClient, // Access the internal httpClient
      'testuser'
    )
  })

  describe('Simple Note Creation', () => {
    test('should create note with simple text', async () => {
      const result = await ownProfile.newNote('my test text').publish()
      
      expect(result).toBeDefined()
      expect(result.id).toBe(131719084)
      expect(result.user_id).toBe(254824415)
      expect(typeof result.body).toBe('string')
      expect(result.status).toBe('published')
      expect(result.type).toBe('feed')
    })

    test('should create note with empty builder then publish', async () => {
      const result = await ownProfile.newNote().paragraph('test paragraph').publish()
      
      expect(result).toBeDefined()
      expect(typeof result.body).toBe('string')
      expect(result.status).toBe('published')
    })
  })

  describe('Multiple Paragraphs', () => {
    test('should create note with multiple string paragraphs', async () => {
      const result = await ownProfile
        .newNote()
        .paragraph('my test text1')
        .paragraph('my test text2')
        .publish()
      
      expect(result).toBeDefined()
      expect(typeof result.body).toBe('string')
      expect(result.status).toBe('published')
    })

    test('should handle multiple paragraphs with mixed content', async () => {
      const result = await ownProfile
        .newNote()
        .paragraph('first paragraph')
        .paragraph('second paragraph')
        .paragraph('third paragraph')
        .publish()
      
      expect(result).toBeDefined()
      expect(typeof result.body).toBe('string')
      expect(result.status).toBe('published')
    })
  })

  describe('Rich Formatting', () => {
    test('should create note with rich formatting in single paragraph', async () => {
      const result = await ownProfile
        .newNote()
        .paragraph()
          .text('adasd')
          .bold('this is bold')
          .text('regular again')
        .publish()
      
      expect(result).toBeDefined()
      expect(typeof result.body).toBe('string')
      expect(result.status).toBe('published')
    })

    test('should handle italic formatting', async () => {
      const result = await ownProfile
        .newNote()
        .paragraph()
          .text('normal text')
          .italic('italic text')
          .text('normal again')
        .publish()
      
      expect(result).toBeDefined()
      expect(typeof result.body).toBe('string')
      expect(result.status).toBe('published')
    })

    test('should handle code formatting', async () => {
      const result = await ownProfile
        .newNote()
        .paragraph()
          .text('some text')
          .code('code snippet')
          .text('more text')
        .publish()
      
      expect(result).toBeDefined()
      expect(typeof result.body).toBe('string')
      expect(result.status).toBe('published')
    })

    test('should handle mixed formatting types', async () => {
      const result = await ownProfile
        .newNote()
        .paragraph()
          .text('start')
          .bold('bold text')
          .italic('italic text')
          .code('code text')
          .text('end')
        .publish()
      
      expect(result).toBeDefined()
      expect(typeof result.body).toBe('string')
      expect(result.status).toBe('published')
    })
  })

  describe('Complex Formatting Across Paragraphs', () => {
    test('should create note with complex formatting across multiple paragraphs', async () => {
      const result = await ownProfile
        .newNote()
        .paragraph()
          .text('adasd')
          .bold('this is bold')
          .text('regular again')
        .paragraph()
          .text('adasd')
          .italic('this is italic')
          .code('code text')
          .text('regular again')
        .publish()
      
      expect(result).toBeDefined()
      expect(typeof result.body).toBe('string')
      expect(result.status).toBe('published')
    })

    test('should handle complex nested paragraph structures', async () => {
      const result = await ownProfile
        .newNote()
        .paragraph()
          .text('First paragraph: ')
          .bold('bold')
          .text(' and ')
          .italic('italic')
        .paragraph()
          .code('code block')
          .text(' with normal text')
        .paragraph('simple string paragraph')
        .publish()
      
      expect(result).toBeDefined()
      expect(typeof result.body).toBe('string')
      expect(result.status).toBe('published')
    })
  })

  describe('Request Structure Validation', () => {
    test('should build correct request structure for simple text', async () => {
      // We'll test the request structure by capturing what gets sent to the server
      // The mock server validates the structure and returns success if correct
      const result = await ownProfile.newNote('simple text').publish()
      
      // If we get a successful response, it means the request structure was correct
      expect(result).toBeDefined()
      expect(result.status).toBe('published')
    })

    test('should build correct request structure for rich formatting', async () => {
      // Test that complex formatting is properly serialized and accepted by the server
      const result = await ownProfile
        .newNote()
        .paragraph()
          .text('normal')
          .bold('bold')
          .italic('italic')
          .code('code')
        .publish()
      
      expect(result).toBeDefined()
      expect(result.status).toBe('published')
    })

    test('should build correct request structure for multiple paragraphs', async () => {
      // Test that multiple paragraphs are properly structured
      const result = await ownProfile
        .newNote()
        .paragraph('first')
        .paragraph('second')
        .publish()
      
      expect(result).toBeDefined()
      expect(result.status).toBe('published')
    })
  })

  describe('API Response Handling', () => {
    test('should correctly parse PublishNoteResponse', async () => {
      const result = await ownProfile.newNote('test').publish()
      
      // Validate response structure matches PublishNoteResponse interface
      expect(typeof result.user_id).toBe('number')
      expect(typeof result.body).toBe('string')
      expect(result.body_json).toBeDefined()
      expect(result.body_json.type).toBe('doc')
      expect(result.body_json.attrs.schemaVersion).toBe('v1')
      expect(Array.isArray(result.body_json.content)).toBe(true)
      expect(result.post_id).toBeNull()
      expect(result.publication_id).toBeNull()
      expect(result.media_clip_id).toBeNull()
      expect(result.ancestor_path).toBe('')
      expect(result.type).toBe('feed')
      expect(result.status).toBe('published')
      expect(result.reply_minimum_role).toBe('everyone')
      expect(typeof result.id).toBe('number')
      expect(typeof result.deleted).toBe('boolean')
      expect(typeof result.date).toBe('string')
      expect(typeof result.name).toBe('string')
      expect(typeof result.photo_url).toBe('string')
      expect(typeof result.reactions).toBe('object')
      expect(Array.isArray(result.children)).toBe(true)
      expect(typeof result.reaction_count).toBe('number')
      expect(typeof result.restacks).toBe('number')
      expect(typeof result.restacked).toBe('boolean')
      expect(typeof result.children_count).toBe('number')
      expect(Array.isArray(result.attachments)).toBe(true)
    })

    test('should handle publication metadata in response', async () => {
      const result = await ownProfile.newNote('test with publication').publish()
      
      if (result.user_primary_publication) {
        expect(typeof result.user_primary_publication.name).toBe('string')
        expect(typeof result.user_primary_publication.subdomain).toBe('string')
        // Note: The actual response includes more fields than the interface defines
        // This test validates that the response structure is handled correctly
      }
    })
  })
})