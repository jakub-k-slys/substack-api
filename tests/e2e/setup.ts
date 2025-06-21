import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Global setup for E2E tests
declare global {
  var E2E_CONFIG: {
    hasCredentials: boolean
    apiKey?: string
    hostname?: string
  }
}

// Check if we have the required credentials for E2E tests
const apiKey = process.env.SUBSTACK_API_KEY || process.env.E2E_API_KEY
const hostname = process.env.SUBSTACK_HOSTNAME || process.env.E2E_HOSTNAME

global.E2E_CONFIG = {
  hasCredentials: !!apiKey,
  apiKey,
  hostname
}

// If no credentials are available, skip all E2E tests
if (!global.E2E_CONFIG.hasCredentials) {
  console.warn(`
⚠️  E2E tests will be skipped because SUBSTACK_API_KEY is not set.
    To run E2E tests, set the following environment variables:
    - SUBSTACK_API_KEY: Your Substack API key
    - SUBSTACK_HOSTNAME: (optional) Your Substack hostname
    
    You can also create a .env file with these variables.
  `)
}
