/**
 * Unit tests for io-ts validation codecs
 */

import {
  RawPostCodec,
  RawCommentCodec,
  RawCommentResponseCodec,
  RawAuthorCodec,
  RawUserCodec
} from '../../src/internal/types'
import { decodeOrThrow, decodeEither } from '../../src/internal/validation'
import { isLeft, isRight } from 'fp-ts/Either'

describe('io-ts validation codecs', () => {
  describe('RawPostCodec', () => {
    it('should validate valid post data', () => {
      const validPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.substack.com/p/test-post',
        type: 'newsletter' as const,
        subtitle: 'A test post',
        description: 'Post description',
        audience: 'everyone',
        cover_image: 'https://example.com/image.jpg',
        published: true,
        paywalled: false,
        truncated_body_text: 'This is a test...',
        htmlBody: '<p>This is a test post</p>'
      }

      const result = decodeEither(RawPostCodec, validPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(RawPostCodec, validPost, 'test post')
      expect(decoded.id).toBe(123)
      expect(decoded.title).toBe('Test Post')
      expect(decoded.type).toBe('newsletter')
    })

    it('should reject invalid post data', () => {
      const invalidPost = {
        id: 'not-a-number', // Invalid - should be number
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.substack.com/p/test-post',
        type: 'newsletter'
      }

      const result = decodeEither(RawPostCodec, invalidPost)
      expect(isLeft(result)).toBe(true)

      expect(() => {
        decodeOrThrow(RawPostCodec, invalidPost, 'test post')
      }).toThrow('Invalid test post')
    })

    it('should handle minimal valid post data', () => {
      const minimalPost = {
        id: 456,
        title: 'Minimal Post',
        slug: 'minimal-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.substack.com/p/minimal-post',
        type: 'podcast' as const
      }

      const result = decodeEither(RawPostCodec, minimalPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(RawPostCodec, minimalPost, 'minimal post')
      expect(decoded.id).toBe(456)
      expect(decoded.subtitle).toBeUndefined()
      expect(decoded.published).toBeUndefined()
    })

    it('should reject invalid post type', () => {
      const invalidTypePost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        canonical_url: 'https://example.substack.com/p/test-post',
        type: 'invalid-type' // Invalid type
      }

      const result = decodeEither(RawPostCodec, invalidTypePost)
      expect(isLeft(result)).toBe(true)
    })
  })

  describe('RawCommentCodec', () => {
    it('should validate valid comment data', () => {
      const validComment = {
        id: 789,
        body: 'This is a comment',
        created_at: '2023-01-01T00:00:00Z',
        parent_post_id: 123,
        author_id: 456,
        author_name: 'John Doe',
        author_is_admin: false
      }

      const result = decodeEither(RawCommentCodec, validComment)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(RawCommentCodec, validComment, 'test comment')
      expect(decoded.id).toBe(789)
      expect(decoded.body).toBe('This is a comment')
      expect(decoded.author_is_admin).toBe(false)
    })

    it('should handle optional author_is_admin field', () => {
      const commentWithoutAdmin = {
        id: 789,
        body: 'This is a comment',
        created_at: '2023-01-01T00:00:00Z',
        parent_post_id: 123,
        author_id: 456,
        author_name: 'John Doe'
      }

      const result = decodeEither(RawCommentCodec, commentWithoutAdmin)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(RawCommentCodec, commentWithoutAdmin, 'test comment')
      expect(decoded.author_is_admin).toBeUndefined()
    })

    it('should reject invalid comment data', () => {
      const invalidComment = {
        id: 789,
        body: 'This is a comment',
        created_at: '2023-01-01T00:00:00Z',
        parent_post_id: 'not-a-number', // Invalid - should be number
        author_id: 456,
        author_name: 'John Doe'
      }

      const result = decodeEither(RawCommentCodec, invalidComment)
      expect(isLeft(result)).toBe(true)
    })
  })

  describe('RawCommentResponseCodec', () => {
    it('should validate valid comment response data', () => {
      const validResponse = {
        item: {
          comment: {
            id: 123,
            body: 'Response comment',
            user_id: 456,
            name: 'Jane Doe',
            date: '2023-01-01T00:00:00Z',
            post_id: 789
          }
        }
      }

      const result = decodeEither(RawCommentResponseCodec, validResponse)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(RawCommentResponseCodec, validResponse, 'test response')
      expect(decoded.item.comment.id).toBe(123)
      expect(decoded.item.comment.body).toBe('Response comment')
      expect(decoded.item.comment.post_id).toBe(789)
    })

    it('should handle null post_id', () => {
      const responseWithNullPostId = {
        item: {
          comment: {
            id: 123,
            body: 'Response comment',
            user_id: 456,
            name: 'Jane Doe',
            date: '2023-01-01T00:00:00Z',
            post_id: null
          }
        }
      }

      const result = decodeEither(RawCommentResponseCodec, responseWithNullPostId)
      expect(isRight(result)).toBe(true)
    })

    it('should reject invalid comment response structure', () => {
      const invalidResponse = {
        item: {
          comment: {
            id: 123,
            body: 'Response comment',
            user_id: 'not-a-number', // Invalid - should be number
            name: 'Jane Doe',
            date: '2023-01-01T00:00:00Z'
          }
        }
      }

      const result = decodeEither(RawCommentResponseCodec, invalidResponse)
      expect(isLeft(result)).toBe(true)
    })
  })

  describe('RawAuthorCodec', () => {
    it('should validate valid author data', () => {
      const validAuthor = {
        id: 123,
        name: 'Author Name',
        is_admin: true
      }

      const result = decodeEither(RawAuthorCodec, validAuthor)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(RawAuthorCodec, validAuthor, 'test author')
      expect(decoded.id).toBe(123)
      expect(decoded.name).toBe('Author Name')
      expect(decoded.is_admin).toBe(true)
    })

    it('should handle optional is_admin field', () => {
      const authorWithoutAdmin = {
        id: 123,
        name: 'Author Name'
      }

      const result = decodeEither(RawAuthorCodec, authorWithoutAdmin)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(RawAuthorCodec, authorWithoutAdmin, 'test author')
      expect(decoded.is_admin).toBeUndefined()
    })

    it('should reject invalid author data', () => {
      const invalidAuthor = {
        id: 'not-a-number', // Invalid - should be number
        name: 'Author Name'
      }

      const result = decodeEither(RawAuthorCodec, invalidAuthor)
      expect(isLeft(result)).toBe(true)
    })
  })

  describe('RawUserCodec', () => {
    it('should validate valid user data', () => {
      const validUser = {
        id: 123,
        name: 'User Name',
        handle: 'user-handle',
        photo_url: 'https://example.com/photo.jpg',
        bio: 'User bio',
        profile_set_up_at: '2023-01-01T00:00:00Z',
        reader_installed_at: '2023-01-01T00:00:00Z',
        previous_name: 'Previous Name',
        bestseller_tier: 1
      }

      const result = decodeEither(RawUserCodec, validUser)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(RawUserCodec, validUser, 'test user')
      expect(decoded.id).toBe(123)
      expect(decoded.name).toBe('User Name')
      expect(decoded.handle).toBe('user-handle')
      expect(decoded.bestseller_tier).toBe(1)
    })

    it('should handle optional fields', () => {
      const minimalUser = {
        id: 123,
        name: 'User Name',
        handle: 'user-handle',
        photo_url: 'https://example.com/photo.jpg',
        profile_set_up_at: '2023-01-01T00:00:00Z',
        reader_installed_at: '2023-01-01T00:00:00Z'
      }

      const result = decodeEither(RawUserCodec, minimalUser)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(RawUserCodec, minimalUser, 'test user')
      expect(decoded.bio).toBeUndefined()
      expect(decoded.previous_name).toBeUndefined()
      expect(decoded.bestseller_tier).toBeUndefined()
    })

    it('should handle null bestseller_tier', () => {
      const userWithNullTier = {
        id: 123,
        name: 'User Name',
        handle: 'user-handle',
        photo_url: 'https://example.com/photo.jpg',
        profile_set_up_at: '2023-01-01T00:00:00Z',
        reader_installed_at: '2023-01-01T00:00:00Z',
        bestseller_tier: null
      }

      const result = decodeEither(RawUserCodec, userWithNullTier)
      expect(isRight(result)).toBe(true)
    })

    it('should reject invalid user data', () => {
      const invalidUser = {
        id: 123,
        name: 'User Name',
        handle: 'user-handle',
        photo_url: 'https://example.com/photo.jpg',
        profile_set_up_at: '2023-01-01T00:00:00Z',
        reader_installed_at: null // Invalid - should be string
      }

      const result = decodeEither(RawUserCodec, invalidUser)
      expect(isLeft(result)).toBe(true)
    })
  })
})
