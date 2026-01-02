import { NoteBuilder, NoteWithLinkBuilder } from '@substack-api/domain/note-builder'
import type { HttpClient } from '@substack-api/internal/http-client'

/**
 * Service responsible for creating new notes
 * Provides methods to instantiate note builders
 */
export class NewNoteService {
  constructor(private readonly publicationClient: HttpClient) {}

  /**
   * Create a new note using the builder pattern
   */
  newNote(): NoteBuilder {
    return new NoteBuilder(this.publicationClient)
  }

  /**
   * Create a new note with a link attachment using the builder pattern
   */
  newNoteWithLink(link: string): NoteWithLinkBuilder {
    return new NoteWithLinkBuilder(this.publicationClient, link)
  }
}
