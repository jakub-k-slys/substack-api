/**
 * Utility to validate required environment variables for E2E tests
 */

export interface RequiredEnvVars {
  token: string
  publicationUrl: string
}

/**
 * Validates that required environment variables are set for E2E tests
 * @throws Error with descriptive message if required variables are missing
 */
export function validateE2ECredentials(): RequiredEnvVars {
  const token = process.env.SUBSTACK_TOKEN
  const hostname = process.env.SUBSTACK_HOSTNAME

  if (!token || !hostname) {
    throw new Error(`
❌ Missing required Substack credentials.

Required environment variables:
- SUBSTACK_TOKEN: Bearer token for the gateway (required)
  Build it with: btoa(JSON.stringify({ substack_sid: '...', connect_sid: '...' }))
- SUBSTACK_HOSTNAME: Your Substack publication hostname, e.g. yoursite.substack.com (required)

You can set these variables:
1. In your environment: export SUBSTACK_TOKEN=your-token-here
2. In a .env file in the project root (copy from .env.example)

For more information, see the README.
`)
  }

  // Convert hostname to full URL if it doesn't start with http
  const publicationUrl = hostname.startsWith('http') ? hostname : `https://${hostname}`

  return { token, publicationUrl }
}
