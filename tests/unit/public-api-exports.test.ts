import {
  SubstackClient,
  Profile,
  OwnProfile,
  Note,
  PreviewPost,
  FullPost,
  Comment
} from '@substack-api/index'

describe('Public API Exports', () => {
  it('should export all domain classes', () => {
    expect(typeof SubstackClient).toBe('function')
    expect(typeof Profile).toBe('function')
    expect(typeof OwnProfile).toBe('function')
    expect(typeof Note).toBe('function')
    expect(typeof PreviewPost).toBe('function')
    expect(typeof FullPost).toBe('function')
    expect(typeof Comment).toBe('function')
  })
})
