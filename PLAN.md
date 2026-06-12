# substackular — Implementation Plan

## Context

We need a TypeScript npm module (pnpm-managed) in `substackular/` that provides Substack API functionality equivalent to the Python MCP toolkit `substack-gateway-oss`. The existing `substack-api` npm module is deprecated and only supports a single hardcoded auth cookie (`substack.sid` at HEAD; `connect.sid` before commit `742a6b7`) — never both, never configurable. Some Substack accounts authenticate with only `substack.sid`, others rely on `connect.sid`, and the gateway proves the robust approach is sending whichever cookies the account has.

Both references are local git clones with **no working tree checked out** (only `.git/` exists) — source must be extracted via `git archive` / `git show`.

## Decision: Fork (source-port) substack-api, don't build from scratch

**Recommendation: port substack-api's source into a fresh package, then layer in the gateway-only features.** Not a literal GitHub fork — a source extraction into a new repo with a new name and modernized tooling.

Rationale:
- **Same author, same endpoints.** substack-gateway-oss is the official successor to substack-api (by Jakub Slys). They call the *same* reverse-engineered Substack endpoints. substack-api already covers ~90% of the gateway's surface in TypeScript with strict typing, io-ts runtime validation, a 3-tier architecture, async-iterator pagination, and an 80%-coverage three-layer test suite (unit/integration/e2e with recorded fixtures in `samples/api/v1/`). Rewriting from scratch re-derives all of that with zero upside.
- **License is MIT** (permissive) — free to reuse with attribution retained.
- **The gaps are small and enumerable** (see "Delta work" below): flexible cookie auth, note deletion, markdown→ProseMirror input, retry/backoff, dual ESM/CJS packaging.
- **Why not a literal fork:** upstream is deprecated/frozen (no reason to track it), the build is CJS-only Rollup (we want dual ESM+CJS), and we want a new identity (`substackular`).

## Capability target (parity with gateway + substack-api superset)

Unauthenticated (public):
- Get profile by slug (`GET /api/v1/user/{slug}/public_profile`)
- Get profile by id (via reader feed)
- List profile posts, paginated (`GET /api/v1/profile/posts?profile_user_id=...&limit=&cursor=`)
- List profile notes, paginated (`GET /api/v1/reader/feed/profile/{id}?types=note&cursor=`)
- Get full post by id (`GET /api/v1/posts/by-id/{id}`)
- Get post comments (`GET /api/v1/post/{id}/comments`)
- Get note/comment by id (`GET /api/v1/reader/comment/{id}`)

Authenticated:
- Own profile (`GET /api/v1/handle/options`, `GET /api/v1/user-settings`)
- Own posts/notes (`GET /api/v1/notes?cursor=`)
- Following list (`GET /api/v1/user/{id}/subscriber-lists?lists=following`)
- Publish note — fluent `NoteBuilder` **and** markdown string input (`POST /api/v1/comment/feed/`)
- Note link attachments (`POST /api/v1/comment/attachment/` → UUID → `attachmentIds`)
- **Delete note** (`DELETE /api/v1/comment/{id}`) — gateway-only today, missing from substack-api
- Like post, add comment, connectivity test (`PUT /api/v1/user-setting`)

Base URLs: global `https://substack.com/api/v1/` + per-publication `https://{pub}.substack.com/api/v1/` (two HttpClient instances, as both references do).

## Architecture (carried over from substack-api)

```
src/
├── index.ts                 # public exports
├── substack-client.ts       # SubstackClient (entry class)
├── domain/                  # Profile, OwnProfile, PreviewPost, FullPost, Note, Comment, NoteBuilder
├── internal/
│   ├── http-client.ts       # REWORKED: flexible cookies + retry + rate limit
│   ├── services/            # post/profile/note/comment/following/connectivity/new-note services
│   └── types/               # io-ts codecs for raw API responses
├── converters/              # NEW: markdown → ProseMirror doc (port of gateway converters/markdown.py)
└── types/                   # SubstackConfig, pagination options
```

