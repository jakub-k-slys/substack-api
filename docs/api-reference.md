# API Reference

This section provides comprehensive documentation for the modern SubstackClient entity-based API, including all classes, methods, and types with detailed descriptions and practical examples.

## SubstackClient Class

The main class for interacting with the Substack API using the modern entity model. This client provides access to profiles, posts, notes, comments, and social features through an object-oriented interface.

### Constructor

```typescript
new SubstackClient(config: SubstackConfig)
```

Creates a new SubstackClient instance with cookie-based authentication.

**Parameters:**
- `config`: Configuration object (required)
  - `apiKey`: Your connect.sid cookie value (required)
  - `hostname` (optional): Publication hostname (default: 'substack.com')

**Example:**
```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  apiKey: 'your-connect-sid-cookie-value',
  hostname: 'example.substack.com'
});
```

### Core Methods

#### testConnectivity()

```typescript
testConnectivity(): Promise<boolean>
```

Tests API connectivity and authentication status.

**Returns:**
- `Promise<boolean>` - `true` if connected successfully, `false` otherwise

**Example:**
```typescript
const isConnected = await client.testConnectivity();
if (isConnected) {
  console.log('✅ Successfully connected to Substack API');
} else {
  console.error('❌ Failed to connect - check your authentication');
}
```

#### ownProfile()

```typescript
ownProfile(): Promise<OwnProfile>
```

Gets your authenticated profile with write capabilities (content creation, following, etc.).

**Returns:**
- `Promise<OwnProfile>` - Your profile with full read/write access

**Example:**
```typescript
const myProfile = await client.ownProfile();
console.log(`Welcome ${myProfile.name}! (@${myProfile.slug})`);
console.log(`Followers: ${myProfile.followerCount}`);

// Create content using builder pattern
const note = await myProfile.newNote().paragraph().text('Just published something amazing! 🚀').publish();
console.log(`Note created: ${note.id}`);
```

#### profileForSlug()

```typescript
profileForSlug(slug: string): Promise<Profile>
```

Gets a profile by their username/slug (read-only access).

**Parameters:**
- `slug`: The user's slug/handle (without @ symbol)

**Returns:**
- `Promise<Profile>` - The user's profile (read-only)

**Example:**
```typescript
const profile = await client.profileForSlug('example-user');
console.log(`${profile.name}: ${profile.bio || 'No bio'}`);

// Navigate to their posts
for await (const post of profile.posts({ limit: 5 })) {
  console.log(`- ${post.title}`);
}
```

#### profileForId()

```typescript
profileForId(id: number): Promise<Profile>
```

Gets a profile by their numeric ID.

**Parameters:**
- `id`: The user's numeric ID

**Returns:**
- `Promise<Profile>` - The user's profile

**Example:**
```typescript
const profile = await client.profileForId(12345);
console.log(`Found: ${profile.name} (@${profile.slug})`);
```

#### postForId()

```typescript
postForId(id: string): Promise<Post>
```

Gets a specific post by its ID or slug.

**Parameters:**
- `id`: The post's ID or slug

**Returns:**
- `Promise<Post>` - The post entity

**Example:**
```typescript
const post = await client.postForId('my-awesome-post');
console.log(`Title: ${post.title}`);
console.log(`Author: ${post.author.name}`);
console.log(`Published: ${post.publishedAt?.toLocaleDateString()}`);

// Navigate to comments
for await (const comment of post.comments({ limit: 10 })) {
  console.log(`💬 ${comment.author.name}: ${comment.body.substring(0, 100)}...`);
}
```

#### noteForId()

```typescript
noteForId(id: string): Promise<Note>
```

Gets a specific note by its ID.

**Parameters:**
- `id`: The note's ID

**Returns:**
- `Promise<Note>` - The note entity

**Example:**
```typescript
const note = await client.noteForId('note-123');
console.log(`Note by ${note.author.name}: ${note.body}`);

// Interact with the note
await note.like();
await note.addComment('Great point!');
```

#### commentForId()

```typescript
commentForId(id: string): Promise<Comment>
```

