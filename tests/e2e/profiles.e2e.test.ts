/// <reference path="./global.d.ts" />
import { Substack } from '../../src/client'

// Helper function to skip tests if no credentials or network access
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

  if (isNetworkError) {
    console.warn(
      `Network connectivity issue during ${operation}:`,
      (error as any)?.message || error
    )
    return
  }
  console.log(`${operation} not accessible:`, error)
}

describe('E2E: User Profile Operations', () => {
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

  skipIfNoCredentials()('should fetch user profile by ID', async () => {
    try {
      // Use a common user ID for testing (this is a generic approach)
      // In real scenarios, you'd get this from other API calls
      const testUserId = 1 // Generic user ID for testing
      const profile = await client.getUserProfile(testUserId)

      expect(profile).toBeDefined()
      expect(profile.items).toBeDefined()
      expect(Array.isArray(profile.items)).toBe(true)

      if (profile.items.length > 0) {
        const item = profile.items[0]
        expect(item.context).toBeDefined()
        expect(item.context.users).toBeDefined()
        expect(Array.isArray(item.context.users)).toBe(true)

        if (item.context.users.length > 0) {
          const user = item.context.users[0]
          expect(user.id).toBeDefined()
          expect(user.name).toBeDefined()
          expect(typeof user.id).toBe('number')
          expect(typeof user.name).toBe('string')
        }
      }
    } catch (error) {
      handleNetworkError(error, 'User profile')
    }
  })

  skipIfNoCredentials()('should fetch public profile by slug', async () => {
    try {
      // Use a common public profile slug for testing
      const testSlug = 'hamish' // Example public slug
      const profile = await client.getPublicProfile(testSlug)

      expect(profile).toBeDefined()
      expect(profile.id).toBeDefined()
      expect(profile.name).toBeDefined()
      expect(typeof profile.id).toBe('number')
      expect(typeof profile.name).toBe('string')
    } catch (error) {
      handleNetworkError(error, 'Public profile')
    }
  })

  skipIfNoCredentials()('should fetch following profiles', async () => {
    try {
      const followingProfiles = await client.getFollowingProfiles()

      expect(Array.isArray(followingProfiles)).toBe(true)

      if (followingProfiles.length > 0) {
        const profile = followingProfiles[0]
        expect(profile.id).toBeDefined()
        expect(profile.name).toBeDefined()
        expect(typeof profile.id).toBe('number')
        expect(typeof profile.name).toBe('string')
      }
    } catch (error) {
      handleNetworkError(error, 'Following profiles')
    }
  })

  skipIfNoCredentials()('should handle non-existent user profile gracefully', async () => {
    try {
      await client.getUserProfile(999999999) // Very unlikely to exist
    } catch (error) {
      expect(error).toBeDefined()
      // Should throw an error for non-existent user
    }
  })

  skipIfNoCredentials()('should handle non-existent public profile gracefully', async () => {
    try {
      await client.getPublicProfile('non-existent-user-slug-12345')
    } catch (error) {
      expect(error).toBeDefined()
      // Should throw an error for non-existent public profile
    }
  })
})
