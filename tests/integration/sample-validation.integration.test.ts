import { readFileSync } from 'fs'
import { join } from 'path'

describe('Sample Data Validation Integration Tests', () => {
  const samplesDir = join(process.cwd(), 'samples', 'api', 'v1')

  describe('sample file structure validation', () => {
    test('should validate all sample files are valid JSON', async () => {
      const sampleFiles = [
        'subscription',
        'subscriptions',
        'user/282291554/profile',
        'user/jakubslys/public_profile',
        'reader/feed/profile/282291554'
      ]

      for (const file of sampleFiles) {
        const samplePath = join(samplesDir, file)
        try {
          const content = readFileSync(samplePath, 'utf8')
          const parsed = JSON.parse(content)
          expect(parsed).toBeDefined()
          expect(typeof parsed).toBe('object')
        } catch (error) {
          throw new Error(`Invalid JSON in sample file ${file}: ${error}`)
        }
      }
    })

    test('should validate subscription sample has required fields', async () => {
      const samplePath = join(samplesDir, 'subscription')
      const sampleData = JSON.parse(readFileSync(samplePath, 'utf8'))

      const requiredFields = [
        'id',
        'user_id',
        'publication_id',
        'email_disabled',
        'membership_state',
        'is_subscribed',
        'is_founding',
        'is_free_subscribed'
      ]

      requiredFields.forEach((field) => {
        expect(sampleData[field]).toBeDefined()
      })
    })

    test('should validate subscriptions sample has required structure', async () => {
      const samplePath = join(samplesDir, 'subscriptions')
      const sampleData = JSON.parse(readFileSync(samplePath, 'utf8'))

      expect(sampleData.subscriptions).toBeInstanceOf(Array)
      expect(sampleData.publications).toBeInstanceOf(Array)
      expect(sampleData.publicationUsers).toBeInstanceOf(Array)

      // Each subscription should have required fields
      if (sampleData.subscriptions.length > 0) {
        const subscription = sampleData.subscriptions[0]
        expect(subscription.id).toBeDefined()
        expect(subscription.user_id).toBeDefined()
        expect(subscription.publication_id).toBeDefined()
        expect(subscription.membership_state).toBeDefined()
      }

      // Each publication should have required fields
      if (sampleData.publications.length > 0) {
        const publication = sampleData.publications[0]
        expect(publication.id).toBeDefined()
        expect(publication.name).toBeDefined()
        expect(publication.subdomain).toBeDefined()
        expect(publication.author_id).toBeDefined()
      }
    })

    test('should validate profile samples have required fields', async () => {
      const profileSamples = [
        { file: 'user/282291554/profile', requiredFields: ['id', 'name', 'photo_url', 'bio'] },
        {
          file: 'user/jakubslys/public_profile',
          requiredFields: ['id', 'name', 'handle', 'photo_url', 'bio']
        }
      ]

      for (const { file, requiredFields } of profileSamples) {
        const samplePath = join(samplesDir, file)
        const sampleData = JSON.parse(readFileSync(samplePath, 'utf8'))

        requiredFields.forEach((field) => {
          expect(sampleData[field]).toBeDefined()
          if (typeof sampleData[field] === 'string') {
            expect(sampleData[field]).not.toBe('')
          }
        })
      }
    })
  })

  describe('data consistency validation', () => {
    test('should validate user IDs are consistent across samples', async () => {
      // Load profile samples - these are for different users, so let's test each separately
      const profilePath = join(samplesDir, 'user/282291554/profile')
      const publicProfilePath = join(samplesDir, 'user/jakubslys/public_profile')

      const profile = JSON.parse(readFileSync(profilePath, 'utf8'))
      const publicProfile = JSON.parse(readFileSync(publicProfilePath, 'utf8'))

      // Test that each profile has a valid structure
      expect(profile.id).toBe(282291554) // Jenny Ouyang
      expect(publicProfile.id).toBe(254824415) // Jakub Slys

      // Test that handles match expected patterns
      expect(publicProfile.handle).toBe('jakubslys')
      expect(publicProfile.slug).toBe('jakub-slys')
    })

    test('should validate publication references are consistent', async () => {
      const subscriptionsPath = join(samplesDir, 'subscriptions')
      const subscriptionsData = JSON.parse(readFileSync(subscriptionsPath, 'utf8'))

      // Find the primary publication (slys.dev)
      const primaryPub = subscriptionsData.publications.find(
        (pub: any) => pub.subdomain === 'slys' && pub.custom_domain === 'iam.slys.dev'
      )

      expect(primaryPub).toBeDefined()
      expect(primaryPub.id).toBe(2817779)
      expect(primaryPub.name).toBe('slys.dev')

      // Find corresponding subscription
      const subscription = subscriptionsData.subscriptions.find(
        (sub: any) => sub.publication_id === 2817779
      )

      expect(subscription).toBeDefined()
      expect(subscription.user_id).toBe(254824415)
      expect(subscription.membership_state).toBe('subscribed')
    })
  })

  describe('sample data realism', () => {
    test('should have realistic publication data', async () => {
      const subscriptionsPath = join(samplesDir, 'subscriptions')
      const subscriptionsData = JSON.parse(readFileSync(subscriptionsPath, 'utf8'))

      // Check that we have a good variety of publications
      expect(subscriptionsData.publications.length).toBeGreaterThan(10)

      // Check for different payment states
      const paymentStates = subscriptionsData.publications.map((pub: any) => pub.payments_state)
      expect(paymentStates).toContain('enabled')
      expect(paymentStates).toContain('disabled')

      // Check for different homepage types
      const homepageTypes = subscriptionsData.publications.map((pub: any) => pub.homepage_type)
      expect(new Set(homepageTypes).size).toBeGreaterThan(1)

      // Check for custom domains
      const customDomains = subscriptionsData.publications
        .map((pub: any) => pub.custom_domain)
        .filter(Boolean)
      expect(customDomains.length).toBeGreaterThan(0)
    })

    test('should have realistic subscription states', async () => {
      const subscriptionsPath = join(samplesDir, 'subscriptions')
      const subscriptionsData = JSON.parse(readFileSync(subscriptionsPath, 'utf8'))

      // Check for different membership states
      const membershipStates = subscriptionsData.subscriptions.map(
        (sub: any) => sub.membership_state
      )
      const uniqueStates = new Set(membershipStates)

      expect(uniqueStates.size).toBeGreaterThan(1)
      expect(membershipStates).toContain('free_signup')

      // Check for founding subscriptions
      const foundingSubscriptions = subscriptionsData.subscriptions.filter(
        (sub: any) => sub.is_founding
      )
      expect(foundingSubscriptions.length).toBeGreaterThan(0)
    })
  })
})
