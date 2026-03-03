import { SubstackClient } from '@substack-api/substack-client'

describe('note publishing integration tests', () => {
  let client: SubstackClient

  beforeEach(() => {
    global.INTEGRATION_SERVER.capturedRequests.length = 0

    client = new SubstackClient({
      gatewayUrl: global.INTEGRATION_SERVER.url,
      publicationUrl: 'https://test.substack.com',
      token: 'dummy-token'
    })
  })

  describe('publishNote without attachment', () => {
    test('should POST markdown content to /api/v1/notes', async () => {
      const profile = await client.ownProfile()
      await profile.publishNote('**test**\n\n_test1_\n\n`another test` \n\njust a test')

      expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(1)
      const req = global.INTEGRATION_SERVER.capturedRequests[0]

      expect(req.method).toBe('POST')
      expect(req.url).toBe('/api/v1/notes')

      const body = req.body as { content: string }
      expect(body.content).toContain('**test**')
      expect(body.content).toContain('_test1_')
      expect(body.content).toContain('`another test`')
      expect(body.content).toContain('just a test')
      expect(body).not.toHaveProperty('attachment')
    })

    test('should return note ID from gateway response', async () => {
      const profile = await client.ownProfile()
      const result = await profile.publishNote('Hello')
      expect(result.id).toBeGreaterThan(0)
    })
  })

  describe('publishNote with attachment', () => {
    test('should include attachment field in POST body', async () => {
      const profile = await client.ownProfile()
      const testUrl = 'https://iam.slys.dev/p/understanding-locking-contention'

      await profile.publishNote('Check out this **interesting article** about system design!', {
        attachment: testUrl
      })

      expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(1)
      const req = global.INTEGRATION_SERVER.capturedRequests[0]

      expect(req.method).toBe('POST')
      expect(req.url).toBe('/api/v1/notes')

      const body = req.body as { content: string; attachment: string }
      expect(body.content).toContain('**interesting article**')
      expect(body.attachment).toBe(testUrl)
    })

    test('should preserve attachment URL for various URL formats', async () => {
      const profile = await client.ownProfile()
      const urls = [
        'https://blog.example.com/post/123',
        'http://example.com/article',
        'https://subdomain.domain.com/path?param=value'
      ]

      for (const testUrl of urls) {
        global.INTEGRATION_SERVER.capturedRequests.length = 0

        await profile.publishNote('Testing URL', { attachment: testUrl })

        const body = global.INTEGRATION_SERVER.capturedRequests[0].body as { attachment: string }
        expect(body.attachment).toBe(testUrl)
      }
    })

    test('should preserve complex markdown content alongside attachment', async () => {
      const profile = await client.ownProfile()

      await profile.publishNote(
        'This is a **complex note** with _formatting_.\n\nWith `code` and [a link](https://ref.example.com).',
        { attachment: 'https://example.com/article' }
      )

      const body = global.INTEGRATION_SERVER.capturedRequests[0].body as {
        content: string
        attachment: string
      }

      expect(body.content).toContain('**complex note**')
      expect(body.content).toContain('_formatting_')
      expect(body.content).toContain('`code`')
      expect(body.content).toContain('[a link](https://ref.example.com)')
      expect(body.attachment).toBe('https://example.com/article')
    })
  })
})
