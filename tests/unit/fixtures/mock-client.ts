import { HttpClient } from '@substack-api/internal/http-client'

export function createMockHttpClient(): jest.Mocked<HttpClient> {
  const mockClient = new HttpClient('https://test.com', {
    token: 'dummy-token',
    publicationUrl: 'https://pub.com'
  }) as jest.Mocked<HttpClient>
  mockClient.get = jest.fn()
  mockClient.post = jest.fn()
  return mockClient
}
