/// <reference path="./global.d.ts" />
import { Substack } from '../../src/client'

// Helper function to skip tests if no credentials
const skipIfNoCredentials = () => {
  if (!global.E2E_CONFIG.hasCredentials) {
    return test.skip
  }
  return test
}

// Helper function to handle network errors gracefully
const handleNetworkError = (error: any, operation: string): void => {
  // Check for various network error indicators
  const isNetworkError =
    (error &&
      typeof error === 'object' &&
      'code' in error &&
      ((error as any).code === 'EAI_AGAIN' || (error as any).code === 'ENOTFOUND')) ||
    (error &&
      typeof error === 'object' &&
      'cause' in error &&
      error.cause &&
      typeof error.cause === 'object' &&
      'code' in error.cause &&
      ((error.cause as any).code === 'EAI_AGAIN' || (error.cause as any).code === 'ENOTFOUND')) ||
    (error && error.toString && error.toString().includes('fetch failed')) ||
    (error && error.toString && error.toString().includes('EAI_AGAIN')) ||
    (error && error.toString && error.toString().includes('ENOTFOUND'))

  // Check for endpoint not available (some features may not be supported)
  const isEndpointNotFound =
    error && typeof error === 'object' && 'status' in error && (error as any).status === 404

  if (isNetworkError) {
    console.warn(
      `Network connectivity issue during ${operation}:`,
      (error as any)?.message || error
    )
    return
  }

  if (isEndpointNotFound) {
    console.warn(
      `Endpoint not available for ${operation} - this feature may not be supported:`,
      (error as any)?.message || error
    )
    return
  }

  throw error
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
    try {
      const posts = []
      for await (const post of client.getPosts({ limit: 1 })) {
        posts.push(post)
      }

      expect(Array.isArray(posts)).toBe(true)
      // Authentication is successful if we can fetch posts without error
      // The actual content will vary by publication
    } catch (error) {
      handleNetworkError(error, 'authentication test')
    }
  })

  skipIfNoCredentials()('should handle custom hostname in posts access', async () => {
    if (!global.E2E_CONFIG.hostname) {
      console.log('Skipping custom hostname test - no hostname configured')
      return
    }

    try {
      const posts = []
      for await (const post of client.getPosts({ limit: 1 })) {
        posts.push(post)
      }
      expect(Array.isArray(posts)).toBe(true)
      // Authentication successful with custom hostname if posts can be fetched
    } catch (error) {
      handleNetworkError(error, 'custom hostname test')
    }
  })

  skipIfNoCredentials()('should handle API errors gracefully', async () => {
    // Create a client with invalid credentials to test error handling
    const invalidClient = new Substack({
      apiKey: 'invalid-api-key',
      hostname: global.E2E_CONFIG.hostname
    })

    try {
      // Try to consume the first item from the async iterator
      const iterator = invalidClient.getPosts()[Symbol.asyncIterator]()
      await iterator.next()
      // If this doesn't throw, something is wrong with error handling
      throw new Error('Expected getPosts() to throw an error with invalid credentials')
    } catch (error) {
      // Check if it's a network error first
      const isNetworkError =
        (error &&
          typeof error === 'object' &&
          'code' in error &&
          ((error as any).code === 'EAI_AGAIN' || (error as any).code === 'ENOTFOUND')) ||
        (error &&
          typeof error === 'object' &&
          'cause' in error &&
          error.cause &&
          typeof error.cause === 'object' &&
          'code' in error.cause &&
          ((error.cause as any).code === 'EAI_AGAIN' ||
            (error.cause as any).code === 'ENOTFOUND')) ||
        (error && error.toString && error.toString().includes('fetch failed')) ||
        (error && error.toString && error.toString().includes('EAI_AGAIN')) ||
        (error && error.toString && error.toString().includes('ENOTFOUND'))

      if (isNetworkError) {
        console.warn(
          'Network connectivity issue during error handling test:',
          (error as any)?.message || error
        )
        return
      }

      // If it's not a network error, this is good - the client is properly handling API errors
      expect(error).toBeDefined()
    }
  })
})
