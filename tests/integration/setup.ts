import { createServer, Server } from 'http'
import { readFileSync } from 'fs'
import { join } from 'path'

declare global {
  var INTEGRATION_SERVER: {
    server: Server
    port: number
    url: string
  }
}

// Mock HTTP server that serves sample API responses
const createMockServer = (): Promise<{ server: Server; port: number; url: string }> => {
  return new Promise((resolve, reject) => {
    const server = createServer((req, res) => {
      res.setHeader('Content-Type', 'application/json')
      res.setHeader('Access-Control-Allow-Origin', '*')
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')

      if (req.method === 'OPTIONS') {
        res.writeHead(200)
        res.end()
        return
      }

      // Map URLs to sample files
      const samplePath = mapUrlToSampleFile(req.url || '')

      if (samplePath) {
        try {
          const sampleData = readFileSync(samplePath, 'utf8')
          res.writeHead(200)
          res.end(sampleData)
        } catch {
          console.warn(`Sample file not found: ${samplePath}`)
          res.writeHead(404)
          res.end(JSON.stringify({ error: 'Not Found' }))
        }
      } else {
        res.writeHead(404)
        res.end(JSON.stringify({ error: 'Not Found' }))
      }
    })

    server.listen(0, '127.0.0.1', () => {
      const address = server.address()
      if (!address || typeof address === 'string') {
        reject(new Error('Failed to get server address'))
        return
      }

      const port = address.port
      const url = `http://localhost:${port}`
      resolve({ server, port, url })
    })

    server.on('error', reject)
  })
}

// Map API URLs to sample file paths
function mapUrlToSampleFile(url: string): string | null {
  const samplesDir = join(process.cwd(), 'samples', 'api', 'v1')

  // Remove query parameters and leading slash
  const cleanUrl = url.split('?')[0].replace(/^\//, '')

  // Map common API endpoints to sample files
  const mappings: Record<string, string | null> = {
    'api/v1/subscription': 'subscription',
    'api/v1/subscriptions': 'subscriptions',
    'api/v1/user/282291554/profile': 'user/282291554/profile',
    'api/v1/user/jakubslys/public_profile': 'user/jakubslys/public_profile',
    'api/v1/users/282291554': 'user/282291554/profile',
    'api/v1/reader/feed/profile/282291554': 'reader/feed/profile/282291554',
    'api/v1/profile/posts': 'profile/posts?profile_user_id=27968736&limit=50',
    'api/v1/feed/following': 'feed/following'
  }

  const sampleFile = mappings[cleanUrl]
  if (sampleFile === null) {
    // Explicitly mapped to null - return null to trigger 404
    return null
  }
  if (sampleFile) {
    return join(samplesDir, sampleFile)
  }

  // Try direct mapping
  const directPath = join(samplesDir, cleanUrl)
  try {
    readFileSync(directPath, 'utf8')
    return directPath
  } catch {
    return null
  }
}

// Helper function to create a test HTTP client that uses our mock server
export async function createTestHttpClient() {
  const response = await fetch(`${global.INTEGRATION_SERVER.url}/api/v1/subscription`)
  return response.json()
}

// Global setup for integration tests
beforeAll(async () => {
  global.INTEGRATION_SERVER = await createMockServer()
  console.log(`Integration test server running on ${global.INTEGRATION_SERVER.url}`)
})

afterAll(() => {
  if (global.INTEGRATION_SERVER?.server) {
    global.INTEGRATION_SERVER.server.close()
  }
})
