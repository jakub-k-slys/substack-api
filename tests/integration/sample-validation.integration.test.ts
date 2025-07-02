import { readFileSync } from 'fs'
import { join } from 'path'

describe('Sample Data Validation', () => {
  const samplesDir = join(process.cwd(), 'samples', 'api', 'v1')

  describe('basic sample file validation', () => {
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
  })
})
