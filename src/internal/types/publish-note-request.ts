import type { NoteBodyJson } from '@substackular/internal/types/note-body-json'

export interface PublishNoteRequest {
  bodyJson: NoteBodyJson
  tabId: string
  surface: string
  replyMinimumRole: 'everyone'
  attachmentIds?: string[]
}
