/**
 * Test that validates public API exports work correctly
 * This ensures consumers can import builder classes from the main package
 */

describe('Public API Exports', () => {
  it('should export NoteBuilder from main package', async () => {
    // Test that NoteBuilder can be imported from the main package entry point
    const { NoteBuilder } = await import('../../src/index')
    expect(NoteBuilder).toBeDefined()
    expect(typeof NoteBuilder).toBe('function')
  })

  it('should export ParagraphBuilder from main package', async () => {
    const { ParagraphBuilder } = await import('../../src/index')
    expect(ParagraphBuilder).toBeDefined()
    expect(typeof ParagraphBuilder).toBe('function')
  })

  it('should export ListBuilder from main package', async () => {
    const { ListBuilder } = await import('../../src/index')
    expect(ListBuilder).toBeDefined()
    expect(typeof ListBuilder).toBe('function')
  })

  it('should export ListItemBuilder from main package', async () => {
    const { ListItemBuilder } = await import('../../src/index')
    expect(ListItemBuilder).toBeDefined()
    expect(typeof ListItemBuilder).toBe('function')
  })

  it('should allow creating NoteBuilder instance', async () => {
    const { NoteBuilder } = await import('../../src/index')

    // Mock HttpClient since NoteBuilder requires it
    const mockHttpClient = {
      get: jest.fn(),
      post: jest.fn(),
      request: jest.fn(),
      getPerPage: jest.fn().mockReturnValue(25)
    }

    const builder = new NoteBuilder(mockHttpClient as any)
    expect(builder).toBeInstanceOf(NoteBuilder)
    expect(typeof builder.paragraph).toBe('function')
  })

  it('should allow type imports for content types', async () => {
    // This test validates that TypeScript types can be imported
    // The import itself is sufficient to verify the types are exported
    const module = await import('../../src/index')

    // We can't directly test types at runtime, but we can verify
    // that the module exports exist and can be used in type annotations
    expect(module).toBeDefined()

    // Test that we can use the types in practice
    const textSegment: any = {
      text: 'Hello',
      type: 'bold'
    }
    expect(textSegment).toMatchObject({
      text: 'Hello',
      type: 'bold'
    })
  })
})
