import type { HttpClient } from '@substack-api/internal/http-client'
import { GatewayCreateNoteResponseC } from '@substack-api/internal/types'
import type { GatewayCreateNoteResponse } from '@substack-api/internal/types'
import { decodeOrThrow } from '@substack-api/internal/validation'

export class NewNoteService {
  constructor(private readonly client: HttpClient) {}

  async publishNote(content: string, attachment?: string): Promise<GatewayCreateNoteResponse> {
    const body: Record<string, string> = { content }
    if (attachment) body.attachment = attachment
    const raw = await this.client.post<unknown>('/notes', body)
    return decodeOrThrow(GatewayCreateNoteResponseC, raw, 'GatewayCreateNoteResponse')
  }
}
