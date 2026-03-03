# Introduction

The Substack API client is a TypeScript library for interacting with Substack programmatically. All requests are proxied through [substack-gateway](https://substack-gateway.vercel.app), which handles authentication and communication with Substack's internal API.

## Who This Is For

### Content Creators
- Publish notes and monitor your content programmatically
- Read and analyze comments on your posts
- Explore your following network

### Developers
- Integrate Substack data into other applications
- Build automation workflows around note publishing
- Extract and analyze content from Substack profiles

---

## Key Features

### Entity-Oriented API

Navigate Substack data through rich entity objects rather than raw JSON:

```typescript
// Navigate through relationships naturally
const profile = await client.profileForSlug('platformer');

for await (const post of profile.posts({ limit: 5 })) {
  for await (const comment of post.comments()) {
    console.log(comment.body);
  }
}
```

### Automatic Pagination

Async iterators handle pagination transparently — no manual cursor or offset management:

```typescript
for await (const note of profile.notes()) {
  console.log(note.body); // Pages are fetched automatically
}
```

### Note Builder

Compose rich notes with a fluent builder API:

```typescript
await me.newNote()
  .paragraph()
  .text('Key points:')
  .bulletList()
  .item().bold('Ship early').finish()
  .item().text('Iterate based on feedback').finish()
  .finish()
  .publish();
```

### Full TypeScript Support

All entities and configuration types are strongly typed, giving you autocomplete and compile-time safety:

```typescript
import type { Profile, Note, FullPost, SubstackConfig } from 'substack-api';
```

---

## Architecture

```
SubstackClient
  ↓ (HTTP via substack-gateway)
Entities: Profile, OwnProfile, PreviewPost, FullPost, Note, Comment
  ↓
Async iterators for paginated collections
```

All HTTP requests are routed through the substack-gateway proxy with:
- `Authorization: Bearer <token>` header
- `x-publication-url` header

Authentication requires both `substack.sid` and `connect.sid` cookies, base64-encoded together.

---

## Entity Overview

| Entity | How to get | Navigation |
|--------|-----------|------------|
| `Profile` | `client.profileForSlug(slug)` | `.posts()`, `.notes()` |
| `OwnProfile` | `client.ownProfile()` | `.posts()`, `.notes()`, `.following()`, `.newNote()`, `.newNoteWithLink()` |
| `PreviewPost` | Iterating `profile.posts()` | `.comments()`, `.fullPost()` |
| `FullPost` | `client.postForId(id)` or `preview.fullPost()` | `.comments()` |
| `Note` | `client.noteForId(id)` or iterating `.notes()` | — |
| `Comment` | Iterating `post.comments()` | — |

---

## Getting Started

```typescript
import { SubstackClient } from 'substack-api';

const token = btoa(JSON.stringify({
  substack_sid: process.env.SUBSTACK_SID!,
  connect_sid: process.env.CONNECT_SID!
}));

const client = new SubstackClient({
  publicationUrl: 'yourname.substack.com',
  token
});

const isConnected = await client.testConnectivity();
const me = await client.ownProfile();
console.log(`Welcome ${me.name}!`);
```

See the [Quickstart](quickstart.md) for the full setup guide, or jump to the [API Reference](api-reference.md) for detailed documentation.
