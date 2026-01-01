import * as t from 'io-ts'

/**
 * Raw API response shape for publications - flattened
 */
export const SubstackPublicationCodec = t.intersection([
  t.type({
    name: t.string,
    hostname: t.string,
    subdomain: t.string
  }),
  t.partial({
    logo_url: t.string,
    description: t.string
  })
])

export type SubstackPublication = t.TypeOf<typeof SubstackPublicationCodec>
