import { Substack } from '../client'

describe('Substack Profiles', () => {
  let client: Substack

  beforeEach(() => {
    client = new Substack({
      apiKey: 'test-api-key'
    })
    global.fetch = jest.fn()
  })

  describe('public profiles', () => {
    it('should get a public profile by slug', async () => {
      const mockResponse = {
        id: 282291554,
        name: 'Jenny Ouyang',
        handle: 'jennyouyang',
        bio: 'Test bio',
        photo_url: 'https://example.com/photo.jpg',
        publicationUsers: [],
        userLinks: [],
        subscriptions: []
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getPublicProfile('jennyouyang')
      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://substack.com/api/v1/user/jennyouyang/public_profile',
        expect.any(Object)
      )
    })

    it('should handle API errors when getting public profile', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(client.getPublicProfile('nonexistent')).rejects.toThrow(
        'Request failed: Not Found'
      )
    })
  })

  describe('user profiles', () => {
    it('should get a user profile by ID', async () => {
      const mockResponse = {
        items: [
          {
            entity_key: 'user_282291554',
            type: 'user',
            context: {
              type: 'user',
              timestamp: '2025-06-18T09:25:18.957Z',
              users: [
                {
                  id: 282291554,
                  name: 'Jenny Ouyang',
                  handle: 'jennyouyang',
                  photo_url: 'https://example.com/photo.jpg',
                  bio: 'Test bio',
                  profile_set_up_at: '2025-06-18T09:25:18.957Z',
                  reader_installed_at: '2025-06-18T09:25:18.957Z'
                }
              ],
              isFresh: true,
              source: 'profile',
              page_rank: 0
            }
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getUserProfile(282291554)
      expect(result).toEqual(mockResponse)
    })

    it('should handle API errors when getting user profile', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(client.getUserProfile(999999)).rejects.toThrow('Request failed: Not Found')
    })
  })

  describe('full profiles', () => {
    it('should get a full profile by slug', async () => {
      const mockPublicProfile = {
        id: 282291554,
        name: 'Jenny Ouyang',
        handle: 'jennyouyang',
        bio: 'Test bio',
        photo_url: 'https://example.com/photo.jpg',
        publicationUsers: [],
        userLinks: [],
        subscriptions: []
      }

      const mockUserProfile = {
        items: [
          {
            entity_key: 'user_282291554',
            type: 'user',
            context: {
              type: 'user',
              timestamp: '2025-06-18T09:25:18.957Z',
              users: [
                {
                  id: 282291554,
                  name: 'Jenny Ouyang',
                  handle: 'jennyouyang',
                  photo_url: 'https://example.com/photo.jpg',
                  bio: 'Test bio',
                  profile_set_up_at: '2025-06-18T09:25:18.957Z',
                  reader_installed_at: '2025-06-18T09:25:18.957Z'
                }
              ],
              isFresh: true,
              source: 'profile',
              page_rank: 0
            }
          }
        ]
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPublicProfile)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserProfile)
        })

      const result = await client.getFullProfileBySlug('jennyouyang')
      expect(result).toEqual({
        ...mockPublicProfile,
        userProfile: mockUserProfile
      })
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should get a full profile by ID', async () => {
      const mockUserProfile = {
        items: [
          {
            entity_key: 'user_282291554',
            type: 'user',
            context: {
              type: 'user',
              timestamp: '2025-06-18T09:25:18.957Z',
              users: [
                {
                  id: 282291554,
                  name: 'Jenny Ouyang',
                  handle: 'jennyouyang',
                  photo_url: 'https://example.com/photo.jpg',
                  bio: 'Test bio',
                  profile_set_up_at: '2025-06-18T09:25:18.957Z',
                  reader_installed_at: '2025-06-18T09:25:18.957Z'
                }
              ],
              isFresh: true,
              source: 'profile',
              page_rank: 0
            }
          }
        ]
      }

      const mockPublicProfile = {
        id: 282291554,
        name: 'Jenny Ouyang',
        handle: 'jennyouyang',
        bio: 'Test bio',
        photo_url: 'https://example.com/photo.jpg',
        publicationUsers: [],
        userLinks: [],
        subscriptions: []
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockUserProfile)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockPublicProfile)
        })

      const result = await client.getFullProfileById(282291554)
      expect(result).toEqual({
        ...mockPublicProfile,
        userProfile: mockUserProfile
      })
      expect(global.fetch).toHaveBeenCalledTimes(2)
    })

    it('should handle missing handle in user profile when getting full profile by ID', async () => {
      const mockUserProfile = {
        items: [
          {
            entity_key: 'user_282291554',
            type: 'user',
            context: {
              type: 'user',
              timestamp: '2025-06-18T09:25:18.957Z',
              users: [],
              isFresh: true,
              source: 'profile',
              page_rank: 0
            }
          }
        ]
      }

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockUserProfile)
      })

      await expect(client.getFullProfileById(282291554)).rejects.toThrow(
        'Could not find user handle in profile'
      )
    })
  })

  describe('following', () => {
    it('should get following IDs', async () => {
      const mockResponse = [254824415, 108855261, 34637]

      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      })

      const result = await client.getFollowingIds()
      expect(result).toEqual(mockResponse)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://substack.com/api/v1/feed/following',
        expect.any(Object)
      )
    })

    it('should handle failed user profile fetches in getFollowingProfiles', async () => {
      const mockFollowingIds = [254824415, 108855261]

      // Mock getFollowingIds call
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockFollowingIds)
        })

        // Mock first user's profile calls - successful
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [
                {
                  entity_key: 'user_254824415',
                  type: 'user',
                  context: {
                    type: 'user',
                    timestamp: '2025-06-18T09:25:18.957Z',
                    users: [
                      {
                        id: 254824415,
                        name: 'User 1',
                        handle: 'user1',
                        photo_url: 'https://example.com/photo1.jpg',
                        bio: 'Bio 1',
                        profile_set_up_at: '2025-06-18T09:25:18.957Z',
                        reader_installed_at: '2025-06-18T09:25:18.957Z'
                      }
                    ],
                    isFresh: true,
                    source: 'profile',
                    page_rank: 0
                  }
                }
              ]
            })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              id: 254824415,
              name: 'User 1',
              handle: 'user1',
              bio: 'Bio 1',
              photo_url: 'https://example.com/photo1.jpg',
              publicationUsers: [],
              userLinks: [],
              subscriptions: []
            })
        })

        // Mock second user's profile calls - failed
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        })

      const result = await client.getFollowingProfiles()

      // Should only include the successful profile
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe(254824415)
    })

    it('should handle failed public profile fetches in getFollowingProfiles', async () => {
      const mockFollowingIds = [254824415]

      // Mock getFollowingIds call
      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve(mockFollowingIds)
        })

        // Mock user profile call - successful
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              items: [
                {
                  entity_key: 'user_254824415',
                  type: 'user',
                  context: {
                    type: 'user',
                    timestamp: '2025-06-18T09:25:18.957Z',
                    users: [
                      {
                        id: 254824415,
                        name: 'User 1',
                        handle: 'user1',
                        photo_url: 'https://example.com/photo1.jpg',
                        bio: 'Bio 1',
                        profile_set_up_at: '2025-06-18T09:25:18.957Z',
                        reader_installed_at: '2025-06-18T09:25:18.957Z'
                      }
                    ],
                    isFresh: true,
                    source: 'profile',
                    page_rank: 0
                  }
                }
              ]
            })
        })

        // Mock public profile call - failed
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          statusText: 'Not Found'
        })

      const result = await client.getFollowingProfiles()

      // Should be empty since the public profile fetch failed
      expect(result).toHaveLength(0)
    })

    it('should handle API errors when getting following IDs', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      await expect(client.getFollowingIds()).rejects.toThrow('Request failed: Unauthorized')
    })
  })
})
