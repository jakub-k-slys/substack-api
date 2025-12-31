import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Global setup for E2E tests
declare global {
  var E2E_CONFIG: {
    hasCredentials: boolean
    token?: string
    publicationUrl?: string
  }

  function getTestCredentials(): { token: string; publicationUrl?: string } | null
}

// Check for credentials but don't fail early - let individual tests handle missing credentials
const token = process.env.SUBSTACK_API_KEY || process.env.E2E_API_KEY
const hostname = process.env.SUBSTACK_HOSTNAME || process.env.E2E_HOSTNAME

// Convert hostname to full URL if it doesn't start with http
const publicationUrl = hostname
  ? hostname.startsWith('http')
    ? hostname
    : `https://${hostname}`
  : undefined

if (token) {
  global.E2E_CONFIG = {
    hasCredentials: true,
    token,
    publicationUrl
  }
} else {
  global.E2E_CONFIG = {
    hasCredentials: false
  }
}

// Helper function to get credentials for tests
global.getTestCredentials = (): { token: string; publicationUrl?: string } | null => {
  if (global.E2E_CONFIG.hasCredentials && global.E2E_CONFIG.token) {
    return {
      token: global.E2E_CONFIG.token,
      publicationUrl: global.E2E_CONFIG.publicationUrl
    }
  }
  return null
}
