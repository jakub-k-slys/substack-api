# Entity Model Quick Start

The new Substack API client provides a modern, object-oriented interface with entity classes and fluent navigation.

## Basic Setup

```typescript
import { SubstackClient } from 'substack-api'

const client = new SubstackClient({
  apiKey: 'your-api-key',
  hostname: 'your-publication.substack.com' // optional
})
```

## Working with Profiles

### Get Your Own Profile

```typescript
// Get your authenticated profile with write capabilities
const myProfile = await client.ownProfile()
console.log(`${myProfile.name} (@${myProfile.slug})`)

// Create a note
const note = await myProfile.createNote({
  body: 'Hello from the new entity API!'
})
console.log(`Created note: ${note.id}`)
```

### Get Other Profiles

```typescript
// Get a profile by slug/handle
const profile = await client.profileForSlug('example-user')
console.log(`${profile.name}: ${profile.bio}`)

// Get posts from this profile
for await (const post of profile.posts({ limit: 5 })) {
  console.log(`- ${post.title}`)
}
```

## Working with Posts

### Get a Post

```typescript
const post = await client.postForId('my-post-slug')
console.log(`${post.title} by ${post.author.name}`)
console.log(`Published: ${post.publishedAt.toLocaleDateString()}`)
```

### Navigate Post Relationships

```typescript
// Get comments for a post
console.log('Comments:')
for await (const comment of post.comments({ limit: 10 })) {
  console.log(`${comment.author.name}: ${comment.body.substring(0, 100)}...`)
}

// Like a post (when implemented)
// await post.like()

// Add a comment (when implemented)
// const newComment = await post.addComment({ body: 'Great post!' })
```

## Working with Notes

### Get a Note

```typescript
const note = await client.noteForId('note-entity-key')
console.log(`${note.author.name}: ${note.body}`)
```

### Navigate Note Relationships

```typescript
// Get comments on a note
for await (const comment of note.comments()) {
  console.log(`${comment.author.name}: ${comment.body}`)
}
```

## Working with Followers/Following

### Get Who You Follow

```typescript
console.log('People you follow:')
const me = await client.ownProfile()
for await (const profile of me.followees({ limit: 20 })) {
  console.log(`- ${profile.name} (@${profile.slug})`)
  
  // Get their recent posts
  let postCount = 0
  for await (const post of profile.posts({ limit: 3 })) {
    console.log(`  📝 ${post.title}`)
    postCount++
  }
  
  if (postCount === 0) {
    console.log('  (No recent posts)')
  }
}
```

## Testing Connectivity

```typescript
const isConnected = await client.testConnectivity()
if (isConnected) {
  console.log('✅ Connected to Substack API')
} else {
  console.log('❌ Unable to connect to Substack API')
}
```

## Async Iteration Patterns

All collection methods return async iterables for seamless pagination:

```typescript
// Stream through all posts
for await (const post of profile.posts()) {
  console.log(post.title)
  // Automatically handles pagination
}

// Limit results
for await (const post of profile.posts({ limit: 50 })) {
  console.log(post.title)
  // Stops after 50 posts
}

// Collect into array if needed
const posts = []
for await (const post of profile.posts({ limit: 10 })) {
  posts.push(post)
}
console.log(`Collected ${posts.length} posts`)
```

## Key Benefits

1. **Fluent Navigation**: Easy relationship traversal (`profile.posts()`, `post.comments()`)
2. **Type Safety**: Full TypeScript support with proper entity typing
3. **Async Iterators**: Seamless pagination handling
4. **Read/Write Separation**: Clear distinction between read-only and authenticated capabilities
5. **Modern API**: Clean, intuitive method names and option objects
6. **Backwards Compatible**: Existing `Substack` class still available

## Migration from Legacy Client

The new entity model works alongside the existing client:

```typescript
// Old way
import { Substack } from 'substack-api'
const oldClient = new Substack({ apiKey: 'key' })
for await (const post of oldClient.getPosts()) {
  console.log(post.title)
}

// New way
import { SubstackClient } from 'substack-api'
const newClient = new SubstackClient({ apiKey: 'key' })
const profile = await newClient.profileForSlug('user')
for await (const post of profile.posts()) {
  console.log(post.title)
}
```

Both approaches work, allowing gradual migration to the new entity model.