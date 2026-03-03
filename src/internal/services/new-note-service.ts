import { NoteBuilder, NoteWithLinkBuilder } from '@substack-api/domain/note-builder'
import type { HttpClient } from '@substack-api/internal/http-client'

export class NewNoteService {
  constructor(private readonly client: HttpClient) {}

  newNote(): NoteBuilder {
    return new NoteBuilder(this.client)
  }

  newNoteWithLink(link: string): NoteWithLinkBuilder {
    return new NoteWithLinkBuilder(this.client, link)
  }
}
