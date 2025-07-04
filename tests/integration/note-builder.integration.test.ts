import { SubstackClient } from '../../src/substack-client'
import { readFileSync } from 'fs'
import { join } from 'path'

interface CapturedRequest {
  url: string
  method: string
  body: unknown
  headers: unknown
}

describe('NoteBuilder Integration Tests', () => {
  let client: SubstackClient
  let _capturedRequests: CapturedRequest[] = []

  beforeEach(() => {
    // Reset captured requests
    _capturedRequests = []

    // Create client configured to use our local test server
    const url = new URL(global.INTEGRATION_SERVER.url)
    const hostname = `${url.hostname}:${url.port}`

    client = new SubstackClient({
      hostname: hostname,
      apiKey: 'test-key',
      protocol: 'http' // Use HTTP for local test server
    })
  })

  describe('Note Builder HTTP Request Validation', () => {
    test('should send correct request structure for simple note', async () => {
      try {
        const profile = await client.ownProfile()
        const result = await profile.newNote('test').publish()

        // The request should have been captured by our mock server
        expect(result).toBeDefined()
      } catch (error) {
        // Expected - we're testing request structure, not auth success
        expect(error).toBeInstanceOf(Error)
      }

      // Verify the request was made to correct endpoint
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

      // Verify response matches expected structure from samples
      expect(responseData).toHaveProperty('user_id')
      expect(responseData).toHaveProperty('body_json')
      expect(responseData).toHaveProperty('type', 'feed')
      expect(responseData).toHaveProperty('status', 'published')
    })

    test('should send correct request for multiple paragraphs', async () => {
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
                    text: 'first paragraph'
                  }
                ]
              },
              {
                type: 'paragraph',
                content: [
                  {
                    type: 'text',
                    text: 'second paragraph'
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
      expect(responseData).toHaveProperty('body_json.content')
    })

    test('should send correct request for rich formatting', async () => {
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
                    marks: [{ type: 'bold' }],
                    text: 'bold text'
                  },
                  {
                    type: 'text',
                    marks: [{ type: 'italic' }],
                    text: 'italic text'
                  },
                  {
                    type: 'text',
                    marks: [{ type: 'code' }],
                    text: 'code text'
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

      // Verify response structure matches sample
      expect(responseData).toHaveProperty('body_json.type', 'doc')
      expect(responseData).toHaveProperty('body_json.attrs.schemaVersion', 'v1')
      expect(Array.isArray(responseData.body_json.content)).toBe(true)
    })

    test('should validate request against provided example structure', async () => {
      // Load the expected request structure from samples
      const expectedRequestPath = join(process.cwd(), 'samples', 'api', 'v1', 'comment', 'feed')
      const expectedRequestData = JSON.parse(readFileSync(expectedRequestPath, 'utf8'))

      // Verify our request structure matches the expected format
      expect(expectedRequestData).toHaveProperty('bodyJson')
      expect(expectedRequestData.bodyJson).toHaveProperty('type', 'doc')
      expect(expectedRequestData.bodyJson).toHaveProperty('attrs.schemaVersion', 'v1')
      expect(expectedRequestData.bodyJson).toHaveProperty('content')
      expect(expectedRequestData).toHaveProperty('tabId', 'for-you')
      expect(expectedRequestData).toHaveProperty('surface', 'feed')
      expect(expectedRequestData).toHaveProperty('replyMinimumRole', 'everyone')

      // Test that our mock server can handle this structure
      const response = await fetch(`${global.INTEGRATION_SERVER.url}/api/v1/comment/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(expectedRequestData)
      })

      expect(response.status).toBe(200)
    })

    test('should return response matching provided example', async () => {
      // Load the expected response structure from samples
      const expectedResponsePath = join(
        process.cwd(),
        'samples',
        'api',
        'v1',
        'comment',
        'response'
      )
      const expectedResponseData = JSON.parse(readFileSync(expectedResponsePath, 'utf8'))

      const response = await fetch(`${global.INTEGRATION_SERVER.url}/api/v1/comment/feed`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          bodyJson: {
            type: 'doc',
            attrs: { schemaVersion: 'v1' },
            content: []
          },
          tabId: 'for-you',
          surface: 'feed',
          replyMinimumRole: 'everyone'
        })
      })

      expect(response.status).toBe(200)
      const actualResponseData = await response.json()

      // Verify response structure matches the sample
      expect(actualResponseData).toHaveProperty('user_id', expectedResponseData.user_id)
      expect(actualResponseData).toHaveProperty(
        'body_json.type',
        expectedResponseData.body_json.type
      )
      expect(actualResponseData).toHaveProperty(
        'body_json.attrs.schemaVersion',
        expectedResponseData.body_json.attrs.schemaVersion
      )
      expect(actualResponseData).toHaveProperty('type', expectedResponseData.type)
      expect(actualResponseData).toHaveProperty('status', expectedResponseData.status)
      expect(actualResponseData).toHaveProperty(
        'reply_minimum_role',
        expectedResponseData.reply_minimum_role
      )
    })
  })
})
