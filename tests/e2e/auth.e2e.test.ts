/// <reference path="./global.d.ts" />
import { Substack } from '../../src/client'

// Helper function to skip tests if no credentials
const skipIfNoCredentials = () => {
  if (!global.E2E_CONFIG.hasCredentials) {
    return test.skip
  }
  return test
}

describe('E2E: Authentication & API Access', () => {
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

  skipIfNoCredentials()('should authenticate and access posts', async () => {
    const posts = await client.getPosts({ limit: 1 })

    expect(Array.isArray(posts)).toBe(true)
    // Authentication is successful if we can fetch posts without error
    // The actual content will vary by publication
  })

  skipIfNoCredentials()('should handle custom hostname in posts access', async () => {
    if (!global.E2E_CONFIG.hostname) {
      console.log('Skipping custom hostname test - no hostname configured')
      return
    }

    const posts = await client.getPosts({ limit: 1 })
    expect(Array.isArray(posts)).toBe(true)
    // Authentication successful with custom hostname if posts can be fetched
  })

  skipIfNoCredentials()('should handle API errors gracefully', async () => {
    // Create a client with invalid credentials to test error handling
    const invalidClient = new Substack({
      apiKey: 'invalid-api-key',
      hostname: global.E2E_CONFIG.hostname
    })

    await expect(invalidClient.getPosts()).rejects.toThrow()
  })
})
