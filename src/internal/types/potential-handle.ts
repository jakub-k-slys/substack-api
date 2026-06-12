import * as t from 'io-ts'
import { HandleTypeCodec } from '@substackular/internal/types/handle-type'

export const PotentialHandleCodec = t.type({
  id: t.string,
  handle: t.string,
  type: HandleTypeCodec
})

export type PotentialHandle = t.TypeOf<typeof PotentialHandleCodec>
