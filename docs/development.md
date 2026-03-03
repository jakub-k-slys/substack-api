# Development

## Prerequisites

- Node.js 18 or higher
- pnpm (`npm install -g pnpm`)
- A Substack account (for E2E tests)

## Local Setup

```bash
git clone https://github.com/jakub-k-slys/substack-api.git
cd substack-api
pnpm install
pnpm build
```

## Project Structure

```
substack-api/
├── src/
│   ├── substack-client.ts          # Main client class
│   ├── index.ts                    # Public API exports
│   ├── domain/                     # Entity classes
│   │   ├── profile.ts
│   │   ├── own-profile.ts
│   │   ├── post.ts
│   │   ├── note.ts
│   │   └── comment.ts
│   ├── internal/
│   │   ├── http-client.ts          # Axios wrapper with auth headers
│   │   ├── validation.ts           # io-ts runtime validation helpers
│   │   ├── types/                  # Gateway response types + io-ts codecs
│   │   └── services/               # Domain services (PostService, NoteService, …)
│   └── types/                      # Public-facing TypeScript type definitions
├── tests/
│   ├── unit/                       # Mocked unit tests
│   │   └── fixtures/               # Shared factory functions and mock client
│   ├── integration/                # Tests against a local mock HTTP server
│   └── e2e/                        # Tests against the real gateway/API
├── samples/                        # Runnable example scripts
├── docs/                           # Documentation
├── jest.config.js                  # Unit test config
├── jest.integration.config.js      # Integration test config
├── jest.e2e.config.js              # E2E test config
├── tsconfig.json
└── package.json
```

## Commands

| Command | Description |
|---|---|
| `pnpm build` | Compile TypeScript to `dist/` |
| `pnpm clean` | Remove `dist/` |
| `pnpm test` | Run all tests (unit + integration + e2e) |
| `pnpm test:unit` | Unit tests only |
| `pnpm test:integration` | Integration tests only |
| `pnpm test:e2e` | E2E tests (requires credentials) |
| `pnpm test:watch` | Unit tests in watch mode |
| `pnpm lint` | Check code style |
| `pnpm lint:fix` | Auto-fix linting issues |
| `pnpm sample` | Run the sample script |

**Required before committing:** `pnpm lint && pnpm build && pnpm test`

## Architecture

### HTTP Layer

`HttpClient` (`src/internal/http-client.ts`) wraps axios and attaches two headers to every request:

- `Authorization: Bearer <token>` — the base64-encoded credentials
- `x-publication-url` — the user's publication URL

All requests go to the configured gateway (default: `https://substack-gateway.vercel.app`).

### Services

Each domain concept has a service class in `src/internal/services/`:

| Service | Responsibility |
|---|---|
| `ProfileService` | `GET /me`, `GET /profiles/{slug}` |
| `PostService` | `GET /posts/{id}`, `GET /profiles/{slug}/posts` |
| `NoteService` | `GET /notes/{id}`, `GET /me/notes`, `GET /profiles/{slug}/notes` |
| `NewNoteService` | `POST /notes` |
| `CommentService` | `GET /posts/{id}/comments` |
| `FollowingService` | `GET /me/following` |
| `ConnectivityService` | `GET /health/ready` |

### Runtime Validation

`decodeOrThrow` (`src/internal/validation.ts`) validates all gateway responses with io-ts codecs before they reach entity constructors. If the shape doesn't match, it throws with a descriptive error rather than silently producing bad data.

### Entities

Entity classes in `src/domain/` take a validated gateway response and expose a clean TypeScript API. Pagination is implemented as async generators — entities call services in a loop, yielding items until the limit is hit or there are no more pages.

## Testing

### Unit Tests

Test individual components in isolation. Services and entities are mocked at the `HttpClient` level using shared fixtures in `tests/unit/fixtures/`.

```bash
pnpm test:unit
```

### Integration Tests

Test the full client against a real local HTTP server (started automatically by the Jest setup in `tests/integration/setup.ts`). No credentials required.

```bash
pnpm test:integration
```

### E2E Tests

Test against the real gateway and Substack API. Require credentials:

1. Copy the example env file:
   ```bash
   cp .env.example .env
   ```

2. Fill in your credentials:
   ```bash
   # .env
   SUBSTACK_TOKEN=<btoa(JSON.stringify({substack_sid: '...', connect_sid: '...'}))>
   SUBSTACK_HOSTNAME=yoursite.substack.com
   ```

3. Run:
   ```bash
   pnpm test:e2e
   ```

## Contributing

1. Fork the repository and create a feature branch
2. Make your changes with tests
3. Run `pnpm lint && pnpm build && pnpm test`
4. Submit a pull request using [Conventional Commits](https://www.conventionalcommits.org/) in the title (`feat:`, `fix:`, `chore:`, etc.)

## Release

1. Update `package.json` version
2. Add a `changelog.md` entry
3. Run `pnpm build && pnpm test`
4. Commit, tag, and push:
   ```bash
   git commit -m "chore(release): x.y.z"
   git tag vx.y.z
   git push origin main --tags
   ```
5. Publish: `pnpm publish`
