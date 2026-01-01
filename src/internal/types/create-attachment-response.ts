import * as t from 'io-ts'

/**
 * Codec for CreateAttachmentResponse - validates the response from POST /comment/attachment
 */
export const CreateAttachmentResponseCodec = t.type({
  id: t.string,
  type: t.string,
  publication: t.unknown,
  post: t.unknown
})

export type CreateAttachmentResponse = t.TypeOf<typeof CreateAttachmentResponseCodec>
