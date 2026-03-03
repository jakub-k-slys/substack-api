# Quickstart

Get started with the Substack API client in a few minutes.

## Prerequisites

- Node.js 18+
- A Substack account
- Your `substack.sid` and `connect.sid` session cookies

## Installation

```bash
npm install substack-api
```

## Authentication

The client uses cookie-based authentication. You need **both** session cookies from your browser:

1. Log in to Substack in your browser
2. Open Developer Tools (F12) → Application → Cookies → `https://substack.com`
3. Copy the values of `substack.sid` and `connect.sid`

Build the token:

```typescript
const token = btoa(JSON.stringify({
  substack_sid: 'your-substack.sid-value',
  connect_sid: 'your-connect.sid-value'
}));
```

Store these in environment variables — never hardcode them:

```bash
# .env
SUBSTACK_SID=your-substack.sid-value
CONNECT_SID=your-connect.sid-value
SUBSTACK_PUBLICATION_URL=yourname.substack.com
```

## Basic Setup

```typescript
import { SubstackClient } from 'substack-api';

const token = btoa(JSON.stringify({
  substack_sid: process.env.SUBSTACK_SID!,
  connect_sid: process.env.CONNECT_SID!
}));

const client = new SubstackClient({
  publicationUrl: process.env.SUBSTACK_PUBLICATION_URL!,
  token
});

// Verify connectivity
const isConnected = await client.testConnectivity();
if (!isConnected) {
  throw new Error('Authentication failed — check your cookies');
}
```

## Get Your Profile

```typescript
const me = await client.ownProfile();
console.log(`Logged in as ${me.name} (@${me.handle})`);
```

## Browse Another Profile's Posts

```typescript
const profile = await client.profileForSlug('platformer');
console.log(`${profile.name}: ${profile.bio ?? ''}`);

for await (const post of profile.posts({ limit: 5 })) {
  console.log(`${post.publishedAt.toLocaleDateString()} — ${post.title}`);
}
```

## Publish a Note

```typescript
const me = await client.ownProfile();

await me.newNote()
  .paragraph()
  .text('Just shipped something new — ')
  .link('check it out', 'https://example.com')
  .publish();
```

## Publish a Note with Link Attachment

```typescript
await me.newNoteWithLink('https://example.com/my-post')
  .paragraph()
  .text('New post is live!')
  .publish();
```

## Read a Specific Post

```typescript
const post = await client.postForId(167180194);
console.log(`${post.title}`);
console.log(`${post.url}`);

for await (const comment of post.comments({ limit: 10 })) {
  console.log(`  ${comment.body.substring(0, 80)}`);
}
```

## Browse Your Following Feed

```typescript
const me = await client.ownProfile();

for await (const user of me.following({ limit: 20 })) {
  console.log(`${user.name} (@${user.handle})`);

  for await (const post of user.posts({ limit: 1 })) {
    console.log(`  Latest: ${post.title}`);
  }
}
```

## Next Steps

- [API Reference](api-reference.md) — full method and type documentation
- [Entity Model](entity-model.md) — entity classes and navigation patterns
- [Examples](examples.md) — real-world usage patterns
