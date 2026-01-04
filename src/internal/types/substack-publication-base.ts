import * as t from 'io-ts'

/**
 * Base publication information in flattened form
 */
export const SubstackPublicationBaseCodec = t.intersection([
  t.type({
    id: t.number,
    name: t.string,
    subdomain: t.string,
    custom_domain_optional: t.boolean,
    logo_url: t.string,
    author_id: t.number,
    user_id: t.number,
    handles_enabled: t.boolean,
    explicit: t.boolean,
    is_personal_mode: t.boolean,
    payments_state: t.string,
    pledges_enabled: t.boolean
  }),
  t.partial({
    custom_domain: t.string
  })
])

export type SubstackPublicationBase = t.TypeOf<typeof SubstackPublicationBaseCodec>
