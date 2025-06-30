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

  function getTestCredentials(): { apiKey: string; hostname?: string } | null
}

// Check for credentials but don't fail early - let individual tests handle missing credentials
const apiKey = process.env.SUBSTACK_API_KEY || process.env.E2E_API_KEY
const hostname = process.env.SUBSTACK_HOSTNAME || process.env.E2E_HOSTNAME

if (apiKey) {
  global.E2E_CONFIG = {
    hasCredentials: true,
    apiKey,
    hostname
  }
} else {
  global.E2E_CONFIG = {
    hasCredentials: false
  }
}

// Helper function to get credentials for tests
global.getTestCredentials = (): { apiKey: string; hostname?: string } | null => {
  if (global.E2E_CONFIG.hasCredentials && global.E2E_CONFIG.apiKey) {
    return {
      apiKey: global.E2E_CONFIG.apiKey,
      hostname: global.E2E_CONFIG.hostname
    }
  }
  return null
}
