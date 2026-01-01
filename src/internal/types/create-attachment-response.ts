import * as t from 'io-ts'

/**
 * Minimal codec for CreateAttachmentResponse - only validates the id field which is actually used
 * Used field: id (to add to attachmentIds array)
 */
export const CreateAttachmentResponseCodec = t.type({
  id: t.string
})

export type CreateAttachmentResponse = t.TypeOf<typeof CreateAttachmentResponseCodec>
