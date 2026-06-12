import { HttpClient } from '@substackular/internal/http-client'
import { SubstackApiError, SubstackAuthError } from '@substackular/errors'
import axios from 'axios'
import type { AxiosInstance } from 'axios'

jest.mock('axios')
jest.mock('axios-rate-limit', () => (instance: AxiosInstance) => instance)
jest.mock('axios-retry', () => {
  const retryMock = jest.fn() as jest.Mock & {
    exponentialDelay: jest.Mock
    isNetworkError: jest.Mock
  }
  retryMock.exponentialDelay = jest.fn()
  retryMock.isNetworkError = jest.fn()
  return { __esModule: true, default: retryMock }
})

import axiosRetry from 'axios-retry'

const mockedAxios = axios as jest.Mocked<typeof axios>
const mockedAxiosRetry = axiosRetry as unknown as jest.Mock

const expectedHeaders = (cookie: string) => ({
  Cookie: cookie,
  Accept: 'application/json',
  'Content-Type': 'application/json',
  'User-Agent':
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.2 Safari/605.1.15',
  'Accept-Encoding': 'gzip, deflate, br'
})

describe('HttpClient', () => {
  let mockAxiosInstance: jest.Mocked<AxiosInstance>

  beforeEach(() => {
    jest.clearAllMocks()

    mockAxiosInstance = {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn()
    } as unknown as jest.Mocked<AxiosInstance>

    mockedAxios.create.mockReturnValue(mockAxiosInstance)
  })

  describe('constructor', () => {
    it('should throw error when no auth cookie is provided', () => {
      expect(() => new HttpClient('https://test.com', {})).toThrow(
        'At least one authentication cookie is required'
      )
    })

    it('should send substack.sid cookie when only substackSid is provided', () => {
      const client = new HttpClient('https://test.substack.com', { substackSid: 'sid-value' })

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://test.substack.com',
        headers: expectedHeaders('substack.sid=sid-value')
      })
      expect(client).toBeDefined()
    })

    it('should send connect.sid cookie when only connectSid is provided', () => {
      const client = new HttpClient('https://test.substack.com', { connectSid: 'connect-value' })

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://test.substack.com',
        headers: expectedHeaders('connect.sid=connect-value')
      })
      expect(client).toBeDefined()
    })

    it('should send both cookies when both are provided', () => {
      const client = new HttpClient('https://test.substack.com', {
        substackSid: 'sid-value',
        connectSid: 'connect-value'
      })

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://test.substack.com',
        headers: expectedHeaders('substack.sid=sid-value; connect.sid=connect-value')
      })
      expect(client).toBeDefined()
    })

    it('should configure retries on the axios instance', () => {
      new HttpClient('https://test.substack.com', { substackSid: 'sid-value' })

      expect(mockedAxiosRetry).toHaveBeenCalledWith(
        mockAxiosInstance,
        expect.objectContaining({ retries: 3 })
      )
    })

    it('should honor a custom retryAttempts option', () => {
      new HttpClient(
        'https://test.substack.com',
        { substackSid: 'sid-value' },
        { retryAttempts: 7 }
      )

      expect(mockedAxiosRetry).toHaveBeenCalledWith(
        mockAxiosInstance,
        expect.objectContaining({ retries: 7 })
      )
    })
  })

  describe('get', () => {
    it('should make successful GET request', async () => {
      const mockResponse = { data: 'test' }
      mockAxiosInstance.get.mockResolvedValue({
        status: 200,
        data: mockResponse
      })

      const client = new HttpClient('https://test.substack.com', { substackSid: 'test-api-key' })

      const result = await client.get('/test')

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test')
      expect(result).toEqual(mockResponse)
    })

    it('should throw SubstackApiError on non-2xx response', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
        data: {}
      })

      const client = new HttpClient('https://test.substack.com', { substackSid: 'test-api-key' })

      await expect(client.get('/test')).rejects.toThrow('HTTP 404: Not Found')
      await expect(client.get('/test')).rejects.toBeInstanceOf(SubstackApiError)
    })

    it('should throw SubstackAuthError on 401 response', async () => {
      mockAxiosInstance.get.mockResolvedValue({
        status: 401,
        statusText: 'Unauthorized',
        data: {}
      })

      const client = new HttpClient('https://test.substack.com', { substackSid: 'test-api-key' })

      await expect(client.get('/test')).rejects.toBeInstanceOf(SubstackAuthError)
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

      const client = new HttpClient('https://test.substack.com', { substackSid: 'test-api-key' })

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

      const client = new HttpClient('https://test.substack.com', { substackSid: 'test-api-key' })

      const result = await client.post('/test')

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', undefined)
      expect(result).toEqual(mockResponse)
    })

    it('should throw error on non-2xx response', async () => {
      mockAxiosInstance.post.mockResolvedValue({
        status: 500,
        statusText: 'Internal Server Error',
        data: {}
      })

      const client = new HttpClient('https://test.substack.com', { substackSid: 'test-api-key' })

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

      const client = new HttpClient('https://test.substack.com', { substackSid: 'test-api-key' })

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

      const client = new HttpClient('https://test.substack.com', { substackSid: 'test-api-key' })

      const result = await client.put('/test')

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test', undefined)
      expect(result).toEqual(mockResponse)
    })

    it('should throw SubstackAuthError on 403 response', async () => {
      mockAxiosInstance.put.mockResolvedValue({
        status: 403,
        statusText: 'Forbidden',
        data: {}
      })

      const client = new HttpClient('https://test.substack.com', { substackSid: 'test-api-key' })

      await expect(client.put('/test', {})).rejects.toThrow('HTTP 403: Forbidden')
      await expect(client.put('/test', {})).rejects.toBeInstanceOf(SubstackAuthError)
    })
  })

  describe('delete', () => {
    it('should make successful DELETE request accepting 204 No Content', async () => {
      mockAxiosInstance.delete.mockResolvedValue({
        status: 204,
        data: undefined
      })

      const client = new HttpClient('https://test.substack.com', { substackSid: 'test-api-key' })

      await expect(client.delete('/comment/123')).resolves.toBeUndefined()
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/comment/123')
    })

    it('should throw error on non-2xx response', async () => {
      mockAxiosInstance.delete.mockResolvedValue({
        status: 404,
        statusText: 'Not Found',
        data: {}
      })

      const client = new HttpClient('https://test.substack.com', { substackSid: 'test-api-key' })

      await expect(client.delete('/comment/123')).rejects.toThrow('HTTP 404: Not Found')
    })
  })
})
