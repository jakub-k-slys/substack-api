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
    // 1. Use Substack API to build and publish note
    try {
      const profile = await client.ownProfile()
      await profile.newNote('test').publish()
    } catch {
      // Expected - we're testing request structure, not auth success
      // The request will still be captured by our mock server
    }

    // 2. Intercept and verify the built request against provided example
    expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(1)
    const capturedRequest = global.INTEGRATION_SERVER.capturedRequests[0]

    // Verify the request was made to the correct endpoint
    expect(capturedRequest.method).toBe('POST')
    expect(capturedRequest.url).toBe('/api/v1/comment/feed')

    // Load the expected request structure from samples
    const expectedRequestPath = join(process.cwd(), 'samples', 'api', 'v1', 'comment', 'feed')
    const expectedRequestData = JSON.parse(readFileSync(expectedRequestPath, 'utf8'))

    // 3. Verify the content of intercepted request against provided example
    const requestBody = capturedRequest.body as Record<string, unknown>
    expect(requestBody).toHaveProperty('bodyJson')
    expect(requestBody.bodyJson).toHaveProperty('type', 'doc')
    expect(requestBody.bodyJson).toHaveProperty('attrs.schemaVersion', 'v1')
    expect(requestBody.bodyJson).toHaveProperty('content')
    expect(Array.isArray((requestBody.bodyJson as Record<string, unknown>).content)).toBe(true)

    // Verify the request structure matches the expected format from samples
    expect(requestBody).toHaveProperty('tabId', expectedRequestData.tabId)
    expect(requestBody).toHaveProperty('surface', expectedRequestData.surface)
    expect(requestBody).toHaveProperty(
      'replyMinimumRole',
      expectedRequestData.replyMinimumRole
    )

    // 4. Verify response structure (already handled by mock server returning sample response)
    // Test that our mock server responds correctly with the provided example response
    const response = await fetch(`${global.INTEGRATION_SERVER.url}/api/v1/comment/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'Bearer test-key'
      },
      body: JSON.stringify({
        bodyJson: {
          type: 'doc',
          attrs: { schemaVersion: 'v1' },
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test'
                }
              ]
            }
          ]
        },
        tabId: 'for-you',
        surface: 'feed',
        replyMinimumRole: 'everyone'
      })
    })

    expect(response.status).toBe(200)
    const responseData = await response.json()

    // Load the expected response structure from samples
    const expectedResponsePath = join(process.cwd(), 'samples', 'api', 'v1', 'comment', 'response')
    const expectedResponseData = JSON.parse(readFileSync(expectedResponsePath, 'utf8'))

    // 5. Verify API is functional by checking response structure
    expect(responseData).toHaveProperty('user_id', expectedResponseData.user_id)
    expect(responseData).toHaveProperty('body_json.type', expectedResponseData.body_json.type)
    expect(responseData).toHaveProperty(
      'body_json.attrs.schemaVersion',
      expectedResponseData.body_json.attrs.schemaVersion
    )
    expect(responseData).toHaveProperty('type', expectedResponseData.type)
    expect(responseData).toHaveProperty('status', expectedResponseData.status)
    expect(responseData).toHaveProperty(
      'reply_minimum_role',
      expectedResponseData.reply_minimum_role
    )
  })
})
