import * as dotenv from 'dotenv'
import { validateE2ECredentials } from './checkEnv'

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

// Validate credentials and fail early if missing
// This ensures E2E tests always run and fail explicitly when credentials are missing
const credentials = validateE2ECredentials()
global.E2E_CONFIG = {
  hasCredentials: true,
  apiKey: credentials.SUBSTACK_API_KEY,
  hostname: credentials.SUBSTACK_HOSTNAME
}
