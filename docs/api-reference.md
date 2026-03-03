# API Reference

## SubstackClient

The main entry point. Routes all requests through the substack-gateway proxy.

### Constructor

```typescript
new SubstackClient(config: SubstackConfig)
```

| Parameter | Type | Required | Description |
|---|---|---|---|
| `publicationUrl` | `string` | Yes | Your publication URL, e.g. `'yourname.substack.com'` |
| `token` | `string` | Yes | Base64-encoded credentials — see [Authentication](#authentication) |
| `gatewayUrl` | `string` | No | Override gateway URL (default: `'https://substack-gateway.vercel.app'`) |
| `perPage` | `number` | No | Pagination page size (default: `25`) |
| `maxRequestsPerSecond` | `number` | No | Rate limit (default: `25`) |

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  publicationUrl: 'yourname.substack.com',
  token: btoa(JSON.stringify({
    substack_sid: process.env.SUBSTACK_SID!,
    connect_sid: process.env.CONNECT_SID!
  }))
});
```

### Authentication

The `token` is a base64-encoded JSON object containing both session cookies:

```typescript
const token = btoa(JSON.stringify({
  substack_sid: 'your-substack.sid-cookie',
  connect_sid: 'your-connect.sid-cookie'
}));
```

To get the cookie values: log in to Substack → Developer Tools → Application → Cookies → `https://substack.com`.

### Methods

#### `testConnectivity()`

```typescript
testConnectivity(): Promise<boolean>
```

Tests gateway connectivity and authentication. Returns `true` if connected successfully.

#### `ownProfile()`

```typescript
ownProfile(): Promise<OwnProfile>
```

Returns your authenticated profile with write capabilities.

#### `profileForSlug(slug)`

```typescript
profileForSlug(slug: string): Promise<Profile>
```

Returns a read-only profile by username/handle. Throws if slug is empty or profile not found.

#### `postForId(id)`

```typescript
postForId(id: number): Promise<FullPost>
```

Returns a specific post by its numeric ID. Throws if not found.

#### `noteForId(id)`

```typescript
noteForId(id: number): Promise<Note>
```

Returns a specific note by its numeric ID. Throws if not found.

---

## Profile

Represents a read-only Substack user profile. Obtained via `client.profileForSlug(slug)`.

### Properties

```typescript
id: number         // Numeric user ID
name: string       // Display name
slug: string       // URL handle / username
handle: string     // Same as slug
url: string        // Profile URL
avatarUrl: string  // Avatar image URL
bio?: string       // Profile bio (optional)
```

### `posts(options?)`

```typescript
posts(options?: { limit?: number }): AsyncIterable<PreviewPost>
```

Iterates through the profile's posts with automatic offset-based pagination.

```typescript
for await (const post of profile.posts({ limit: 10 })) {
  console.log(`${post.publishedAt.toLocaleDateString()} — ${post.title}`);
}
```

### `notes(options?)`

```typescript
notes(options?: { limit?: number }): AsyncIterable<Note>
```

Iterates through the profile's notes with automatic cursor-based pagination.

```typescript
for await (const note of profile.notes({ limit: 20 })) {
  console.log(`${note.author.name}: ${note.body.substring(0, 80)}`);
}
```

---

## OwnProfile

Extends `Profile` with write capabilities. Obtained via `client.ownProfile()`.

`OwnProfile.notes()` uses the authenticated user's own feed endpoint, not the public profile endpoint.

### `publishNote(content, options?)`

```typescript
publishNote(
  content: string,
  options?: { attachment?: string }
): Promise<{ id: number }>
```

Publishes a note. `content` is Markdown. The gateway converts it to Substack's format.

```typescript
const me = await client.ownProfile();

// Plain note
await me.publishNote('Just shipped something new!');

// Note with link attachment
await me.publishNote('New post is live — check it out.', {
  attachment: 'https://example.com/my-post'
});
```

### `following(options?)`

```typescript
following(options?: { limit?: number }): AsyncIterable<Profile>
```

Iterates through the profiles you follow.

```typescript
for await (const user of me.following({ limit: 50 })) {
  console.log(`${user.name} (@${user.slug})`);
}
```

---

## PreviewPost

A post as returned when iterating `profile.posts()`. Contains truncated content.

### Properties

```typescript
id: number
title: string
subtitle: string
body: string          // Truncated body text
truncatedBody: string // Same as body
publishedAt: Date
```

### `comments(options?)`

```typescript
comments(options?: { limit?: number }): AsyncIterable<Comment>
```

### `fullPost()`

```typescript
fullPost(): Promise<FullPost>
```

Fetches the complete post with full HTML body and all metadata.

```typescript
for await (const preview of profile.posts({ limit: 3 })) {
  const post = await preview.fullPost();
  console.log(`${post.title} — ${post.htmlBody.length} chars`);
}
```

---

## FullPost

Complete post returned by `client.postForId()` or `preview.fullPost()`.

### Properties

```typescript
id: number
title: string
subtitle: string
slug: string                         // URL slug
url: string                          // Canonical URL
body: string                         // Full HTML body
htmlBody: string                     // Same as body
truncatedBody: string
publishedAt: Date
createdAt: Date
reactions?: Record<string, number>   // e.g. { '❤': 42 }
restacks?: number
postTags?: string[]
coverImage?: string
```

### `comments(options?)`

```typescript
comments(options?: { limit?: number }): AsyncIterable<Comment>
```

---

## Note

Short-form content. Returned when iterating notes or via `client.noteForId()`.

### Properties

```typescript
id: number
body: string
likesCount: number
publishedAt: Date
author: {
  id: number
  name: string
  handle: string
  avatarUrl: string
}
```

---

## Comment

A comment on a post.

### Properties

```typescript
id: number
body: string
isAdmin?: boolean
```

---

## Async Iteration Patterns

### Limit results

```typescript
for await (const post of profile.posts({ limit: 10 })) {
  console.log(post.title);
}
```

### Break early

```typescript
for await (const post of profile.posts()) {
  if (post.title.includes('target')) break;
}
```

### Collect into array

```typescript
const posts = [];
for await (const post of profile.posts({ limit: 20 })) {
  posts.push(post);
}
posts.sort((a, b) => b.publishedAt.getTime() - a.publishedAt.getTime());
```

### Nested navigation

```typescript
for await (const post of profile.posts({ limit: 5 })) {
  console.log(`\n${post.title}`);
  for await (const comment of post.comments({ limit: 3 })) {
    console.log(`  └ ${comment.body.substring(0, 60)}`);
  }
}
```

---

## Type Definitions

```typescript
interface SubstackConfig {
  publicationUrl: string;         // Required
  token: string;                  // Required
  gatewayUrl?: string;            // Optional: override gateway URL
  perPage?: number;               // Optional: page size (default: 25)
  maxRequestsPerSecond?: number;  // Optional: rate limit (default: 25)
}

interface PostsIteratorOptions    { limit?: number }
interface NotesIteratorOptions    { limit?: number }
interface CommentsIteratorOptions { limit?: number }
```

---

## Error Handling

All client methods throw on failure. Errors include a descriptive message:

```typescript
try {
  const profile = await client.profileForSlug('no-such-person');
} catch (error) {
  console.error(error.message);
  // e.g. "Profile with slug 'no-such-person' not found: ..."
}

try {
  for await (const post of profile.posts()) {
    console.log(post.title);
  }
} catch (error) {
  console.error('Iteration error:', error.message);
}
```