Gets a specific comment by its ID.

**Parameters:**
- `id`: The comment's ID

**Returns:**
- `Promise<Comment>` - The comment entity

**Example:**
```typescript
const comment = await client.commentForId('comment-456');
console.log(`Comment by ${comment.author.name}: ${comment.body}`);

// Like the comment
await comment.like();

// Navigate to parent post
if (comment.post) {
  console.log(`Parent post: ${comment.post.title}`);
}
```

## Entity Classes

The SubstackClient returns entity objects that provide navigation and interaction capabilities.

### Profile Entity

Represents a user profile with read-only access to their content.

#### Properties

```typescript
interface Profile {
  id: number;
  name: string;
  slug: string;
  bio?: string;
  followerCount: number;
  isFollowing: boolean;
  // ... other properties
}
```

#### Methods

##### posts()

```typescript
posts(options?: { limit?: number }): AsyncIterable<Post>
```

Iterate through the profile's posts with automatic pagination.

**Example:**
```typescript
// Get all posts
for await (const post of profile.posts()) {
  console.log(post.title);
}

// Limit to 10 posts
for await (const post of profile.posts({ limit: 10 })) {
  console.log(post.title);
}
```

##### notes()

```typescript
notes(options?: { limit?: number }): AsyncIterable<Note>
```

Iterate through the profile's notes.

**Example:**
```typescript
for await (const note of profile.notes({ limit: 20 })) {
  console.log(`📝 ${note.body.substring(0, 80)}...`);
}
```

##### follow()

```typescript
follow(): Promise<void>
```

Follow this profile (requires authentication).

**Example:**
```typescript
await profile.follow();
console.log(`Now following ${profile.name}`);
```

##### unfollow()

```typescript
unfollow(): Promise<void>
```

Unfollow this profile (requires authentication).

### OwnProfile Entity

Extends Profile with write capabilities for content creation and management.

#### Additional Methods

##### newNote()

```typescript
newNote(): NoteBuilder
```

Create a new note using the builder pattern (recommended approach).

**Example:**
```typescript
// Simple note
const note = await myProfile.newNote().paragraph().text('Just shipped a new feature! 🚀').publish();

// Complex note with formatting
const complexNote = await myProfile
  .newNote()
  .paragraph()
  .text('Building something amazing...')
  .paragraph()
  .bold('Important update: ')
  .text('Check out our latest release!')
  .publish();

console.log(`Note created: ${note.id}`);
```

### Post Entity

Represents a publication post with interaction capabilities.

#### Properties

```typescript
interface Post {
  id: string;
  title: string;
  body: string;
  author: Profile;
  publishedAt?: Date;
  reactions?: Reaction[];
  // ... other properties
}
```

#### Methods

##### comments()

```typescript
comments(options?: { limit?: number }): AsyncIterable<Comment>
```

Iterate through post comments with pagination.

**Example:**
```typescript
for await (const comment of post.comments({ limit: 50 })) {
  console.log(`${comment.author.name}: ${comment.body}`);
}
```

##### like()

```typescript
like(): Promise<void>
```

Like this post (requires authentication).

**Example:**
```typescript
await post.like();
console.log('Post liked!');
```

##### addComment()

```typescript
addComment(body: string): Promise<Comment>
```

Add a comment to this post (requires authentication).

**Example:**
```typescript
const comment = await post.addComment('Great insights! Thanks for sharing.');
console.log(`Comment added: ${comment.id}`);
```

### Note Entity

Represents a short-form note/post.

#### Properties

```typescript
interface Note {
  id: string;
  body: string;
  author: Profile;
  createdAt: Date;
  reactions?: Reaction[];
  // ... other properties
}
```

#### Methods

##### like()

```typescript
like(): Promise<void>
```

Like this note.

##### addComment()

```typescript
addComment(body: string): Promise<Comment>
```

Add a comment to this note.

### Comment Entity

Represents a comment on a post or note.

#### Properties

```typescript
interface Comment {
  id: string;
  body: string;
  author: Profile;
  post?: Post;
  createdAt: Date;
  reactions?: Reaction[];
  // ... other properties
}
```

