import { SubstackClient } from '@substack-api/substack-client'

describe('note with link attachment integration tests', () => {
  let client: SubstackClient

  beforeEach(() => {
    global.INTEGRATION_SERVER.capturedRequests.length = 0

    client = new SubstackClient({
      gatewayUrl: global.INTEGRATION_SERVER.url,
      publicationUrl: 'https://test.substack.com',
      token: 'dummy-token'
    })
  })

  test('should publish note with link as single POST with attachment field', async () => {
    const profile = await client.ownProfile()
    const testUrl = 'https://iam.slys.dev/p/understanding-locking-contention'

    await profile.publishNote(
      'Check out this **interesting article** about system design!',
      { attachment: testUrl }
    )

    // Single request — gateway handles markdown + attachment in one call
    expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(1)
    const req = global.INTEGRATION_SERVER.capturedRequests[0]

    expect(req.method).toBe('POST')
    expect(req.url).toBe('/api/v1/notes')

    const body = req.body as { content: string; attachment: string }
    expect(body.content).toContain('Check out this ')
    expect(body.content).toContain('**interesting article**')
    expect(body.content).toContain(' about system design!')
    expect(body.attachment).toBe(testUrl)
  })

  test('should include attachment URL for different URL formats', async () => {
    const profile = await client.ownProfile()
    const urls = [
      'https://blog.example.com/post/123',
      'http://example.com/article',
      'https://subdomain.domain.com/path?param=value'
    ]

    for (const testUrl of urls) {
      global.INTEGRATION_SERVER.capturedRequests.length = 0

      await profile.publishNote('Testing URL', { attachment: testUrl })

      expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(1)
      const body = global.INTEGRATION_SERVER.capturedRequests[0].body as { attachment: string }
      expect(body.attachment).toBe(testUrl)
    }
  })

  test('should send correct markdown for complex note with link', async () => {
    const profile = await client.ownProfile()

    await profile.publishNote(
      'This is a **complex note** with _formatting_.\n\nWith `code` and [a link](https://ref.example.com).',
      { attachment: 'https://example.com/article' }
    )

    expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(1)
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
