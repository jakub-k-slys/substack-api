/**
 * Unit tests for io-ts validation codecs
 */

import {
  SubstackPostCodec,
  SubstackFullPostCodec,
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
        post_date: '2023-01-01T00:00:00Z',
        subtitle: 'A test post',
        truncated_body_text: 'This is a test...'
      }

      const result = decodeEither(SubstackPostCodec, validPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackPostCodec, validPost, 'test post')
      expect(decoded.id).toBe(123)
      expect(decoded.title).toBe('Test Post')
      expect(decoded.subtitle).toBe('A test post')
    })

    it('should reject invalid post data', () => {
      const invalidPost = {
        id: 'not-a-number', // Invalid - should be number
        title: 'Test Post',
        post_date: '2023-01-01T00:00:00Z'
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
        post_date: '2023-01-01T00:00:00Z'
      }

      const result = decodeEither(SubstackPostCodec, minimalPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackPostCodec, minimalPost, 'minimal post')
      expect(decoded.id).toBe(456)
      expect(decoded.subtitle).toBeUndefined()
      expect(decoded.truncated_body_text).toBeUndefined()
    })
  })

  describe('SubstackFullPostCodec', () => {
    it('should validate valid full post data', () => {
      const validFullPost = {
        id: 123,
        title: 'Test Full Post',
        slug: 'test-full-post',
        post_date: '2023-01-01T00:00:00Z',
        body_html: '<p>This is the full HTML body content</p>',
        subtitle: 'A test full post',
        cover_image: 'https://example.com/image.jpg',
        truncated_body_text: 'This is a test...',
        htmlBody: '<p>Legacy HTML body</p>',
        postTags: ['tech', 'newsletter'],
        reactions: { '❤️': 10, '👍': 5, '👎': 1 },
        restacks: 3
      }

      const result = decodeEither(SubstackFullPostCodec, validFullPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackFullPostCodec, validFullPost, 'test full post')
      expect(decoded.id).toBe(123)
      expect(decoded.title).toBe('Test Full Post')
      expect(decoded.slug).toBe('test-full-post')
      expect(decoded.body_html).toBe('<p>This is the full HTML body content</p>')
      expect(decoded.postTags).toEqual(['tech', 'newsletter'])
      expect(decoded.reactions).toEqual({ '❤️': 10, '👍': 5, '👎': 1 })
      expect(decoded.restacks).toBe(3)
    })

    it('should validate minimal full post data with only required fields', () => {
      const minimalFullPost = {
        id: 456,
        title: 'Minimal Full Post',
        slug: 'minimal-full-post',
        post_date: '2023-01-01T00:00:00Z'
      }

      const result = decodeEither(SubstackFullPostCodec, minimalFullPost)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackFullPostCodec, minimalFullPost, 'minimal full post')
      expect(decoded.id).toBe(456)
      expect(decoded.body_html).toBeUndefined()
      expect(decoded.subtitle).toBeUndefined()
      expect(decoded.postTags).toBeUndefined()
      expect(decoded.reactions).toBeUndefined()
    })

    it('should reject full post with invalid postTags type', () => {
      const invalidFullPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        postTags: 'invalid-tags' // Should be array of strings
      }

      const result = decodeEither(SubstackFullPostCodec, invalidFullPost)
      expect(isLeft(result)).toBe(true)
    })

    it('should reject full post with invalid reactions type', () => {
      const invalidFullPost = {
        id: 123,
        title: 'Test Post',
        slug: 'test-post',
        post_date: '2023-01-01T00:00:00Z',
        reactions: ['invalid'] // Should be record of string to number
      }

      const result = decodeEither(SubstackFullPostCodec, invalidFullPost)
      expect(isLeft(result)).toBe(true)
    })
  })

  describe('SubstackCommentCodec', () => {
    it('should validate valid comment data', () => {
      const validComment = {
        id: 789,
        body: 'This is a comment',
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
        body: 'This is a comment'
      }

      const result = decodeEither(SubstackCommentCodec, commentWithoutAdmin)
      expect(isRight(result)).toBe(true)

      const decoded = decodeOrThrow(SubstackCommentCodec, commentWithoutAdmin, 'test comment')
      expect(decoded.author_is_admin).toBeUndefined()
    })

    it('should reject invalid comment data', () => {
      const invalidComment = {
        id: 'not-a-number',
        body: 'This is a comment'
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
