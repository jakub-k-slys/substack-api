import * as t from 'io-ts'

/**
 * Raw API response shape for full posts from /posts/by-id/:id endpoint
 * Only validates fields actually used by FullPost domain class
 */
export const SubstackFullPostCodec = t.intersection([
  t.type({
    id: t.number,
    title: t.string,
    slug: t.string,
    post_date: t.string,
    canonical_url: t.string
  }),
  t.partial({
    subtitle: t.string,
    truncated_body_text: t.string,
    body_html: t.string,
    htmlBody: t.string,
    reactions: t.record(t.string, t.number),
    restacks: t.number,
    postTags: t.array(t.string),
    cover_image: t.string
  })
])

export type SubstackFullPost = t.TypeOf<typeof SubstackFullPostCodec>
