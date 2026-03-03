# Entity Model

The Substack API client uses an object-oriented entity model. Each entity exposes methods for navigation and interaction, with pagination handled automatically via async iterators.

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
console.log('Connected:', isConnected);
```

---

## Profile Entities

### Profile (read-only)

Represents any Substack user. Obtained via `client.profileForSlug(slug)`.

#### Properties

```typescript
class Profile {
  id: number;        // Numeric user ID
  name: string;      // Display name
  slug: string;      // URL handle
  handle: string;    // Same as slug
  url: string;       // Profile URL
  avatarUrl: string; // Avatar image URL
  bio?: string;      // Bio text (optional)
}
```

#### posts()

```typescript
posts(options?: { limit?: number }): AsyncIterable<PreviewPost>
```

Iterates through the profile's posts. Pagination is handled automatically.

```typescript
const profile = await client.profileForSlug('platformer');

for await (const post of profile.posts({ limit: 10 })) {
  console.log(`${post.publishedAt.toLocaleDateString()} — ${post.title}`);
}
```

#### notes()

```typescript
notes(options?: { limit?: number }): AsyncIterable<Note>
```

Iterates through the profile's notes using cursor-based pagination.

```typescript
for await (const note of profile.notes({ limit: 20 })) {
  console.log(`${note.author.name}: ${note.body.substring(0, 80)}`);
}
```

---

### OwnProfile

Your authenticated profile. Extends `Profile` with content creation capabilities. Obtained via `client.ownProfile()`.

```typescript
const me = await client.ownProfile();
console.log(`Logged in as ${me.name} (@${me.handle})`);
```

#### newNote()

```typescript
newNote(): NoteBuilder
```

Returns a `NoteBuilder` for composing and publishing a note.

```typescript
await me.newNote()
  .paragraph()
  .text('Shipped something new today.')
  .publish();
```

#### newNoteWithLink()

```typescript
newNoteWithLink(link: string): NoteWithLinkBuilder
```

Returns a builder that attaches a URL to the note on publish.

```typescript
await me.newNoteWithLink('https://example.com/post')
  .paragraph()
  .text('New post is live!')
  .publish();
```

#### following()

```typescript
following(options?: { limit?: number }): AsyncIterable<Profile>
```

Iterates through the profiles you follow.

```typescript
for await (const user of me.following({ limit: 50 })) {
  console.log(`${user.name} (@${user.handle})`);
}
```

#### notes() (OwnProfile)

`OwnProfile.notes()` fetches notes from your own authenticated feed (different endpoint from `Profile.notes()`).

```typescript
for await (const note of me.notes({ limit: 10 })) {
  console.log(note.body.substring(0, 80));
}
```

---

## Post Entities

### PreviewPost

Returned when iterating `profile.posts()`. Contains truncated content.

#### Properties

```typescript
class PreviewPost {
  id: number;
  title: string;
  subtitle: string;
  body: string;           // Truncated body
  truncatedBody: string;  // Same as body
  publishedAt: Date;
}
```

#### fullPost()

Fetches the complete post with full HTML body and metadata.

```typescript
for await (const preview of profile.posts({ limit: 3 })) {
  const post = await preview.fullPost();
  console.log(`${post.title} (${post.htmlBody.length} chars)`);
}
```

#### comments()

```typescript
comments(options?: { limit?: number }): AsyncIterable<Comment>
```

```typescript
for await (const comment of post.comments({ limit: 10 })) {
  console.log(comment.body);
}
```

---

### FullPost

Complete post with all fields. Returned by `client.postForId()` or `preview.fullPost()`.

#### Properties

```typescript
class FullPost {
  id: number;
  title: string;
  subtitle: string;
  body: string;                        // Full HTML body
  htmlBody: string;                    // Same as body
  truncatedBody: string;
  publishedAt: Date;
  createdAt: Date;
  slug: string;
  url: string;
  reactions?: Record<string, number>;  // e.g. { '❤': 42 }
  restacks?: number;
  postTags?: string[];
  coverImage?: string;
}
```

---

## Note Entity

Short-form content. Returned when iterating notes or via `client.noteForId()`.

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

**Example:**
```typescript
const note = await client.noteForId(131648795);
console.log(`${note.author.name}: ${note.body}`);
console.log(`${note.likesCount} likes — ${note.publishedAt.toLocaleDateString()}`);
```

---

## Comment Entity

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

Fluent builder for composing notes as Markdown. Paragraphs, inline formatting, and lists are all supported.

### Inline formatting

```typescript
await me.newNote()
  .paragraph()
  .text('Normal text, ')
  .bold('bold, ')
  .italic('italic, ')
  .code('code()')
  .publish();
```

### Links

```typescript
await me.newNote()
  .paragraph()
  .text('Read my post: ')
  .link('click here', 'https://example.com/post')
  .publish();
```

### Multiple paragraphs

```typescript
await me.newNote()
  .paragraph()
  .text('First paragraph.')
  .paragraph()
  .text('Second paragraph.')
  .publish();
```

### Bullet list

```typescript
await me.newNote()
  .paragraph()
  .text('Lessons learned:')
  .bulletList()
  .item().text('Ship early').finish()
  .item().text('Gather feedback').finish()
  .item().bold('Iterate').finish()
  .finish()
  .publish();
```

### Numbered list

```typescript
await me.newNote()
  .paragraph()
  .text('Steps:')
  .numberedList()
  .item().text('Install the package').finish()
  .item().text('Configure credentials').finish()
  .item().text('Call the API').finish()
  .finish()
  .publish();
```

### build() — preview without publishing

```typescript
const markdown = me.newNote()
  .paragraph()
  .text('Hello ')
  .bold('world')
  .build();

console.log(markdown); // "Hello **world**"
```

---

## Async Iteration Patterns

### Simple iteration

```typescript
for await (const post of profile.posts()) {
  console.log(post.title);
}
```

### Limited iteration

```typescript
for await (const post of profile.posts({ limit: 10 })) {
  console.log(post.title);
}
```

### Break early

```typescript
for await (const post of profile.posts()) {
  if (post.title.includes('target')) {
    console.log('Found!');
    break;
  }
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

## Error Handling

```typescript
// Handle lookup errors
try {
  const profile = await client.profileForSlug('nonexistent-slug');
} catch (error) {
  if (error.message.includes('404')) {
    console.error('User not found');
  } else {
    console.error(error.message);
  }
}

// Handle errors during iteration
try {
  for await (const post of profile.posts()) {
    // ...
  }
} catch (error) {
  console.error('Error during iteration:', error.message);
}
```
