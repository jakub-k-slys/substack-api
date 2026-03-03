# API Reference

Comprehensive documentation for the SubstackClient entity-based API, including all classes, methods, and types.

## SubstackClient Class

The main entry point for interacting with the Substack API through the substack-gateway proxy.

### Constructor

```typescript
new SubstackClient(config: SubstackConfig)
```

**Parameters:**
- `config`: Configuration object (required)
  - `publicationUrl` (required): Your publication URL (e.g. `'yourname.substack.com'`)
  - `token` (required): Base64-encoded credentials — see [Authentication](#authentication) below
  - `gatewayUrl` (optional): Override gateway base URL (defaults to `'https://substack-gateway.vercel.app'`)
  - `perPage` (optional): Items per paginated page (default: `25`)
  - `maxRequestsPerSecond` (optional): Rate limit (default: `25`)

**Example:**
```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  publicationUrl: 'yourname.substack.com',
  token: SubstackClient.makeToken(
    process.env.SUBSTACK_SID!,
    process.env.CONNECT_SID!
  )
});
```

### Authentication

The `token` field must be a base64-encoded JSON object containing both session cookies from your browser:

```typescript
// Build token manually
const token = btoa(JSON.stringify({
  substack_sid: 'your-substack.sid-cookie',
  connect_sid: 'your-connect.sid-cookie'
}));
```

To extract cookies:
1. Log in to Substack in your browser
2. Open Developer Tools → Application/Storage → Cookies → `https://substack.com`
3. Copy the values of `substack.sid` and `connect.sid`

### Core Methods

#### testConnectivity()

```typescript
testConnectivity(): Promise<boolean>
```

Tests API connectivity and authentication status.

**Returns:** `Promise<boolean>` — `true` if connected successfully

**Example:**
```typescript
const isConnected = await client.testConnectivity();
if (!isConnected) {
  throw new Error('Authentication failed — check your token');
}
```

#### ownProfile()

```typescript
ownProfile(): Promise<OwnProfile>
```

Gets your authenticated profile with content creation capabilities.

**Example:**
```typescript
const me = await client.ownProfile();
console.log(`${me.name} (@${me.handle})`);
```

#### profileForSlug()

```typescript
profileForSlug(slug: string): Promise<Profile>
```

Gets a read-only profile by username/handle.

**Parameters:**
- `slug`: The user's handle (without `@`)

**Example:**
```typescript
const profile = await client.profileForSlug('example-user');
console.log(`${profile.name}: ${profile.bio ?? 'No bio'}`);
```

#### postForId()

```typescript
postForId(id: number): Promise<FullPost>
```

Gets a specific post by its numeric ID.

**Parameters:**
- `id`: The post's numeric ID

**Example:**
```typescript
const post = await client.postForId(167180194);
console.log(`Title: ${post.title}`);
console.log(`URL: ${post.url}`);
```

#### noteForId()

```typescript
noteForId(id: number): Promise<Note>
```

Gets a specific note by its numeric ID.

**Parameters:**
- `id`: The note's numeric ID

**Example:**
```typescript
const note = await client.noteForId(131648795);
console.log(`${note.author.name}: ${note.body}`);
```

---

## Entity Classes

### Profile

Represents a read-only user profile.

#### Properties

```typescript
class Profile {
  id: number;         // Numeric user ID
  name: string;       // Display name
  slug: string;       // Handle/username
  handle: string;     // Handle/username (same as slug)
  url: string;        // Profile URL
  avatarUrl: string;  // Avatar image URL
  bio?: string;       // Profile bio (optional)
}
```

#### Methods

##### posts()

```typescript
posts(options?: { limit?: number }): AsyncIterable<PreviewPost>
```

Iterate through the profile's posts with automatic pagination.

**Example:**
```typescript
for await (const post of profile.posts({ limit: 10 })) {
  console.log(`${post.title} — ${post.publishedAt.toLocaleDateString()}`);
}
```

##### notes()

```typescript
notes(options?: { limit?: number }): AsyncIterable<Note>
```

Iterate through the profile's notes with automatic cursor-based pagination.

**Example:**
```typescript
for await (const note of profile.notes({ limit: 20 })) {
  console.log(note.body.substring(0, 80));
}
```

---

### OwnProfile

Extends `Profile` with write capabilities. Obtained via `client.ownProfile()`.

#### Additional Methods

##### newNote()

```typescript
newNote(): NoteBuilder
```

Returns a `NoteBuilder` for constructing and publishing a note.

**Example:**
```typescript
const note = await me.newNote()
  .paragraph()
  .text('Just shipped something new! ')
  .bold('Check it out.')
  .publish();

console.log(`Published note ID: ${note.id}`);
```

##### newNoteWithLink()

```typescript
newNoteWithLink(link: string): NoteWithLinkBuilder
```

Returns a `NoteWithLinkBuilder` that attaches a URL to the note on publish.

**Example:**
```typescript
await me.newNoteWithLink('https://example.com/my-post')
  .paragraph()
  .text('New post is live!')
  .publish();
```

##### following()

```typescript
following(options?: { limit?: number }): AsyncIterable<Profile>
```

Iterate through profiles you follow.

**Example:**
```typescript
for await (const user of me.following({ limit: 50 })) {
  console.log(`${user.name} (@${user.handle})`);
}
```

##### notes() (OwnProfile override)

`OwnProfile.notes()` fetches notes from the authenticated user's own feed (using a different endpoint than `Profile.notes()`).

```typescript
for await (const note of me.notes({ limit: 10 })) {
  console.log(note.body.substring(0, 80));
}
```

---

### PreviewPost

A post as returned when iterating a profile's posts. Contains truncated content.

#### Properties

```typescript
class PreviewPost {
  id: number;
  title: string;
  subtitle: string;
  body: string;           // Truncated body content
  truncatedBody: string;  // Same as body
  publishedAt: Date;
}
```

#### Methods

##### fullPost()

```typescript
fullPost(): Promise<FullPost>
```

Fetches the complete post with full HTML body and metadata.

**Example:**
```typescript
for await (const preview of profile.posts({ limit: 5 })) {
  const post = await preview.fullPost();
  console.log(post.htmlBody.length, 'chars');
}
```

##### comments()

```typescript
comments(options?: { limit?: number }): AsyncIterable<Comment>
```

**Example:**
```typescript
for await (const comment of post.comments({ limit: 10 })) {
  console.log(`${comment.body}`);
}
```

---

### FullPost

A complete post returned by `client.postForId()` or `preview.fullPost()`.

#### Properties

```typescript
class FullPost {
  id: number;
  title: string;
  subtitle: string;
  body: string;                        // Full HTML body
  htmlBody: string;                    // Full HTML body
  truncatedBody: string;
  publishedAt: Date;
  createdAt: Date;
  slug: string;                        // URL slug
  url: string;                         // Canonical URL
  reactions?: Record<string, number>;  // Reaction counts by type
  restacks?: number;
  postTags?: string[];
  coverImage?: string;
}
```

#### Methods

##### comments()

Same as `PreviewPost.comments()`.

---

### Note

Represents a short-form note.

#### Properties

```typescript
class Note {
  id: number;
  body: string;
  likesCount: number;
  publishedAt: Date;
  author: {
    id: number;
    name: string;
    handle: string;
    avatarUrl: string;
  };
}
```

---

### Comment

Represents a comment on a post.

#### Properties

```typescript
class Comment {
  id: number;
  body: string;
  isAdmin?: boolean;
}
```

---

## NoteBuilder

Fluent builder for constructing and publishing notes. Obtained via `me.newNote()`.

### Flow

```
NoteBuilder
  └── .paragraph() → ParagraphBuilder
        ├── .text(str)
        ├── .bold(str)
        ├── .italic(str)
        ├── .code(str)
        ├── .underline(str)
        ├── .link(text, url)
        ├── .bulletList() → ListBuilder
        │     └── .item() → ListItemBuilder
        │           └── .text() / .bold() / ...
        │           └── .finish() → ParagraphBuilder
        ├── .paragraph()  ← start new paragraph
        ├── .build()      ← returns Markdown string
        └── .publish()    ← POSTs and returns note response
```

### Example — multi-paragraph note

```typescript
const note = await me.newNote()
  .paragraph()
  .text('First paragraph content.')
  .paragraph()
  .bold('Key insight: ')
  .text('keep it simple.')
  .paragraph()
  .text('Read more: ')
  .link('my latest post', 'https://example.com/post')
  .publish();
```

### Example — note with list

```typescript
await me.newNote()
  .paragraph()
  .text('Top 3 lessons:')
  .bulletList()
  .item().text('Ship early').finish()
  .item().text('Listen to users').finish()
  .item().bold('Iterate fast').finish()
  .finish()
  .publish();
```

### Example — note with link attachment

```typescript
await me.newNoteWithLink('https://example.com/article')
  .paragraph()
  .text('Great read — highly recommend.')
  .publish();
```

### build() vs publish()

```typescript
// Just get the Markdown string (no network call)
const markdown = me.newNote().paragraph().text('hello').build();

// Build and POST to the API
const response = await me.newNote().paragraph().text('hello').publish();
```

---

## Async Iteration Patterns

### Basic iteration

```typescript
for await (const post of profile.posts()) {
  console.log(post.title);
}
```

### Limit results

```typescript
for await (const post of profile.posts({ limit: 10 })) {
  console.log(post.title);
}
```

### Break early

```typescript
for await (const post of profile.posts()) {
  if (post.title.includes('target')) {
    console.log('Found it!');
    break;
  }
}
```

### Nested iteration

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

### SubstackConfig

```typescript
interface SubstackConfig {
  publicationUrl: string;        // Required: e.g. 'yourname.substack.com'
  token: string;                 // Required: btoa(JSON.stringify({substack_sid, connect_sid}))
  gatewayUrl?: string;           // Optional: override gateway URL
  perPage?: number;              // Optional: pagination page size (default: 25)
  maxRequestsPerSecond?: number; // Optional: rate limit (default: 25)
}
```

### Iterator options

```typescript
interface PostsIteratorOptions  { limit?: number }
interface NotesIteratorOptions  { limit?: number }
interface CommentsIteratorOptions { limit?: number }
```

---

## Error Handling

```typescript
try {
  const post = await client.postForId(167180194);
  for await (const comment of post.comments()) {
    console.log(comment.body);
  }
} catch (error) {
  if (error.message.includes('404')) {
    console.error('Not found');
  } else if (error.message.includes('401')) {
    console.error('Authentication failed — check your token');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```
