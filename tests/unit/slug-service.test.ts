import { SlugService } from '../../src/internal/services/slug-service'
import { HttpClient } from '../../src/internal/http-client'
import type { SubstackSubscriptionsResponse } from '../../src/internal'

// Mock the http client
jest.mock('../../src/internal/http-client')

describe('SlugService', () => {
  let slugService: SlugService
  let mockHttpClient: jest.Mocked<HttpClient>

  const mockSubscriptionsResponse: SubstackSubscriptionsResponse = {
    subscriptions: [],
    publicationUsers: [],
    publications: [
      {
        id: 1,
        name: 'Test Publication',
        subdomain: 'test',
        custom_domain: null,
        is_on_substack: true,
        author_id: 123,
        author_handle: 'test-author',
        created_at: '2023-01-01T00:00:00Z',
        logo_url: 'https://example.com/logo.png',
        cover_photo_url: 'https://example.com/cover.jpg',
        twitter_screen_name: 'test_publication',
        community_enabled: false,
        copyright: '© 2023 Test Publication',
        founding_subscription_benefits: [],
        paid_subscription_benefits: [],
        free_subscription_benefits: [],
        stripe_user_id: 'stripe_123',
        stripe_country: 'US',
        payments_state: 'enabled',
        language: 'en',
        email_from_name: 'Test Publication',
        homepage_type: 'newsletter',
        theme_background_pop_color: '#ffffff',
        theme_web_bg_color: '#f8f9fa',
        theme_cover_bg_color: null
      },
      {
        id: 2,
        name: 'Another Publication',
        subdomain: 'another',
        custom_domain: null,
        is_on_substack: true,
        author_id: 456,
        author_handle: 'another-author',
        created_at: '2023-01-01T00:00:00Z',
        logo_url: 'https://example.com/logo2.png',
        cover_photo_url: 'https://example.com/cover2.jpg',
        twitter_screen_name: 'another_publication',
        community_enabled: false,
        copyright: '© 2023 Another Publication',
        founding_subscription_benefits: [],
        paid_subscription_benefits: [],
        free_subscription_benefits: [],
        stripe_user_id: 'stripe_456',
        stripe_country: 'US',
        payments_state: 'enabled',
        language: 'en',
        email_from_name: 'Another Publication',
        homepage_type: 'newsletter',
        theme_background_pop_color: '#ffffff',
        theme_web_bg_color: '#f8f9fa',
        theme_cover_bg_color: null
      },
      {
        id: 3,
        name: 'Publication Without Author Handle',
        subdomain: 'no-handle',
        custom_domain: null,
        is_on_substack: true,
        author_id: 789,
        author_handle: '', // Empty handle instead of null
        created_at: '2023-01-01T00:00:00Z',
        logo_url: 'https://example.com/logo3.png',
        cover_photo_url: 'https://example.com/cover3.jpg',
        twitter_screen_name: 'no_handle_publication',
        community_enabled: false,
        copyright: '© 2023 No Handle Publication',
        founding_subscription_benefits: [],
        paid_subscription_benefits: [],
        free_subscription_benefits: [],
        stripe_user_id: 'stripe_789',
        stripe_country: 'US',
        payments_state: 'enabled',
        language: 'en',
        email_from_name: 'No Handle Publication',
        homepage_type: 'newsletter',
        theme_background_pop_color: '#ffffff',
        theme_web_bg_color: '#f8f9fa',
        theme_cover_bg_color: null
      }
    ]
  }

  beforeEach(() => {
    jest.clearAllMocks()

    mockHttpClient = new HttpClient('https://test.com', {
      apiKey: 'test',
      hostname: 'test.com'
    }) as jest.Mocked<HttpClient>
    mockHttpClient.get = jest.fn()

    slugService = new SlugService(mockHttpClient)
  })

  describe('getSlugMapping', () => {
    it('should fetch subscriptions and build slug mapping', async () => {
      mockHttpClient.get.mockResolvedValueOnce(mockSubscriptionsResponse)

      const result = await slugService.getSlugMapping()

      expect(result).toBeInstanceOf(Map)
      expect(result.size).toBe(2) // Only publications with author_handle
      expect(result.get(123)).toBe('test-author')
      expect(result.get(456)).toBe('another-author')
      expect(result.get(789)).toBeUndefined() // Empty author_handle
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/subscriptions')
    })

    it('should fetch fresh mapping on each call (no caching)', async () => {
      mockHttpClient.get.mockResolvedValueOnce(mockSubscriptionsResponse)
      mockHttpClient.get.mockResolvedValueOnce(mockSubscriptionsResponse)

      const result1 = await slugService.getSlugMapping()
      const result2 = await slugService.getSlugMapping()

      expect(result1).not.toBe(result2) // Different objects (not cached)
      expect(mockHttpClient.get).toHaveBeenCalledTimes(2) // Called twice (no caching)
    })

    it('should handle empty publications array', async () => {
      const emptyResponse: SubstackSubscriptionsResponse = {
        subscriptions: [],
        publicationUsers: [],
        publications: []
      }
      mockHttpClient.get.mockResolvedValueOnce(emptyResponse)

      const result = await slugService.getSlugMapping()

      expect(result).toBeInstanceOf(Map)
      expect(result.size).toBe(0)
    })

    it('should handle subscriptions API failure gracefully', async () => {
      mockHttpClient.get.mockRejectedValueOnce(new Error('API Error'))

      const result = await slugService.getSlugMapping()

      expect(result).toBeInstanceOf(Map)
      expect(result.size).toBe(0) // Empty mapping as fallback
      expect(mockHttpClient.get).toHaveBeenCalledWith('/api/v1/subscriptions')
    })

    it('should handle publications with empty author_handle', async () => {
      const responseWithEmptyAuthorHandle: SubstackSubscriptionsResponse = {
        subscriptions: [],
        publicationUsers: [],
        publications: [
          {
            id: 1,
            name: 'Publication With Empty Author Handle',
            subdomain: 'empty-handle',
            custom_domain: null,
            is_on_substack: true,
            author_id: 999,
            author_handle: '', // Empty string
            created_at: '2023-01-01T00:00:00Z',
            logo_url: 'https://example.com/logo.png',
            cover_photo_url: 'https://example.com/cover.jpg',
            twitter_screen_name: 'empty_handle',
            community_enabled: false,
            copyright: '© 2023 Empty Handle',
            founding_subscription_benefits: [],
            paid_subscription_benefits: [],
            free_subscription_benefits: [],
            stripe_user_id: 'stripe_999',
            stripe_country: 'US',
            payments_state: 'enabled',
            language: 'en',
            email_from_name: 'Empty Handle',
            homepage_type: 'newsletter',
            theme_background_pop_color: '#ffffff',
            theme_web_bg_color: '#f8f9fa',
            theme_cover_bg_color: null
          }
        ]
      }
      mockHttpClient.get.mockResolvedValueOnce(responseWithEmptyAuthorHandle)

      const result = await slugService.getSlugMapping()

      expect(result.size).toBe(0) // Should skip publication with empty author_handle
    })
  })

  describe('getSlugForUserId', () => {
    it('should return mapped slug for existing user ID', async () => {
      mockHttpClient.get.mockResolvedValueOnce(mockSubscriptionsResponse)

      const result = await slugService.getSlugForUserId(123)

      expect(result).toBe('test-author')
    })

    it('should return fallback handle when user ID not found', async () => {
      mockHttpClient.get.mockResolvedValueOnce(mockSubscriptionsResponse)

      const result = await slugService.getSlugForUserId(999, 'fallback-handle')

      expect(result).toBe('fallback-handle')
    })

    it('should return undefined when user ID not found and no fallback', async () => {
      mockHttpClient.get.mockResolvedValueOnce(mockSubscriptionsResponse)

      const result = await slugService.getSlugForUserId(999)

      expect(result).toBeUndefined()
    })

    it('should fetch mapping for each call (no caching)', async () => {
      mockHttpClient.get.mockResolvedValueOnce(mockSubscriptionsResponse)
      mockHttpClient.get.mockResolvedValueOnce(mockSubscriptionsResponse)

      // First call should fetch subscriptions
      const result1 = await slugService.getSlugForUserId(123)
      // Second call should fetch again (no caching)
      const result2 = await slugService.getSlugForUserId(456)

      expect(result1).toBe('test-author')
      expect(result2).toBe('another-author')
      expect(mockHttpClient.get).toHaveBeenCalledTimes(2) // Called twice (no caching)
    })

    it('should handle API failure and return fallback', async () => {
      mockHttpClient.get.mockRejectedValueOnce(new Error('API Error'))

      const result = await slugService.getSlugForUserId(123, 'fallback-handle')

      expect(result).toBe('fallback-handle') // Should fallback when API fails
    })
  })
})
