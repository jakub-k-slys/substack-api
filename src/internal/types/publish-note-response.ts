import * as t from 'io-ts'

/**
 * Minimal codec for PublishNoteResponse - only validates fields actually used
 * Used fields: id, date, body, attachments
 */
export const PublishNoteResponseCodec = t.intersection([
  t.type({
    id: t.number,
    date: t.string
  }),
  t.partial({
    body: t.string,
    attachments: t.array(t.unknown)
  })
])

export type PublishNoteResponse = t.TypeOf<typeof PublishNoteResponseCodec>
