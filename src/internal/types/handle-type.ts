import * as t from 'io-ts'

export const HandleTypeCodec = t.union([
  t.literal('existing'),
  t.literal('subdomain'),
  t.literal('suggestion')
])

export type HandleType = t.TypeOf<typeof HandleTypeCodec>
