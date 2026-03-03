# Substack API

A TypeScript client library for interacting with Substack. All requests are proxied through [substack-gateway](https://substack-gateway.vercel.app), which handles authentication and communication with Substack's internal API.

## Who This Is For

**Content creators** — publish notes, read comments on your posts, explore your following network programmatically.

**Developers** — integrate Substack data into applications, build automation workflows around note publishing, extract and analyse content from Substack profiles.

## Features

- **Entity-oriented API** — navigate Substack data through rich objects (`profile.posts()`, `post.comments()`)
- **Async iterators** — pagination handled automatically with `for await` syntax
- **Full TypeScript support** — all entities and config types are strongly typed
- **Cookie authentication** — secure authentication using `substack.sid` and `connect.sid` session cookies
- **Note publishing** — publish notes with optional link attachments via `publishNote(content, options?)`
- **Smart pagination** — offset-based for posts, cursor-based for notes; configurable limits

## Architecture

```
SubstackClient
  ↓ HTTP via substack-gateway proxy
Profile, OwnProfile, PreviewPost, FullPost, Note, Comment
  ↓
Async iterators for paginated collections
```

All HTTP requests are routed through the substack-gateway with:
- `Authorization: Bearer <token>` header
- `x-publication-url` header

## Quick Links

- [GitHub Repository](https://github.com/jakub-k-slys/substack-api)
- [NPM Package](https://www.npmjs.com/package/substack-api)
- [Issue Tracker](https://github.com/jakub-k-slys/substack-api/issues)

## Contents

- [Quickstart](quickstart.md) — install, authenticate, and make your first API call
- [API Reference](api-reference.md) — complete class, method, and type documentation
- [Examples](examples.md) — practical usage patterns
- [Development](development.md) — contributing and project internals
- [Changelog](changelog.md)
