import { NoteBuilder, NoteWithLinkBuilder } from '@substack-api/domain/note-builder'
import type { HttpClient } from '@substack-api/internal/http-client'

/**
 * Service responsible for creating new notes
 * Provides methods to instantiate note builders
 */
export class NewNoteService {
  constructor(private readonly substackClient: HttpClient) {}

  /**
   * Create a new note using the builder pattern
   */
  newNote(): NoteBuilder {
    return new NoteBuilder(this.substackClient)
  }

  /**
   * Create a new note with a link attachment using the builder pattern
   */
  newNoteWithLink(link: string): NoteWithLinkBuilder {
    return new NoteWithLinkBuilder(this.substackClient, link)
  }
}
