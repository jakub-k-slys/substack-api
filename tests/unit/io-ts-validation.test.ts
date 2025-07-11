/**
 * Unit tests for io-ts validation codecs
 */

import {
  SubstackPostCodec,
  SubstackCommentCodec,
  SubstackCommentResponseCodec
} from '../../src/internal/types'
import { decodeOrThrow, decodeEither } from '../../src/internal/validation'
import { isLeft, isRight } from 'fp-ts/Either'

describe('io-ts validation codecs', () => {
  describe('SubstackPostCodec', () => {
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

      const result = decodeEither(SubstackPostCodec, validPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackPostCodec, validPost, 'test post')
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

      const result = decodeEither(SubstackPostCodec, invalidPost)
      expect(isLeft(result)).toBe(true)

      expect(() => {
        decodeOrThrow(SubstackPostCodec, invalidPost, 'test post')
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

      const result = decodeEither(SubstackPostCodec, minimalPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackPostCodec, minimalPost, 'minimal post')
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

      const result = decodeEither(SubstackPostCodec, invalidTypePost)
      expect(isLeft(result)).toBe(true)
    })
  })

  describe('SubstackCommentCodec', () => {
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

      const result = decodeEither(SubstackCommentCodec, validComment)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackCommentCodec, validComment, 'test comment')
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

      const result = decodeEither(SubstackCommentCodec, commentWithoutAdmin)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackCommentCodec, commentWithoutAdmin, 'test comment')
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

      const result = decodeEither(SubstackCommentCodec, invalidComment)
      expect(isLeft(result)).toBe(true)
    })
  })

  describe('SubstackCommentResponseCodec', () => {
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

      const result = decodeEither(SubstackCommentResponseCodec, validResponse)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackCommentResponseCodec, validResponse, 'test response')
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

      const result = decodeEither(SubstackCommentResponseCodec, responseWithNullPostId)
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

      const result = decodeEither(SubstackCommentResponseCodec, invalidResponse)
      expect(isLeft(result)).toBe(true)
    })
  })
})
