/**
 * Test that validates public API exports work correctly
 */

describe('Public API Exports', () => {
  it('should export SubstackClient from main package', async () => {
    const { SubstackClient } = await import('@substack-api/index')
    expect(SubstackClient).toBeDefined()
    expect(typeof SubstackClient).toBe('function')
  })

  it('should export Profile from main package', async () => {
    const { Profile } = await import('@substack-api/index')
    expect(Profile).toBeDefined()
    expect(typeof Profile).toBe('function')
  })

  it('should export OwnProfile from main package', async () => {
    const { OwnProfile } = await import('@substack-api/index')
    expect(OwnProfile).toBeDefined()
    expect(typeof OwnProfile).toBe('function')
  })

  it('should export Note from main package', async () => {
    const { Note } = await import('@substack-api/index')
    expect(Note).toBeDefined()
    expect(typeof Note).toBe('function')
  })

  it('should export module with correct shape', async () => {
    const module = await import('@substack-api/index')
    expect(module).toBeDefined()
  })
})
