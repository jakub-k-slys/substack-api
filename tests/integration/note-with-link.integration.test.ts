import { SubstackClient } from '../../src/substack-client'
import { readFileSync } from 'fs'
import { join } from 'path'

describe('note with link attachment integration tests', () => {
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

  test('should create attachment and publish note with correct request structure', async () => {
    const profile = await client.ownProfile()
    const testUrl = 'https://iam.slys.dev/p/understanding-locking-contention'

    await profile
      .newNoteWithLink(testUrl)
      .paragraph()
      .text('Check out this ')
      .bold('interesting article')
      .text(' about system design!')
      .publish()

    // Should have made 2 requests: attachment creation + note publishing
    expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(2)

    // Verify first request was attachment creation
    const attachmentRequest = global.INTEGRATION_SERVER.capturedRequests[0]
    expect(attachmentRequest.method).toBe('POST')
    expect(attachmentRequest.url).toBe('/api/v1/comment/attachment')

    const expectedAttachmentRequestPath = join(
      process.cwd(),
      'samples',
      'api',
      'v1',
      'comment',
      'attachment'
    )
    const expectedAttachmentData = JSON.parse(readFileSync(expectedAttachmentRequestPath, 'utf8'))
    expect(attachmentRequest.body).toEqual(expectedAttachmentData)

    // Verify second request was note publishing with attachment
    const noteRequest = global.INTEGRATION_SERVER.capturedRequests[1]
    expect(noteRequest.method).toBe('POST')
    expect(noteRequest.url).toBe('/api/v1/comment/feed')

    const capturedNoteBody = noteRequest.body as any

    // Verify the structure matches our expected format
    expect(capturedNoteBody).toMatchObject({
      bodyJson: {
        type: 'doc',
        attrs: { schemaVersion: 'v1' },
        content: [
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Check out this ' },
              { type: 'text', text: 'interesting article', marks: [{ type: 'bold' }] },
              { type: 'text', text: ' about system design!' }
            ]
          }
        ]
      },
      attachmentIds: ['19b5d6f9-46db-47d6-b381-17cb5f443c00'],
      replyMinimumRole: 'everyone',
      tabId: 'for-you',
      surface: 'feed'
    })
  })

  test('should build complex note with attachment and correct structure', async () => {
    const profile = await client.ownProfile()
    const testUrl = 'https://example.com/test-article'

    await profile
      .newNoteWithLink(testUrl)
      .paragraph()
      .text('This is a ')
      .bold('complex note')
      .text(' with multiple ')
      .italic('formatting options')
      .text('.')
      .paragraph()
      .text('It includes ')
      .link('internal links', 'https://internal.example.com')
      .text(' and ')
      .code('code snippets')
      .text('.')
      .publish()

    expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(2)

    const attachmentRequest = global.INTEGRATION_SERVER.capturedRequests[0]
    expect(attachmentRequest.body).toEqual({
      url: 'https://example.com/test-article',
      type: 'link'
    })

    const noteRequest = global.INTEGRATION_SERVER.capturedRequests[1]
    const noteBody = noteRequest.body as any

    // Verify the complex structure was built correctly
    expect(noteBody.bodyJson.content).toHaveLength(2) // Two paragraphs

    // First paragraph
    expect(noteBody.bodyJson.content[0].content).toEqual([
      { type: 'text', text: 'This is a ' },
      { type: 'text', text: 'complex note', marks: [{ type: 'bold' }] },
      { type: 'text', text: ' with multiple ' },
      { type: 'text', text: 'formatting options', marks: [{ type: 'italic' }] },
      { type: 'text', text: '.' }
    ])

    // Second paragraph
    expect(noteBody.bodyJson.content[1].content).toEqual([
      { type: 'text', text: 'It includes ' },
      {
        type: 'text',
        text: 'internal links',
        marks: [{ type: 'link', attrs: { href: 'https://internal.example.com' } }]
      },
      { type: 'text', text: ' and ' },
      { type: 'text', text: 'code snippets', marks: [{ type: 'code' }] },
      { type: 'text', text: '.' }
    ])

    // Verify attachment ID is included
    expect(noteBody.attachmentIds).toEqual(['19b5d6f9-46db-47d6-b381-17cb5f443c00'])
  })

  test('should handle different URL formats correctly', async () => {
    const profile = await client.ownProfile()
    const urls = [
      'https://blog.example.com/post/123',
      'http://example.com/article',
      'https://subdomain.domain.com/path?param=value'
    ]

    for (const testUrl of urls) {
      // Clear previous requests
      global.INTEGRATION_SERVER.capturedRequests.length = 0

      await profile
        .newNoteWithLink(testUrl)
        .paragraph()
        .text(`Testing with URL: ${testUrl}`)
        .publish()

      expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(2)

      const attachmentRequest = global.INTEGRATION_SERVER.capturedRequests[0]
      expect(attachmentRequest.body).toEqual({
        url: testUrl,
        type: 'link'
      })
    }
  })

  test('should work with lists and complex formatting', async () => {
    const profile = await client.ownProfile()

    await profile
      .newNoteWithLink('https://example.com/list-article')
      .paragraph()
      .text('Here are some key points from the article:')
      .bulletList()
      .item()
      .text('First ')
      .bold('important')
      .text(' point')
      .item()
      .text('Second point with ')
      .link('a link', 'https://reference.com')
      .item()
      .code('Third point')
      .text(' with code')
      .finish()
      .publish()

    expect(global.INTEGRATION_SERVER.capturedRequests).toHaveLength(2)

    const noteRequest = global.INTEGRATION_SERVER.capturedRequests[1]
    const noteBody = noteRequest.body as any

    // Should have paragraph + bullet list
    expect(noteBody.bodyJson.content).toHaveLength(2)
    expect(noteBody.bodyJson.content[0].type).toBe('paragraph')
    expect(noteBody.bodyJson.content[1].type).toBe('bulletList')

    // Verify bullet list structure
    const bulletList = noteBody.bodyJson.content[1]
    expect(bulletList.content).toHaveLength(3) // Three list items

    // Verify attachment is included
    expect(noteBody.attachmentIds).toEqual(['19b5d6f9-46db-47d6-b381-17cb5f443c00'])
  })
})
