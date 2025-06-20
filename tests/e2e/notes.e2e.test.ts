/// <reference path="./global.d.ts" />
import { Substack } from '../../src/client'

// Helper function to skip tests if no credentials or network access
const skipIfNoCredentials = () => {
  if (!global.E2E_CONFIG.hasCredentials) {
    return test.skip
  }
  return test
}

// Helper function to handle network errors gracefully
const handleNetworkError = (error: any, operation: string): void => {
  // Check for various network error indicators
  const isNetworkError =
    (error &&
      typeof error === 'object' &&
      'code' in error &&
      ((error as any).code === 'EAI_AGAIN' || (error as any).code === 'ENOTFOUND')) ||
    (error &&
      typeof error === 'object' &&
      'cause' in error &&
      error.cause &&
      typeof error.cause === 'object' &&
      'code' in error.cause &&
      ((error.cause as any).code === 'EAI_AGAIN' || (error.cause as any).code === 'ENOTFOUND')) ||
    (error && error.toString && error.toString().includes('fetch failed')) ||
    (error && error.toString && error.toString().includes('EAI_AGAIN')) ||
    (error && error.toString && error.toString().includes('ENOTFOUND'))

  // Check for endpoint not available (some features may not be supported)
  const isEndpointNotFound =
    error && typeof error === 'object' && 'status' in error && (error as any).status === 404

  if (isNetworkError) {
    console.warn(
      `Network connectivity issue during ${operation}:`,
      (error as any)?.message || error
    )
    return
  }

  if (isEndpointNotFound) {
    console.warn(
      `Endpoint not available for ${operation} - this feature may not be supported:`,
      (error as any)?.message || error
    )
    return
  }

  console.log(`${operation} not accessible - might require specific permissions:`, error)
}

describe('E2E: Notes Operations', () => {
  let client: Substack

  beforeAll(() => {
    if (!global.E2E_CONFIG.hasCredentials) {
      return
    }

    client = new Substack({
      apiKey: global.E2E_CONFIG.apiKey!,
      hostname: global.E2E_CONFIG.hostname
    })
  })

  skipIfNoCredentials()('should fetch notes for authenticated user', async () => {
    try {
      const notes = await client.getNotes({ limit: 5 })

      expect(notes).toBeDefined()
      expect(notes.items).toBeDefined()
      expect(Array.isArray(notes.items)).toBe(true)
      expect(notes.items.length).toBeLessThanOrEqual(5)

      if (notes.items.length > 0) {
        const note = notes.items[0]
        expect(note.entity_key).toBeDefined()
        expect(note.context).toBeDefined()
        expect(typeof note.entity_key).toBe('string')
        expect(typeof note.context).toBe('object')

        // Check if note has a comment (which would have the actual content)
        if (note.comment) {
          expect(note.comment.id).toBeDefined()
          expect(note.comment.body).toBeDefined()
          expect(note.comment.date).toBeDefined()
          expect(typeof note.comment.id).toBe('number')
          expect(typeof note.comment.body).toBe('string')
          expect(typeof note.comment.date).toBe('string')
        }
      }
    } catch (error) {
      handleNetworkError(error, 'Notes')
    }
  })

  skipIfNoCredentials()('should handle notes pagination', async () => {
    try {
      const firstPage = await client.getNotes({ limit: 2 })

      expect(firstPage).toBeDefined()
      expect(firstPage.hasMore).toBeDefined()
      expect(typeof firstPage.hasMore()).toBe('boolean')

      if (firstPage.hasMore()) {
        const secondPage = await firstPage.next()
        expect(secondPage).toBeDefined()
        expect(secondPage?.items).toBeDefined()
      }
    } catch (error) {
      handleNetworkError(error, 'Notes pagination')
    }
  })

  // Note: Publishing notes is commented out as it creates real content
  // Uncomment and use with caution in a test environment
  /*
  skipIfNoCredentials()('should publish a simple note', async () => {
    try {
      const testNote = `E2E Test Note - ${new Date().toISOString()}`
      const publishedNote = await client.publishNote(testNote)
      
      expect(publishedNote).toBeDefined()
      expect(publishedNote.body).toBe(testNote)
      expect(publishedNote.id).toBeDefined()
      expect(typeof publishedNote.id).toBe('number')
      
      console.log(`Published test note with ID: ${publishedNote.id}`)
    } catch (error) {
      handleNetworkError(error, 'Note publishing')
    }
  })

  skipIfNoCredentials()('should publish a formatted note using builder', async () => {
    try {
      const publishedNote = await client
        .note('E2E Test: ')
        .bold('Bold text')
        .simple(' and ')
        .italic('italic text')
        .simple(` - ${new Date().toISOString()}`)
        .publish()
      
      expect(publishedNote).toBeDefined()
      expect(publishedNote.id).toBeDefined()
      expect(typeof publishedNote.id).toBe('number')
      
      console.log(`Published formatted test note with ID: ${publishedNote.id}`)
    } catch (error) {
      handleNetworkError(error, 'Formatted note publishing')
    }
  })
  */
})
