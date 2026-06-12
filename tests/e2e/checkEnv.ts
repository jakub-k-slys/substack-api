/**
 * Utility to validate required environment variables for E2E tests
 */

export interface RequiredEnvVars {
  substackSid?: string
  connectSid?: string
  publicationUrl: string
}

/**
 * Validates that required environment variables are set for E2E tests
 * @throws Error with descriptive message if required variables are missing
 */
export function validateE2ECredentials(): RequiredEnvVars {
  // SUBSTACK_API_KEY / E2E_API_KEY are legacy substack-api names for the substack.sid value
  const substackSid =
    process.env.SUBSTACK_SID || process.env.SUBSTACK_API_KEY || process.env.E2E_API_KEY
  const connectSid = process.env.CONNECT_SID
  const hostname = process.env.SUBSTACK_HOSTNAME || process.env.E2E_HOSTNAME

  if ((!substackSid && !connectSid) || !hostname) {
    throw new Error(`
❌ Missing required Substack credentials. Set SUBSTACK_SID and/or CONNECT_SID, plus SUBSTACK_HOSTNAME.

Required environment variables:
- SUBSTACK_SID: Value of your "substack.sid" cookie (this and/or CONNECT_SID)
- CONNECT_SID: Value of your "connect.sid" cookie (this and/or SUBSTACK_SID)
- SUBSTACK_HOSTNAME: Your Substack hostname (e.g. yoursite.substack.com)

You can set these variables:
1. In your environment: export SUBSTACK_SID=your-cookie-value
2. In a .env file in the project root (copy from .env.example)
3. Legacy names also accepted: SUBSTACK_API_KEY / E2E_API_KEY (treated as SUBSTACK_SID)

For more information, see tests/e2e/README.md
`)
  }

  // Convert hostname to full URL if it doesn't start with http
  const publicationUrl = hostname.startsWith('http') ? hostname : `https://${hostname}`

  return {
    substackSid,
    connectSid,
    publicationUrl
  }
}
