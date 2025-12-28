import * as t from 'io-ts'

const User = t.type({
  id: t.number,
  handle: t.string
})

const Group = t.type({
  users: t.array(User)
})

const SubscriberList = t.type({
  id: t.string,
  name: t.string,
  groups: t.array(Group)
})

export const SubscriberLists = t.type({
  subscriberLists: t.array(SubscriberList)
})
export type SubscriberListsT = t.TypeOf<typeof SubscriberLists>
