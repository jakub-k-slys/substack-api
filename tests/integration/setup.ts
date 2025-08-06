import { createServer, Server } from 'http'
import { readFileSync } from 'fs'
import { join } from 'path'

declare global {
  var INTEGRATION_SERVER: {
    server: Server
    port: number
    url: string
    capturedRequests: Array<{
      method: string
      url: string
      headers: Record<string, string>
      body: unknown
    }>
  }
}

// Mock HTTP server that serves sample API responses
const createMockServer = (): Promise<{
  server: Server
  port: number
  url: string
  capturedRequests: Array<{
    method: string
    url: string
    headers: Record<string, string>
    body: unknown
  }>
}> => {
  return new Promise((resolve, reject) => {
    const capturedRequests: Array<{
      method: string
      url: string
      headers: Record<string, string>
      body: unknown
    }> = []

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

      // Handle POST requests to /api/v1/comment/attachment (attachment creation)
      if (req.method === 'POST' && req.url === '/api/v1/comment/attachment') {
        let body = ''
        req.on('data', (chunk) => {
          body += chunk.toString()
        })
        req.on('end', () => {
          try {
            // Parse and capture the request for verification
            const requestData = JSON.parse(body)

            // Capture the request for test verification
            capturedRequests.push({
              method: req.method!,
              url: req.url!,
              headers: req.headers as Record<string, string>,
              body: requestData
            })

            // Basic validation that we received some data
            if (!requestData) {
              res.writeHead(400)
              res.end(JSON.stringify({ error: 'Empty request body' }))
              return
            }

            // Return the sample attachment response
            const sampleResponsePath = join(
              process.cwd(),
              'samples',
              'api',
              'v1',
              'comment',
              'attachment-response'
            )
            const sampleData = readFileSync(sampleResponsePath, 'utf8')
            res.writeHead(200)
            res.end(sampleData)
          } catch (error) {
            console.error('Error processing attachment creation request:', error)
            res.writeHead(400)
            res.end(JSON.stringify({ error: 'Invalid JSON' }))
          }
        })
        return
      }

      // Handle POST requests to /api/v1/comment/feed (note publishing)
      if (req.method === 'POST' && req.url === '/api/v1/comment/feed') {
        let body = ''
        req.on('data', (chunk) => {
          body += chunk.toString()
        })
        req.on('end', () => {
          try {
            // Parse and capture the request for verification
            const requestData = JSON.parse(body)

            // Capture the request for test verification
            capturedRequests.push({
              method: req.method!,
              url: req.url!,
              headers: req.headers as Record<string, string>,
              body: requestData
            })

            // Basic validation that we received some data
            if (!requestData) {
              res.writeHead(400)
              res.end(JSON.stringify({ error: 'Empty request body' }))
              return
            }

            // Return the sample response
            const sampleResponsePath = join(
              process.cwd(),
              'samples',
              'api',
              'v1',
              'comment',
              'response'
            )
            const sampleData = readFileSync(sampleResponsePath, 'utf8')
            res.writeHead(200)
            res.end(sampleData)
          } catch (error) {
            console.error('Error processing note publish request:', error)
            res.writeHead(400)
            res.end(JSON.stringify({ error: 'Invalid JSON' }))
          }
        })
        return
      }

      // Map URLs to sample files for GET requests
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
      resolve({ server, port, url, capturedRequests })
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
    'api/v1/user/254824415/profile': 'user/282291554/profile', // Map the subscription user_id to existing profile
    'api/v1/user/jakubslys/public_profile': 'user/jakubslys/public_profile',
    'api/v1/users/282291554': 'user/282291554/profile',
    'api/v1/users/254824415': 'user/282291554/profile', // Map the subscription user_id to existing profile
    'api/v1/reader/feed/profile/282291554': 'reader/feed/profile/282291554',
    'api/v1/profile/posts': 'profile/posts?profile_user_id=27968736&limit=50',
    'api/v1/feed/following': 'feed/following',
    'api/v1/reader/comment/131648795': 'reader/comment/131648795',
    'api/v1/posts/by-id/167180194': 'posts/by-id/167180194'
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
