# Examples

## Setup

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  publicationUrl: process.env.SUBSTACK_HOSTNAME!,
  token: btoa(JSON.stringify({
    substack_sid: process.env.SUBSTACK_SID!,
    connect_sid: process.env.CONNECT_SID!
  }))
});

const isConnected = await client.testConnectivity();
if (!isConnected) throw new Error('Authentication failed');
```

---

## Profiles

### Get your own profile

```typescript
const me = await client.ownProfile();
console.log(`${me.name} (@${me.slug})`);
console.log(`Bio: ${me.bio ?? 'Not set'}`);
```

### Get another profile by slug

```typescript
const profile = await client.profileForSlug('platformer');
console.log(`${profile.name} — ${profile.url}`);
```

### Browse someone's posts

```typescript
const profile = await client.profileForSlug('platformer');

for await (const post of profile.posts({ limit: 10 })) {
  console.log(`${post.publishedAt.toLocaleDateString()} — ${post.title}`);
}
```

### Browse someone's notes

```typescript
const profile = await client.profileForSlug('platformer');

for await (const note of profile.notes({ limit: 15 })) {
  console.log(`${note.author.name}: ${note.body.substring(0, 80)}`);
  console.log(`  ${note.likesCount} likes — ${note.publishedAt.toLocaleDateString()}`);
}
```

---

## Posts

### Fetch a post by ID

```typescript
const post = await client.postForId(167180194);
console.log(`Title: ${post.title}`);
console.log(`URL:   ${post.url}`);
console.log(`Tags:  ${post.postTags?.join(', ')}`);
```

### Read post comments

```typescript
const post = await client.postForId(167180194);

for await (const comment of post.comments({ limit: 20 })) {
  console.log(comment.body);
}
```

### Upgrade a preview post to full post

```typescript
const profile = await client.profileForSlug('platformer');

for await (const preview of profile.posts({ limit: 3 })) {
  const full = await preview.fullPost();
  console.log(`${full.title} — ${full.htmlBody.length} chars`);
}
```

---

## Notes

### Fetch a note by ID

```typescript
const note = await client.noteForId(131648795);
console.log(`${note.author.name}: ${note.body}`);
console.log(`${note.likesCount} likes`);
```

### Browse your own notes

```typescript
const me = await client.ownProfile();

for await (const note of me.notes({ limit: 10 })) {
  console.log(note.body.substring(0, 80));
}
```

---

## Publishing Notes

### Plain note

```typescript
const me = await client.ownProfile();

await me.publishNote('Just shipped something new!');
```

### Note with link attachment

```typescript
await me.publishNote('New post is live — check it out.', {
  attachment: 'https://example.com/my-post'
});
```

### Rich markdown note

```typescript
await me.publishNote(
  '**Quick update:** we just released v3.\n\nKey changes:\n- Gateway-based HTTP layer\n- Simplified authentication\n- Cleaner entity model'
);
```

---

## Following Feed

### List people you follow

```typescript
const me = await client.ownProfile();

for await (const user of me.following({ limit: 20 })) {
  console.log(`${user.name} (@${user.slug})`);
}
```

### Latest post from each person you follow

```typescript
const me = await client.ownProfile();

for await (const user of me.following({ limit: 10 })) {
  for await (const post of user.posts({ limit: 1 })) {
    console.log(`${user.name}: ${post.title}`);
  }
}
```

---

## Content Analysis

### Most-liked notes from a profile

```typescript
const profile = await client.profileForSlug('platformer');

const notes = [];
for await (const note of profile.notes({ limit: 50 })) {
  notes.push(note);
}

notes.sort((a, b) => b.likesCount - a.likesCount);
notes.slice(0, 5).forEach((note, i) => {
  console.log(`${i + 1}. [${note.likesCount} likes] ${note.body.substring(0, 60)}`);
});
```

### Recent activity across your network

```typescript
const me = await client.ownProfile();
const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

for await (const user of me.following({ limit: 10 })) {
  let recentPosts = 0;

  for await (const post of user.posts({ limit: 10 })) {
    if (post.publishedAt > oneWeekAgo) recentPosts++;
  }

  if (recentPosts > 0) {
    console.log(`${user.name}: ${recentPosts} posts this week`);
  }
}
```

### Collect all comments on a post

```typescript
const post = await client.postForId(167180194);

const comments = [];
for await (const comment of post.comments()) {
  comments.push(comment);
}

console.log(`${post.title} — ${comments.length} comments`);
```

---

## Error Handling

### Handle not-found errors

```typescript
try {
  const profile = await client.profileForSlug('no-such-person');
} catch (error) {
  console.error(error.message);
  // "Profile with slug 'no-such-person' not found: ..."
}
```

### Connectivity check before operations

```typescript
async function run() {
  const isConnected = await client.testConnectivity();
  if (!isConnected) {
    throw new Error('Cannot connect — check your token');
  }

  const me = await client.ownProfile();
  // ... rest of your logic
}
```
