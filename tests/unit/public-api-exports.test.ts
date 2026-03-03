/**
 * Test that validates public API exports work correctly
 */

describe('Public API Exports', () => {
  it('should export NoteBuilder from main package', async () => {
    const { NoteBuilder } = await import('@substack-api/index')
    expect(NoteBuilder).toBeDefined()
    expect(typeof NoteBuilder).toBe('function')
  })

  it('should export ParagraphBuilder from main package', async () => {
    const { ParagraphBuilder } = await import('@substack-api/index')
    expect(ParagraphBuilder).toBeDefined()
    expect(typeof ParagraphBuilder).toBe('function')
  })

  it('should export ListBuilder from main package', async () => {
    const { ListBuilder } = await import('@substack-api/index')
    expect(ListBuilder).toBeDefined()
    expect(typeof ListBuilder).toBe('function')
  })

  it('should export ListItemBuilder from main package', async () => {
    const { ListItemBuilder } = await import('@substack-api/index')
    expect(ListItemBuilder).toBeDefined()
    expect(typeof ListItemBuilder).toBe('function')
  })

  it('should allow creating NoteBuilder instance with a mock client', async () => {
    const { NoteBuilder } = await import('@substack-api/index')

    const mockClient = {
      get: jest.fn(),
      post: jest.fn()
    }

    const builder = new NoteBuilder(mockClient as any)
    expect(builder).toBeInstanceOf(NoteBuilder)
    expect(typeof builder.paragraph).toBe('function')
  })

  it('should allow calling build() on NoteBuilder to get Markdown string', async () => {
    const { NoteBuilder } = await import('@substack-api/index')

    const mockClient = {
      get: jest.fn(),
      post: jest.fn()
    }

    const builder = new NoteBuilder(mockClient as any)
    const result = builder.paragraph().text('Hello').build()
    expect(typeof result).toBe('string')
    expect(result).toBe('Hello')
  })

  it('should export module with correct shape', async () => {
    const module = await import('@substack-api/index')
    expect(module).toBeDefined()
  })
})
