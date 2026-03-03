import { createServer, Server } from 'http'

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

// Gateway-format sample data
const SAMPLE_PROFILE = {
  id: 27968736,
  handle: 'jakubslys',
  name: 'Jakub Slys 🎖️',
  url: 'https://substack.com/@jakubslys',
  avatar_url: 'https://example.com/jakubslys.jpg',
  bio: 'Ever wonder how Uber matches rides to drivers in real time?'
}

const SAMPLE_NOTE = {
  id: 789,
  body: 'Test note body',
  likes_count: 5,
  author: {
    id: 27968736,
    name: 'Jakub Slys 🎖️',
    handle: 'jakubslys',
    avatar_url: 'https://example.com/jakubslys.jpg'
  },
  published_at: '2025-01-01T00:00:00Z'
}

const SAMPLE_FULL_POST = {
  id: 167180194,
  title: 'Week of June 24, 2025: Build SaaS Without Code',
  subtitle: 'The New Blueprint for Solopreneurs',
  slug: 'week-of-june-24-2025-build-saas-without',
  url: 'https://iam.slys.dev/p/week-of-june-24-2025-build-saas-without',
  published_at: '2025-06-24T00:00:00Z',
  html_body:
    '<div class="captioned-image-container">content shatters the myth about no-code limits</div>',
  reactions: { '❤': 4 },
  restacks: 1,
  tags: ['tldr', 'workflows', 'content', 'digest', 'solopreneur', 'entrepreneur', 'agency'],
  cover_image: 'https://substack-post-media.s3.amazonaws.com/public/images/cover.jpg'
}

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

    const readBody = (req: import('http').IncomingMessage): Promise<unknown> =>
      new Promise((res, rej) => {
        let raw = ''
        req.on('data', (chunk) => (raw += chunk.toString()))
        req.on('end', () => {
          try {
            res(JSON.parse(raw))
          } catch {
            res(null)
          }
        })
        req.on('error', rej)
      })

    const server = createServer(async (req, res) => {
      res.setHeader('Content-Type', 'application/json')

      if (req.method === 'OPTIONS') {
        res.writeHead(200)
        res.end()
        return
      }

      const url = (req.url || '').split('?')[0]
      const method = req.method || 'GET'

      // POST /api/v1/notes — capture and return create-note response
      if (method === 'POST' && url === '/api/v1/notes') {
        const body = await readBody(req)
        capturedRequests.push({
          method,
          url,
          headers: req.headers as Record<string, string>,
          body
        })
        res.writeHead(200)
        res.end(JSON.stringify({ id: 12345 }))
        return
      }

      // GET routes
      if (method === 'GET') {
        const routes: Record<string, unknown> = {
          '/api/v1/health/ready': { status: 'ok' },
          '/api/v1/me': SAMPLE_PROFILE,
          '/api/v1/profiles/jakubslys': SAMPLE_PROFILE,
          '/api/v1/profiles/jakubslys/posts': {
            items: [
              {
                id: 167180194,
                title: 'Week of June 24, 2025: Build SaaS Without Code',
                published_at: '2025-06-24T00:00:00Z'
              }
            ]
          },
          '/api/v1/profiles/jakubslys/notes': { items: [SAMPLE_NOTE] },
          '/api/v1/me/notes': { items: [SAMPLE_NOTE] },
          '/api/v1/me/following': { items: [{ id: 282291554, handle: 'jennyouyang' }] },
          '/api/v1/posts/167180194': SAMPLE_FULL_POST,
          '/api/v1/posts/167180194/comments': {
            items: [{ id: 999, body: 'Great post!', is_admin: false }]
          },
          '/api/v1/notes/789': SAMPLE_NOTE
        }

        if (Object.prototype.hasOwnProperty.call(routes, url)) {
          res.writeHead(200)
          res.end(JSON.stringify(routes[url]))
        } else {
          res.writeHead(404)
          res.end(JSON.stringify({ error: 'Not Found' }))
        }
        return
      }

      res.writeHead(404)
      res.end(JSON.stringify({ error: 'Not Found' }))
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

beforeAll(async () => {
  global.INTEGRATION_SERVER = await createMockServer()
  console.log(`Integration test server running on ${global.INTEGRATION_SERVER.url}`)
})

afterAll(() => {
  if (global.INTEGRATION_SERVER?.server) {
    global.INTEGRATION_SERVER.server.close()
  }
})
