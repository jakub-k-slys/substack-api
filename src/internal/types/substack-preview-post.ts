import * as t from 'io-ts'

/**
 * Raw API response shape for posts - minimal validation
 * Only validates fields actually used by PreviewPost domain class
 */
export const SubstackPreviewPostCodec = t.intersection([
  t.type({
    id: t.number,
    title: t.string,
    post_date: t.string
  }),
  t.partial({
    subtitle: t.string,
    truncated_body_text: t.string
  })
])

export type SubstackPreviewPost = t.TypeOf<typeof SubstackPreviewPostCodec>
