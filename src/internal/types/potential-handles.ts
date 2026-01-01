import * as t from 'io-ts'
import { PotentialHandleCodec } from '@substack-api/internal/types/potential-handle'

export const PotentialHandlesCodec = t.type({
  potentialHandles: t.array(PotentialHandleCodec)
})

export type PotentialHandles = t.TypeOf<typeof PotentialHandlesCodec>