#### Methods

##### like()

```typescript
like(): Promise<void>
```

Like this comment.

## Async Iteration Patterns

The entity model uses async iterators for seamless pagination handling.

### Basic Iteration

```typescript
// Simple iteration - processes all items
for await (const post of profile.posts()) {
  console.log(post.title);
}
```

### Limited Iteration

```typescript
// Limit total items processed
for await (const post of profile.posts({ limit: 10 })) {
  console.log(post.title);
}
```

### Manual Control

```typescript
// Break early based on conditions
for await (const post of profile.posts()) {
  console.log(post.title);
  
  if (post.title.includes('IMPORTANT')) {
    console.log('Found important post, stopping search');
    break;
  }
}
```

### Collecting Results

```typescript
// Collect into array for further processing
const recentPosts = [];
for await (const post of profile.posts({ limit: 20 })) {
  recentPosts.push(post);
}

console.log(`Collected ${recentPosts.length} recent posts`);
recentPosts.forEach(post => {
  console.log(`- ${post.title} (${post.publishedAt?.toLocaleDateString()})`);
});
```

### Nested Iteration

```typescript
// Navigate relationships with nested iteration
for await (const post of profile.posts({ limit: 5 })) {
  console.log(`\n📄 ${post.title}`);
  console.log(`   💖 ${post.reactions?.length || 0} reactions`);
  
  // Get comments for each post
  const comments = [];
  for await (const comment of post.comments({ limit: 3 })) {
    comments.push(comment);
  }
  console.log(`   💬 ${comments.length} recent comments`);
}
```

## Error Handling

Handle errors gracefully in entity operations:

```typescript
try {
  const profile = await client.ownProfile();
  
  // Try to create content using builder pattern
  const note = await profile.newNote().paragraph().text('My first note! 🎉').publish();
  
  console.log(`Note created: ${note.id}`);
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Authentication failed - check your connect.sid cookie');
  } else if (error.message.includes('403')) {
    console.error('Permission denied - check your account permissions');
  } else {
    console.error('Unexpected error:', error.message);
  }
}
```

## Type Definitions

### SubstackConfig

```typescript
interface SubstackConfig {
  apiKey: string;        // connect.sid cookie value
  hostname?: string;     // publication hostname (optional)
}
```

### Common Types

```typescript
interface Reaction {
  id: string;
  type: string;
  author: Profile;
}

interface IteratorOptions {
  limit?: number;        // Maximum total items to retrieve
}
```

## Best Practices

### Authentication

- Always use environment variables for your connect.sid cookie
- Test connectivity before performing operations
- Handle authentication errors gracefully

```typescript
const client = new SubstackClient({
  apiKey: process.env.SUBSTACK_API_KEY!
});

const isConnected = await client.testConnectivity();
if (!isConnected) {
  throw new Error('Failed to authenticate with Substack API');
}
```

### Pagination

- Use reasonable limits to avoid overwhelming the API
- Consider memory usage when collecting large datasets
- Break early when you find what you need

```typescript
// Good: Limited and efficient
for await (const post of profile.posts({ limit: 50 })) {
  if (post.title.includes('search-term')) {
    console.log('Found it!');
    break;
  }
}
```

### Error Handling

- Always wrap API calls in try-catch blocks
- Handle specific error cases appropriately
- Provide meaningful error messages to users

```typescript
try {
  await post.like();
} catch (error) {
  if (error.message.includes('429')) {
    console.error('Rate limited - please wait before trying again');
  } else {
    console.error('Failed to like post:', error.message);
  }
}
```

### Performance

- Use async iteration for large datasets
- Consider caching frequently accessed data
- Batch operations when possible

```typescript
// Efficient: Process items as they arrive
for await (const post of profile.posts()) {
  await processPost(post); // Process immediately
}

// Less efficient: Load all then process
const allPosts = [];
for await (const post of profile.posts()) {
  allPosts.push(post);
}
allPosts.forEach(processPost); // Delayed processing
```