## Delta work (the new code on top of the port)

### 1. Flexible cookie auth (the headline fix)
Replace `HttpClient`'s hardcoded `Cookie: substack.sid=${token}` with:

```ts
interface SubstackCookies {
  substackSid?: string   // "substack.sid"
  connectSid?: string    // "connect.sid"
}
```
- Require **at least one**; send **all provided** cookies in the `Cookie` header (gateway sends both; substack-api proves either alone can work depending on account).
- `SubstackConfig` gains `substackSid` / `connectSid`; keep `apiKey` as a deprecated alias for `substackSid` to ease migration from substack-api.
- Keep the browser User-Agent / Accept headers from substack-api's `http-client.ts` (required by Substack).

### 2. Retry + backoff (port gateway behavior from `client/base.py`)
- Retry on 408/425/429/500/502/503/504 and network errors; exponential backoff; configurable attempts.
- Keep `axios` + `axios-rate-limit` (minimizes porting risk); add `axios-retry` or a small interceptor.
- Typed errors: `SubstackAuthError` (401/403) vs `SubstackApiError` (everything else), mirroring the gateway.

### 3. Note deletion
`NoteService.delete(noteId)` → `DELETE /comment/{id}` (expects 204). Surface as `note.delete()` on own notes / `OwnProfile`.

### 4. Markdown input for notes
Port `gateway_oss/converters/markdown.py`: markdown → ProseMirror `bodyJson` (bold/italic/code/links, headings, bullet & numbered lists). Expose `ownProfile.publishNote(markdown, { attachmentUrl? })` alongside the existing fluent builder. Payload constants: `tabId: "for-you"`, `surface: "feed"`, `replyMinimumRole: "everyone"`.

### 5. Modern packaging
- `package.json`: name `substackular`, version `0.1.0`, MIT license **retaining Jakub Slys's copyright notice** in LICENSE.
- Build with **tsup** → dual ESM + CJS + `.d.ts`, proper `exports` map, Node ≥ 18.
- pnpm; keep Jest + ts-jest and port the unit/integration suites + `samples/api/v1/` fixtures wholesale (cheapest path to a tested v0.1.0). E2E suite stays env-gated (`SUBSTACK_SID` / `CONNECT_SID` / `PUBLICATION_URL` in `.env`), read-only.

Out of scope for v0.1.0 (future layers, enabled by this design): an MCP server wrapper (the library API is shaped so an MCP tool layer can sit on top, as the gateway does), HTML→markdown post conversion (`turndown`), publishing/drafting full posts (neither reference supports it).

## Implementation steps

1. **Extract upstream source**: `git -C ../substack-api archive HEAD | tar -x -C substackular` (or `git worktree`/`git show` per file) — take `src/`, `tests/`, `samples/`, `tsconfig.json`, eslint/prettier configs. Init fresh git repo.
2. **Rebrand + repackage**: new `package.json` (name/version/repo), swap Rollup for tsup, `pnpm install`, get `pnpm build` green.
3. **Auth rework**: new `SubstackConfig` + `HttpClient` cookie handling; update `SubstackClient` constructor and all unit tests touching config.
4. **Retry/error layer**: interceptor + typed errors + tests.
5. **New features**: `delete note`, markdown→ProseMirror converter (port gateway's converter tests too), `publishNote(markdown)`.
6. **Tests green**: `pnpm test` (unit + integration vs fixtures) passing with ≥80% coverage thresholds kept.
7. **Docs**: README — install, how to obtain each cookie from DevTools, auth examples for substack.sid-only / connect.sid-only / both accounts, API tour, attribution note.

## Verification

- `pnpm build` produces working ESM + CJS bundles; smoke-test `require()` and `import` from a scratch consumer.
- `pnpm test` — ported unit + integration suites against recorded fixtures (offline).
- `pnpm test:e2e` with real cookies in `.env` against a real account — read-only checks (profile, posts, notes iteration), plus optionally create+delete a note as a write round-trip.
- Manually verify auth matrix: substack.sid only, connect.sid only, both.
