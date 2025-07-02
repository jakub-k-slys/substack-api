import { readFileSync } from 'fs'
import { join } from 'path'
import { Profile } from '../../src/entities'

describe('Sample Data Integration Tests', () => {
  const samplesDir = join(process.cwd(), 'samples', 'api', 'v1')

  describe('subscription data structure', () => {
    test('should parse subscription sample correctly', async () => {
      const samplePath = join(samplesDir, 'subscription')
      const sampleData = JSON.parse(readFileSync(samplePath, 'utf8'))

      // Test subscription data structure matches expected interface
      expect(sampleData.id).toBe(526676485)
      expect(sampleData.user_id).toBe(254824415)
      expect(sampleData.publication_id).toBe(2817779)
      expect(sampleData.membership_state).toBe('subscribed')
      expect(sampleData.is_founding).toBe(true)
      expect(sampleData.is_subscribed).toBe(true)
      expect(sampleData.is_free_subscribed).toBe(true)

      // Test notification settings structure
      expect(sampleData.notification_settings).toBeDefined()
      expect(typeof sampleData.notification_settings).toBe('object')

      // Test podcast settings
      expect(sampleData.receive_podcast_emails).toBe(true)
      expect(sampleData.podcast_rss_token).toBeTruthy()
    })

    test('should parse subscriptions list sample correctly', async () => {
      const samplePath = join(samplesDir, 'subscriptions')
      const sampleData = JSON.parse(readFileSync(samplePath, 'utf8'))

      // Test main structure
      expect(sampleData.subscriptions).toBeInstanceOf(Array)
      expect(sampleData.publications).toBeInstanceOf(Array)
      expect(sampleData.publicationUsers).toBeInstanceOf(Array)

      // Test we have substantial data
      expect(sampleData.subscriptions.length).toBeGreaterThan(10)
      expect(sampleData.publications.length).toBeGreaterThan(10)

      // Test subscription structure
      const firstSub = sampleData.subscriptions[0]
      expect(firstSub.id).toBeDefined()
      expect(firstSub.user_id).toBeDefined()
      expect(firstSub.publication_id).toBeDefined()
      expect(firstSub.membership_state).toBeDefined()
      expect(['free_signup', 'subscribed', 'comped']).toContain(firstSub.membership_state)

      // Test publication structure
      const firstPub = sampleData.publications[0]
      expect(firstPub.id).toBeDefined()
      expect(firstPub.name).toBeTruthy()
      expect(firstPub.subdomain).toBeTruthy()
      expect(firstPub.author_id).toBeDefined()
      expect(firstPub.payments_state).toBeDefined()
      expect(['enabled', 'disabled']).toContain(firstPub.payments_state)
    })
  })

  describe('user profile data structure', () => {
    test('should parse user profile sample correctly', async () => {
      const samplePath = join(samplesDir, 'user/282291554/profile')
      const sampleData = JSON.parse(readFileSync(samplePath, 'utf8'))

      // Test basic profile structure (this is Jenny Ouyang's profile)
      expect(sampleData.id).toBe(282291554)
      expect(sampleData.name).toBe('Jenny Ouyang')
      expect(sampleData.photo_url).toBeTruthy()
      expect(sampleData.bio).toBeTruthy()
      expect(sampleData.profile_set_up_at).toBeTruthy()

      // Test publications structure (different format than publicationUsers)
      expect(sampleData.publications).toBeInstanceOf(Array)
      expect(sampleData.publications.length).toBeGreaterThan(0)

      const firstPub = sampleData.publications[0]
      expect(firstPub.id).toBeDefined()
      expect(firstPub.author_id).toBe(282291554)
      expect(firstPub.name).toBeTruthy()
      expect(firstPub.subdomain).toBeTruthy()
    })

    test('should parse public profile sample correctly', async () => {
      const samplePath = join(samplesDir, 'user/jakubslys/public_profile')
      const sampleData = JSON.parse(readFileSync(samplePath, 'utf8'))

      // Test basic profile structure
      expect(sampleData.id).toBe(254824415)
      expect(sampleData.name).toBe('Jakub Slys 🎖️')
      expect(sampleData.handle).toBe('jakubslys')
      expect(sampleData.slug).toBe('jakub-slys')
      expect(sampleData.photo_url).toBeTruthy()
      expect(sampleData.bio).toBeTruthy()

      // Test subscriber count data
      expect(sampleData.subscriberCount).toBe('88')
      expect(sampleData.subscriberCountNumber).toBe(88)
      expect(sampleData.subscriberCountString).toBe('88 subscribers')

      // Test primary publication
      expect(sampleData.primaryPublication).toBeDefined()
      expect(sampleData.primaryPublication.id).toBe(2817779)
      expect(sampleData.primaryPublication.subdomain).toBe('slys')
      expect(sampleData.primaryPublication.custom_domain).toBe('iam.slys.dev')
      expect(sampleData.primaryPublication.name).toBe('slys.dev')

      // Test follow/subscription state
      expect(sampleData.isSubscribed).toBe(true)
      expect(sampleData.isFollowing).toBe(true)
      expect(sampleData.followsViewer).toBe(true)

      // Test mutuals context
      expect(sampleData.mutualsContext).toBeDefined()
      expect(sampleData.mutualsContext.type).toBe('subscribers')
      expect(sampleData.mutualsContext.users).toBeInstanceOf(Array)
    })
  })

  describe('Profile entity integration', () => {
    test('should create Profile entity from public profile sample', async () => {
      const samplePath = join(samplesDir, 'user/jakubslys/public_profile')
      const sampleData = JSON.parse(readFileSync(samplePath, 'utf8'))

      // Create a mock HTTP client for the Profile entity
      const mockHttpClient = {
        get: jest.fn(),
        post: jest.fn(),
        request: jest.fn()
      }

      // Create Profile entity from sample data
      const profile = new Profile(sampleData, mockHttpClient as any)

      // Test Profile entity properties
      expect(profile.id).toBe(254824415)
      expect(profile.name).toBe('Jakub Slys 🎖️')
      expect(profile.slug).toBe('jakubslys') // Profile uses handle as slug when no resolved slug provided
      expect(profile.bio).toBeTruthy()
      expect(profile.avatarUrl).toBeTruthy()

      // Note: Basic Profile entity doesn't have subscriberCount or primaryPublication
      // Those would be available in extended profile types
    })
  })

  describe('complex data structures', () => {
    test('should handle publication with comprehensive metadata', async () => {
      const samplePath = join(samplesDir, 'subscriptions')
      const sampleData = JSON.parse(readFileSync(samplePath, 'utf8'))

      // Find a publication with rich metadata (like NEW ECONOMIES)
      const richPub = sampleData.publications.find(
        (pub: any) => pub.name === 'NEW ECONOMIES' || pub.subdomain === 'neweconomies'
      )

      expect(richPub).toBeDefined()

      if (richPub) {
        // Test comprehensive publication structure
        expect(richPub.id).toBeDefined()
        expect(richPub.name).toBe('NEW ECONOMIES')
        expect(richPub.subdomain).toBe('neweconomies')
        expect(richPub.custom_domain).toBe('www.neweconomies.co')
        expect(richPub.hero_text).toBeTruthy()
        expect(richPub.logo_url).toBeTruthy()
        expect(richPub.community_enabled).toBe(true)
        expect(richPub.payments_state).toBe('enabled')

        // Test that plans array exists and has proper structure
        expect(richPub.plans).toBeInstanceOf(Array)
        expect(richPub.plans.length).toBeGreaterThan(0)

        const firstPlan = richPub.plans[0]
        expect(firstPlan.id).toBeTruthy()
        expect(firstPlan.amount).toBeDefined()
        expect(firstPlan.currency).toBeTruthy()
        expect(firstPlan.interval).toBeTruthy()

        // Test currency options
        if (firstPlan.currency_options) {
          expect(firstPlan.currency_options.usd).toBeDefined()
          expect(firstPlan.currency_options.usd.unit_amount).toBeDefined()
          expect(typeof firstPlan.currency_options.usd.unit_amount).toBe('number')
        }

        // Test theme data
        if (richPub.theme) {
          expect(typeof richPub.theme.publication_id).toBe('number')
          expect(richPub.theme.publication_id).toBe(richPub.id)
        }
      }
    })

    test('should maintain referential integrity between entities', async () => {
      const samplePath = join(samplesDir, 'subscriptions')
      const sampleData = JSON.parse(readFileSync(samplePath, 'utf8'))

      // Test that subscription publication_ids match actual publication ids
      const subscriptions = sampleData.subscriptions
      const publications = sampleData.publications
      const publicationIds = publications.map((p: any) => p.id)

      subscriptions.forEach((sub: any) => {
        expect(publicationIds).toContain(sub.publication_id)
      })

      // Test that publicationUsers reference valid publications
      const publicationUsers = sampleData.publicationUsers
      publicationUsers.forEach((pu: any) => {
        expect(publicationIds).toContain(pu.publication_id)
      })
    })
  })

  describe('HTTP server integration', () => {
    test('should have integration server available', async () => {
      // Test that our integration server setup works
      expect(global.INTEGRATION_SERVER).toBeDefined()
      expect(global.INTEGRATION_SERVER.url).toBeTruthy()
      expect(global.INTEGRATION_SERVER.server).toBeDefined()
    })
  })
})
