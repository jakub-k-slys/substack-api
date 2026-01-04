import type { NoteBodyJson } from '@substack-api/internal/types/note-body-json'

export interface PublishNoteRequest {
  bodyJson: NoteBodyJson
  tabId: string
  surface: string
  replyMinimumRole: 'everyone'
  attachmentIds?: string[]
}
