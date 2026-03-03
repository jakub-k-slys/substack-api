import { HttpClient } from '@substack-api/internal/http-client'
import axios from 'axios'
import type { AxiosInstance } from 'axios'

jest.mock('axios')
jest.mock('axios-rate-limit', () => (instance: AxiosInstance) => instance)

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('HttpClient', () => {
  let client: HttpClient
  let mockAxiosInstance: jest.Mocked<AxiosInstance>

  beforeEach(() => {
    jest.clearAllMocks()

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    } as unknown as jest.Mocked<AxiosInstance>

    mockedAxios.create.mockReturnValue(mockAxiosInstance)

    client = new HttpClient('https://test.com', {
      token: 'dummy-token',
      publicationUrl: 'https://pub.com'
    })
  })

  describe('constructor', () => {
    it('should create axios instance with Authorization Bearer and x-publication-url headers', () => {
      jest.clearAllMocks()
      mockedAxios.create.mockReturnValue(mockAxiosInstance)
      new HttpClient('https://test.com', {
        token: 'my-bearer-token',
        publicationUrl: 'https://pub.example.com'
      })

      expect(mockedAxios.create).toHaveBeenCalledWith(
        expect.objectContaining({
          baseURL: 'https://test.com',
          headers: expect.objectContaining({
            Authorization: expect.stringMatching(/^Bearer /),
            'x-publication-url': 'https://pub.example.com'
          })
        })
      )
    })

    it('should use provided token as bearer token', () => {
      jest.clearAllMocks()
      mockedAxios.create.mockReturnValue(mockAxiosInstance)
      new HttpClient('https://test.com', {
        token: 'my-custom-token',
        publicationUrl: 'https://pub.example.com'
      })

      const createCall = mockedAxios.create.mock.calls[0][0] as { headers: Record<string, string> }
      expect(createCall.headers['Authorization']).toBe('Bearer my-custom-token')
    })
  })

  describe('get', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' }
      mockAxiosInstance.get.mockResolvedValue({ status: 200, data: mockResponse })

      const result = await client.get('/test')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', { params: undefined })
      expect(result).toEqual(mockResponse)
    })

    it('should pass params when provided', async () => {
      mockAxiosInstance.get.mockResolvedValue({ status: 200, data: {} })

      await client.get('/test', { limit: 10, offset: 0 })

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', {
        params: { limit: 10, offset: 0 }
      })
    })

    it('should throw error on non-200 response', async () => {
      mockAxiosInstance.get.mockResolvedValue({ status: 404, statusText: 'Not Found', data: {} })
      await expect(client.get('/test')).rejects.toThrow('HTTP 404: Not Found')
    })
  })

  describe('post', () => {
    it('should make successful POST request with data', async () => {
      const mockResponse = { success: true }
      mockAxiosInstance.post.mockResolvedValue({ status: 200, data: mockResponse })

      const result = await client.post('/test', { title: 'Test Post' })

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', { title: 'Test Post' })
      expect(result).toEqual(mockResponse)
    })

    it('should make POST request without data', async () => {
      mockAxiosInstance.post.mockResolvedValue({ status: 200, data: { success: true } })

      await client.post('/test')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', undefined)
    })

    it('should throw error on non-200 response', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        status: 500,
        statusText: 'Internal Server Error',
        data: {}
      })
      await expect(client.post('/test', {})).rejects.toThrow('HTTP 500: Internal Server Error')
    })
  })

  describe('put', () => {
    it('should make successful PUT request with data', async () => {
      const mockResponse = { success: true }
      mockAxiosInstance.put.mockResolvedValue({ status: 200, data: mockResponse })

      const result = await client.put('/test', { title: 'Updated Post' })

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', { title: 'Updated Post' })
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on non-200 response', async () => {
      mockAxiosInstance.put.mockResolvedValue({ status: 403, statusText: 'Forbidden', data: {} })
      await expect(client.put('/test', {})).rejects.toThrow('HTTP 403: Forbidden')
    })
  })
})
