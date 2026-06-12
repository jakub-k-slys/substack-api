# substackular

TypeScript client for the (unofficial) Substack API, with **flexible cookie
authentication** — some Substack accounts only carry a `substack.sid` session
cookie, others only `connect.sid`; substackular accepts either or both and
sends every cookie you provide.

Derived from the MIT-licensed [substack-api](https://github.com/jakub-k-slys/substack-api)
(now deprecated), with the feature set of its Python successor
[substack-gateway-oss](https://github.com/jakub-k-slys/substack-gateway-oss)
ported back to TypeScript:

- `substack.sid` **and/or** `connect.sid` cookie auth (substack-api supported exactly one hardcoded cookie)
- Publish notes from **Markdown strings** in addition to the fluent builder
- Delete notes
- Automatic retry with exponential backoff on transient failures (network errors, 408/425/429/5xx)
- Typed errors (`SubstackApiError`, `SubstackAuthError`)
- Dual ESM + CJS packaging with bundled type declarations

> **Note:** Substack has no official public API. Everything here is
> reverse-engineered from the web client and may break without notice.

## Install

```bash
pnpm add substackular   # or npm i / yarn add
```

## Authentication

Grab your session cookie(s) from a logged-in browser session: DevTools →
Application → Cookies → `https://substack.com`, then copy the value of
`substack.sid` and/or `connect.sid` (whichever your account has).

```ts
import { SubstackClient } from 'substackular'

const client = new SubstackClient({
  publicationUrl: 'https://yourpub.substack.com',
  substackSid: process.env.SUBSTACK_SID, // value of the "substack.sid" cookie
  connectSid: process.env.CONNECT_SID //   value of the "connect.sid" cookie
})
// Provide one or both — at least one is required.
```

Migrating from `substack-api`? Its `token` config key still works and is
treated as `substackSid`.

## Usage

```ts
// Connectivity / auth check
await client.testConnectivity() // true when the session cookies are valid

// Read public content (profiles, posts, notes, comments)
const profile = await client.profileForSlug('platformer')
for await (const post of profile.posts({ limit: 10 })) {
  console.log(post.title)
}

const post = await client.postForId(167180194)
for await (const comment of post.comments({ limit: 25 })) {
  console.log(comment.body)
}

// Your own profile (requires auth)
const me = await client.ownProfile()
for await (const note of me.notes({ limit: 20 })) {
  console.log(note.body)
}
for await (const followed of me.following({ limit: 50 })) {
  console.log(followed.handle)
}
```

### Publishing notes

From Markdown (supports `**bold**`, `*italic*`, `` `code` ``, `[links](url)`,
`#` headings rendered bold, `-` bullet and `1.` numbered lists; blank lines
separate blocks):

```ts
const me = await client.ownProfile()

await me.publishNote('# Big news\n\nWe shipped **substackular** — [repo](https://example.com)')

// With a link preview card attached:
await me.publishNote('Worth a read', { attachmentUrl: 'https://example.com/post' })
```

Or with the fluent builder for full control:

```ts
await me
  .newNote()
  .paragraph()
  .text('Hello ')
  .bold('world')
  .publish()
```

### Deleting notes

```ts
await me.deleteNote(123456789) // by id
// or, given a Note entity:
const note = await client.noteForId(123456789)
await note.delete()
```

### Error handling

```ts
import { SubstackApiError, SubstackAuthError } from 'substackular'

try {
  await client.ownProfile()
} catch (error) {
  if (error instanceof SubstackAuthError) {
    // 401/403 — cookies expired or insufficient permissions
  } else if (error instanceof SubstackApiError) {
    // other API/network failure; error.status holds the HTTP status if any
  }
}
```

### Configuration

| Option                 | Default                 | Description                                          |
| ---------------------- | ----------------------- | ---------------------------------------------------- |
| `publicationUrl`       | — (required)            | Your publication base URL                            |
| `substackSid`          | —                       | `substack.sid` cookie value (this and/or connectSid) |
| `connectSid`           | —                       | `connect.sid` cookie value (this and/or substackSid) |
| `token`                | —                       | Deprecated alias for `substackSid`                   |
| `substackUrl`          | `https://substack.com`  | Base URL for global endpoints                        |
| `urlPrefix`            | `api/v1`                | API path prefix                                      |
| `perPage`              | `25`                    | Default page size for iterators                      |
| `maxRequestsPerSecond` | `25`                    | Client-side rate limit                               |
| `retryAttempts`        | `3`                     | Retries for transient failures                       |

## Development

```bash
pnpm install
pnpm build              # tsup -> dist (ESM + CJS + .d.ts)
pnpm test               # unit + integration (offline, fixture-backed)
pnpm test:e2e           # live API tests; needs .env (see .env.example)
pnpm lint && pnpm format:check
```

E2E tests are read-only and require `SUBSTACK_SID` and/or `CONNECT_SID` plus
`SUBSTACK_HOSTNAME` in the environment or a `.env` file.

## License

MIT — see [LICENSE](LICENSE). Contains code derived from
[substack-api](https://github.com/jakub-k-slys/substack-api) © Jakub Slys.
