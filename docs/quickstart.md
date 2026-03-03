# Quickstart

## Installation

```bash
npm install substack-api
# or
yarn add substack-api
# or
pnpm add substack-api
```

**Requirements:** Node.js 18 or higher.

The library ships with TypeScript definitions — no separate `@types` package needed.

## Authentication

The client authenticates using two session cookies from your browser. Log in to Substack, then:

1. Open Developer Tools → Application → Cookies → `https://substack.com`
2. Copy the values of `substack.sid` and `connect.sid`

Build the token:

```typescript
const token = btoa(JSON.stringify({
  substack_sid: 'your-substack.sid-value',
  connect_sid: 'your-connect.sid-value'
}));
```

Store credentials in environment variables — never hardcode them:

```bash
# .env
SUBSTACK_TOKEN=<base64-encoded token>
SUBSTACK_HOSTNAME=yourname.substack.com
```

## Basic Setup

```typescript
import { SubstackClient } from 'substack-api';

const token = btoa(JSON.stringify({
  substack_sid: process.env.SUBSTACK_SID!,
  connect_sid: process.env.CONNECT_SID!
}));

const client = new SubstackClient({
  publicationUrl: process.env.SUBSTACK_HOSTNAME!,
  token
});

const isConnected = await client.testConnectivity();
if (!isConnected) {
  throw new Error('Authentication failed — check your cookies');
}
```

## Get Your Profile

```typescript
const me = await client.ownProfile();
console.log(`Logged in as ${me.name} (@${me.slug})`);
```

## Browse Another Profile's Posts

```typescript
const profile = await client.profileForSlug('platformer');

for await (const post of profile.posts({ limit: 5 })) {
  console.log(`${post.publishedAt.toLocaleDateString()} — ${post.title}`);
}
```

## Publish a Note

```typescript
const me = await client.ownProfile();

await me.publishNote('Just shipped something new!');
```

## Publish a Note with a Link Attachment

```typescript
await me.publishNote('New post is live — check it out.', {
  attachment: 'https://example.com/my-post'
});
```

## Read a Specific Post

```typescript
const post = await client.postForId(167180194);
console.log(`${post.title} — ${post.url}`);

for await (const comment of post.comments({ limit: 10 })) {
  console.log(`  ${comment.body.substring(0, 80)}`);
}
```

## Browse Your Following Feed

```typescript
const me = await client.ownProfile();

for await (const user of me.following({ limit: 20 })) {
  console.log(`${user.name} (@${user.slug})`);

  for await (const post of user.posts({ limit: 1 })) {
    console.log(`  Latest: ${post.title}`);
  }
}
```

## Next Steps

- [API Reference](api-reference.md) — full method and type documentation
- [Examples](examples.md) — real-world usage patterns
