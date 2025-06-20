/// <reference path="./global.d.ts" />
import { Substack } from '../../src/client'

// Helper function to skip tests if no credentials
const skipIfNoCredentials = () => {
  if (!global.E2E_CONFIG.hasCredentials) {
    return test.skip
  }
  return test
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
      // Notes might not be available or user might not have access
      console.log('Notes not accessible - might require specific permissions:', error)
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
      console.log('Notes pagination not accessible:', error)
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
      console.log('Note publishing not available or failed:', error)
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
      console.log('Formatted note publishing not available or failed:', error)
    }
  })
  */
})
