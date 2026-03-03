import { SubstackClient } from '@substack-api/substack-client'

describe('note publishing tests', () => {
  let client: SubstackClient

  beforeEach(() => {
    global.INTEGRATION_SERVER.capturedRequests.length = 0

    client = new SubstackClient({
      gatewayUrl: global.INTEGRATION_SERVER.url,
      publicationUrl: 'https://test.substack.com',
      token: 'dummy-token'
    })
  })

  test('should publish note as markdown to POST /api/v1/notes', async () => {
    const profile = await client.ownProfile()
    await profile.publishNote('**test**\n\n_test1_\n\n`another test` \n\njust a test')

    expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(1)
    const req = global.INTEGRATION_SERVER.capturedRequests[0]

    expect(req.method).toBe('POST')
    expect(req.url).toBe('/api/v1/notes')

    const body = req.body as { content: string }
    expect(typeof body.content).toBe('string')
    expect(body.content).toContain('**test**')
    expect(body.content).toContain('_test1_')
    expect(body.content).toContain('`another test`')
    expect(body.content).toContain('just a test')
    expect(body).not.toHaveProperty('attachment')
  })

  test('should return note ID from gateway response', async () => {
    const profile = await client.ownProfile()
    const result = await profile.publishNote('Hello')
    expect(result.id).toBe(12345)
  })
})
