/// <reference path="./global.d.ts" />
import { Substack } from '../../src/client'

// Helper function to skip tests if no credentials
const skipIfNoCredentials = () => {
  if (!global.E2E_CONFIG.hasCredentials) {
    return test.skip
  }
  return test
}

describe('E2E: Authentication & Publication Access', () => {
  let client: Substack

  beforeAll(() => {
    if (!global.E2E_CONFIG.hasCredentials) {
      return
    }

    client = new Substack({
      apiKey: global.E2E_CONFIG.apiKey!,
      hostname: global.E2E_CONFIG.hostname
    })
  })

  skipIfNoCredentials()('should authenticate and get publication details', async () => {
    const publication = await client.getPublication()

    expect(publication).toBeDefined()
    expect(publication.name).toBeDefined()
    expect(publication.hostname).toBeDefined()
    expect(publication.subdomain).toBeDefined()
    expect(typeof publication.name).toBe('string')
    expect(typeof publication.hostname).toBe('string')
    expect(typeof publication.subdomain).toBe('string')
  })

  skipIfNoCredentials()('should handle custom hostname in publication details', async () => {
    if (!global.E2E_CONFIG.hostname) {
      console.log('Skipping custom hostname test - no hostname configured')
      return
    }

    const publication = await client.getPublication(global.E2E_CONFIG.hostname)

    expect(publication).toBeDefined()
    expect(publication.hostname).toBe(global.E2E_CONFIG.hostname)
  })

  skipIfNoCredentials()('should handle API errors gracefully', async () => {
    // Create a client with invalid credentials to test error handling
    const invalidClient = new Substack({
      apiKey: 'invalid-api-key',
      hostname: global.E2E_CONFIG.hostname
    })

    await expect(invalidClient.getPublication()).rejects.toThrow()
  })
})
