/**
 * Utility to validate required environment variables for E2E tests
 */

export interface RequiredEnvVars {
  apiKey: string
  hostname: string
}

/**
 * Validates that required environment variables are set for E2E tests
 * @throws Error with descriptive message if required variables are missing
 */
export function validateE2ECredentials(): RequiredEnvVars {
  const apiKey = process.env.SUBSTACK_API_KEY
  const hostname = process.env.SUBSTACK_HOSTNAME

  if (!apiKey || !hostname) {
    throw new Error(`
❌ Missing required Substack credentials. Set SUBSTACK_API_KEY and SUBSTACK_HOSTNAME.

Required environment variables:
- SUBSTACK_API_KEY: Your Substack API key (required)
- SUBSTACK_HOSTNAME: Your Substack hostname (optional)

You can set these variables:
1. In your environment: export SUBSTACK_API_KEY=your-key-here
2. In a .env file in the project root (copy from .env.example)
3. Alternative names: E2E_API_KEY, E2E_HOSTNAME

For more information, see tests/e2e/README.md
`)
  }
  return {
    apiKey,
    hostname
  }
}
