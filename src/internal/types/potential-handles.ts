type HandleType = 'existing' | 'subdomain' | 'suggestion'

export interface PotentialHandle {
  id: string
  handle: string
  type: HandleType
}

export interface PotentialHandles {
  potentialHandles: PotentialHandle[]
}