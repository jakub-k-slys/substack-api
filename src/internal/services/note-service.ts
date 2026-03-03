import type { HttpClient } from '@substack-api/internal/http-client'
import { GatewayNoteC, GatewayNotesPageC } from '@substack-api/internal/types'
import type { GatewayNote } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

export interface PaginatedNotes {
  notes: GatewayNote[]
  nextCursor?: string | null
}

export class NoteService {
  constructor(private readonly client: HttpClient) {}

  async getNoteById(id: number): Promise<GatewayNote> {
    const raw = await this.client.get<unknown>(`/notes/${id}`)
    return decodeOrThrow(GatewayNoteC, raw, 'GatewayNote')
  }

  async getNotesForLoggedUser(options?: { cursor?: string }): Promise<PaginatedNotes> {
    const params: Record<string, string | undefined> = {}
    if (options?.cursor) params.cursor = options.cursor
    const raw = await this.client.get<unknown>('/me/notes', params)
    const page = decodeOrThrow(GatewayNotesPageC, raw, 'GatewayNotesPage')
    return { notes: page.items, nextCursor: page.next_cursor }
  }

  async getNotesForProfile(slug: string, options?: { cursor?: string }): Promise<PaginatedNotes> {
    const params: Record<string, string | undefined> = {}
    if (options?.cursor) params.cursor = options.cursor
    const raw = await this.client.get<unknown>(
      `/profiles/${encodeURIComponent(slug)}/notes`,
      params
    )
    const page = decodeOrThrow(GatewayNotesPageC, raw, 'GatewayNotesPage')
    return { notes: page.items, nextCursor: page.next_cursor }
  }
}
