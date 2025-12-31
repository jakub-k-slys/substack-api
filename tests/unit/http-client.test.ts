import { HttpClient } from '@substack-api/internal/http-client'
import axios from 'axios'
import type { AxiosInstance } from 'axios'

jest.mock('axios')
jest.mock('axios-rate-limit', () => (instance: AxiosInstance) => instance)

const mockedAxios = axios as jest.Mocked<typeof axios>

describe('HttpClient', () => {
  let mockAxiosInstance: jest.Mocked<AxiosInstance>

  beforeEach(() => {
    jest.clearAllMocks()

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn()
    } as unknown as jest.Mocked<AxiosInstance>

    mockedAxios.create.mockReturnValue(mockAxiosInstance)
  })

  describe('constructor', () => {
    it('should throw error when token is missing', () => {
      expect(() => new HttpClient('https://test.com', '')).toThrow('API token is required')
    })

    it('should create axios instance with correct base URL and headers', () => {
      const client = new HttpClient('https://test.substack.com', 'test-api-key')

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://test.substack.com',
        headers: {
          Cookie: 'substack.sid=test-api-key'
        }
      })
      expect(client).toBeDefined()
    })
  })

  describe('get', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' }
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockResponse
      })

      const client = new HttpClient('https://test.substack.com', 'test-api-key')

      const result = await client.get('/test')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test')
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on non-200 response', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
        data: {}
      })

      const client = new HttpClient('https://test.substack.com', 'test-api-key')

      await expect(client.get('/test')).rejects.toThrow('HTTP 404: Not Found')
    })
  })

  describe('post', () => {
    it('should make successful POST request with data', async () => {
      const mockResponse = { success: true }
      const postData = { title: 'Test Post' }

      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: mockResponse
      })

      const client = new HttpClient('https://test.substack.com', 'test-api-key')

      const result = await client.post('/test', postData)

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', postData)
      expect(result).toEqual(mockResponse)
    })

    it('should make POST request without data', async () => {
      const mockResponse = { success: true }

      mockAxiosInstance.post.mockResolvedValue({
        status: 200,
        data: mockResponse
      })

      const client = new HttpClient('https://test.substack.com', 'test-api-key')

      const result = await client.post('/test')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', undefined)
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on non-200 response', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        status: 500,
        statusText: 'Internal Server Error',
        data: {}
      })

      const client = new HttpClient('https://test.substack.com', 'test-api-key')

      await expect(client.post('/test', {})).rejects.toThrow('HTTP 500: Internal Server Error')
    })
  })

  describe('put', () => {
    it('should make successful PUT request with data', async () => {
      const mockResponse = { success: true }
      const putData = { title: 'Updated Post' }

      mockAxiosInstance.put.mockResolvedValue({
        status: 200,
        data: mockResponse
      })

      const client = new HttpClient('https://test.substack.com', 'test-api-key')

      const result = await client.put('/test', putData)

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', putData)
      expect(result).toEqual(mockResponse)
    })

    it('should make PUT request without data', async () => {
      const mockResponse = { success: true }

      mockAxiosInstance.put.mockResolvedValue({
        status: 200,
        data: mockResponse
      })

      const client = new HttpClient('https://test.substack.com', 'test-api-key')

      const result = await client.put('/test')

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', undefined)
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on non-200 response', async () => {
      mockAxiosInstance.put.mockResolvedValue({
        status: 403,
        statusText: 'Forbidden',
        data: {}
      })

      const client = new HttpClient('https://test.substack.com', 'test-api-key')

      await expect(client.put('/test', {})).rejects.toThrow('HTTP 403: Forbidden')
    })
  })
})
