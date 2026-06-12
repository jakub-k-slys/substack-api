import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

// Global setup for E2E tests
declare global {
  var E2E_CONFIG: {
    hasCredentials: boolean
    substackSid?: string
    connectSid?: string
    publicationUrl?: string
  }

  function getTestCredentials(): {
    substackSid?: string
    connectSid?: string
    publicationUrl?: string
  } | null
}

// Check for credentials but don't fail early - let individual tests handle missing credentials
// SUBSTACK_API_KEY / E2E_API_KEY are legacy substack-api names for the substack.sid value
const substackSid =
  process.env.SUBSTACK_SID || process.env.SUBSTACK_API_KEY || process.env.E2E_API_KEY
const connectSid = process.env.CONNECT_SID
const hostname = process.env.SUBSTACK_HOSTNAME || process.env.E2E_HOSTNAME

// Convert hostname to full URL if it doesn't start with http
const publicationUrl = hostname
  ? hostname.startsWith('http')
    ? hostname
    : `https://${hostname}`
  : undefined

if (substackSid || connectSid) {
  global.E2E_CONFIG = {
    hasCredentials: true,
    substackSid,
    connectSid,
    publicationUrl
  }
} else {
  global.E2E_CONFIG = {
    hasCredentials: false
  }
}

// Helper function to get credentials for tests
global.getTestCredentials = (): {
  substackSid?: string
  connectSid?: string
  publicationUrl?: string
} | null => {
  if (
    global.E2E_CONFIG.hasCredentials &&
    (global.E2E_CONFIG.substackSid || global.E2E_CONFIG.connectSid)
  ) {
    return {
      substackSid: global.E2E_CONFIG.substackSid,
      connectSid: global.E2E_CONFIG.connectSid,
      publicationUrl: global.E2E_CONFIG.publicationUrl
    }
  }
  return null
}
