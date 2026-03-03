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
  const substackSid = process.env.SUBSTACK_SID || process.env.SUBSTACK_API_KEY
  const connectSid = process.env.CONNECT_SID
  const hostname = process.env.SUBSTACK_HOSTNAME

  if (!substackSid || !connectSid || !hostname) {
    throw new Error(`
❌ Missing required Substack credentials.

Required environment variables:
- SUBSTACK_SID: Your substack.sid session cookie value (required)
- CONNECT_SID: Your connect.sid session cookie value (required)
- SUBSTACK_HOSTNAME: Your Substack publication hostname, e.g. yoursite.substack.com (required)

You can set these variables:
1. In your environment: export SUBSTACK_SID=your-sid-here
2. In a .env file in the project root (copy from .env.example)

For more information, see tests/e2e/README.md
`)
  }

  // Convert hostname to full URL if it doesn't start with http
  const publicationUrl = hostname.startsWith('http') ? hostname : `https://${hostname}`

  return {
    token: btoa(JSON.stringify({ substack_sid: substackSid, connect_sid: connectSid })),
    publicationUrl
  }
}
