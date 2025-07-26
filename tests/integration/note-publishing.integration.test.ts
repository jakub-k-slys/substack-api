import { SubstackClient } from '../../src/substack-client'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('note publishing tests', () => {
  let client: SubstackClient

  beforeEach(() => {
    // Clear captured requests before each test
    global.INTEGRATION_SERVER.capturedRequests.length = 0

    // Create client configured to use our local test server
    const url = new URL(global.INTEGRATION_SERVER.url)
    const hostname = `${url.hostname}:${url.port}`

    client = new SubstackClient({
      hostname: hostname,
      apiKey: 'test-key',
      protocol: 'http' // Use HTTP for local test server
    })
  })

  test('should build and publish note with correct request structure and response', async () => {
    const profile = await client.ownProfile()
    await profile
      .newNote()
      .paragraph()
      .bold('test')
      .paragraph()
      .italic('test1')
      .paragraph()
      .code('another test')
      .text(' ')
      .paragraph()
      .text('just a test')
      .publish()

    expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(1)
    const capturedRequest = global.INTEGRATION_SERVER.capturedRequests[0]

    expect(capturedRequest.method).toBe('POST')
    expect(capturedRequest.url).toBe('/api/v1/comment/feed')

    const expectedRequestPath = join(process.cwd(), 'samples', 'api', 'v1', 'comment', 'feed')
    const expectedRequestData = JSON.parse(readFileSync(expectedRequestPath, 'utf8'))

    const capturedRequestBody = capturedRequest.body as Record<string, unknown>
    console.log('Captured request body:', capturedRequestBody)
    console.log('Expected request body:', expectedRequestData)
    expect(capturedRequestBody).toEqual(expectedRequestData)
  })
})
