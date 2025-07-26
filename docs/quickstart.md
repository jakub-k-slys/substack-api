# Quickstart

This guide will help you get started with the Substack API client quickly using the modern entity-based API.

## Prerequisites

You'll need:
- A Substack account with publication access
- Your connect.sid cookie value for authentication  
- Node.js 16+ or a modern browser environment
- TypeScript (recommended) or JavaScript

## Installation

```bash
npm install substack-api
```

## Authentication Setup

The Substack API uses cookie-based authentication. You need to extract your `connect.sid` cookie value:

1. **Login to Substack** in your browser
2. **Open Developer Tools** (F12 or right-click → "Inspect")
3. **Go to Application/Storage tab** → Cookies → `https://substack.com`
4. **Find the `connect.sid` cookie** and copy its value
5. **Use this value** as your `apiKey` in the client configuration

## Basic Setup

Import the library and create a client:

```typescript
import { SubstackClient } from 'substack-api';

// Create client instance
const client = new SubstackClient({
  apiKey: 'your-connect-sid-cookie-value',
  hostname: 'yoursite.substack.com' // optional, defaults to 'substack.com'
});

// Test connectivity
const isConnected = await client.testConnectivity();
console.log('Connected:', isConnected);
```

**Important:** Never hardcode your cookie value in client-side code. Use environment variables:

```typescript
const client = new SubstackClient({
  apiKey: process.env.SUBSTACK_API_KEY!,
  hostname: process.env.SUBSTACK_HOSTNAME
});
```

## Working with Profiles

### Get Your Own Profile

Your authenticated profile has special capabilities for content creation:

```typescript
// Get your own profile with write capabilities
const myProfile = await client.ownProfile();
console.log(`Welcome ${myProfile.name}! (@${myProfile.slug})`);
console.log(`Followers: ${myProfile.followerCount}`);

// Iterate through your posts
for await (const post of myProfile.posts({ limit: 5 })) {
  console.log(`📄 "${post.title}" - ${post.publishedAt?.toLocaleDateString()}`);
  console.log(`  💖 ${post.reactions?.length || 0} reactions`);
}
```

### Get Other Profiles

```typescript
// Get a profile by slug/handle  
const profile = await client.profileForSlug('example-user');
console.log(`${profile.name}: ${profile.bio || 'No bio available'}`);

// Get profile by ID
const profileById = await client.profileForId(12345);

// Iterate through their recent posts
for await (const post of profile.posts({ limit: 10 })) {
  console.log(`- ${post.title} by ${post.author.name}`);
  console.log(`  Published: ${post.publishedAt?.toLocaleDateString()}`);
}
```

## Working with Posts

### Get and Navigate Posts

```typescript
// Get a specific post
const post = await client.postForId('my-awesome-post');
console.log(`Title: ${post.title}`);
console.log(`Author: ${post.author.name}`);
console.log(`Published: ${post.publishedAt?.toLocaleDateString()}`);

// Navigate to comments with async iteration
for await (const comment of post.comments({ limit: 5 })) {
  console.log(`💬 ${comment.author.name}: ${comment.body.substring(0, 100)}...`);
  console.log(`  👍 ${comment.reactions?.length || 0} reactions`);
}

// Like a post
await post.like();
console.log('Post liked!');

// Add a comment
const newComment = await post.addComment('Great insights! Thanks for sharing.');
console.log(`Comment added: ${newComment.id}`);
```

### Content Creation (OwnProfile)

Create notes and manage content through your authenticated profile:

```typescript
const myProfile = await client.ownProfile();

// Create a simple note using builder pattern
const note = await myProfile.newNote().paragraph().text('🚀 Just shipped a new feature! Excited to share what we\'ve been working on.').publish();
console.log(`Note published: ${note.id}`);

// Create a complex note with formatting
const formattedNote = await myProfile
  .newNote()
  .paragraph()
  .text('Building something amazing...')
  .paragraph()
  .bold('Key insight: ')
  .text('User feedback drives everything')
  .paragraph()
  .text('Read more: ')
  .link('our latest update', 'https://example.com')
  .publish();

console.log(`Formatted note created: ${formattedNote.id}`);
```

## Working with Notes

Notes are short-form posts, similar to social media updates:

```typescript
// Get a specific note
const note = await client.noteForId('note-123');
console.log(`Note by ${note.author.name}: ${note.body}`);

// Like a note  
await note.like();

// Add a comment to a note
await note.addComment('Interesting perspective!');

// Get your own profile's notes
const myProfile = await client.ownProfile();
for await (const note of myProfile.notes({ limit: 10 })) {
  console.log(`📝 ${note.body.substring(0, 80)}...`);
  console.log(`  💖 ${note.reactions?.length || 0} reactions`);
}
```

## Working with Comments

```typescript
// Get a specific comment
const comment = await client.commentForId('comment-456');
console.log(`Comment by ${comment.author.name}: ${comment.body}`);

// Like a comment
await comment.like();

// Navigate to the parent post
const parentPost = comment.post;
if (parentPost) {
  console.log(`Parent post: ${parentPost.title}`);
}
```

## Advanced Usage with Async Iterators

The entity model supports powerful async iteration with automatic pagination:

```typescript
// Get all posts from a profile (handles pagination automatically)
const allPosts = [];
for await (const post of profile.posts()) {
  allPosts.push(post);
  
  // Process each post
  console.log(`Processing: ${post.title}`);
  
  // You can break early if needed
  if (allPosts.length >= 50) break;
}

// Custom pagination limits
for await (const post of profile.posts({ limit: 25 })) {
  // Process in chunks of 25
  console.log(post.title);
}

// Get all comments for a post
const postComments = [];
for await (const comment of post.comments()) {
  postComments.push(comment);
}
console.log(`Total comments: ${postComments.length}`);
```

## Error Handling

Handle errors gracefully with proper error types:

```typescript
try {
  const profile = await client.ownProfile();
  console.log(`Authenticated as: ${profile.name}`);
} catch (error) {
  if (error.message.includes('401')) {
    console.error('Authentication failed - check your connect.sid cookie');
  } else if (error.message.includes('404')) {
    console.error('Resource not found');
  } else {
    console.error('Unexpected error:', error.message);
  }
}

// Handle network errors during iteration
try {
  for await (const post of profile.posts({ limit: 100 })) {
    console.log(post.title);
  }
} catch (error) {
  console.error('Error during pagination:', error.message);
}
```

## TypeScript Support

The library provides full TypeScript support with comprehensive type definitions:

```typescript
import type { 
  SubstackClient,
  Profile,
  OwnProfile, 
  Post,
  Note,
  Comment,
  SubstackConfig
} from 'substack-api';

// Type-safe configuration
const config: SubstackConfig = {
  apiKey: process.env.SUBSTACK_API_KEY!,
  hostname: 'example.substack.com'
};

// Type-safe functions
async function getProfilePosts(profile: Profile): Promise<Post[]> {
  const posts: Post[] = [];
  for await (const post of profile.posts({ limit: 10 })) {
    posts.push(post);
  }
  return posts;
}

// Type guards and assertions
function isOwnProfile(profile: Profile): profile is OwnProfile {
  return 'createPost' in profile;
}

const profile = await client.ownProfile();
if (isOwnProfile(profile)) {
  // TypeScript knows this is OwnProfile with write capabilities
  await profile.createNote({ body: 'Hello world!' });
}
```

## Complete Example

Here's a comprehensive example demonstrating multiple features:

```typescript
import { SubstackClient } from 'substack-api';

async function substackDashboard() {
  const client = new SubstackClient({
    apiKey: process.env.SUBSTACK_API_KEY!,
    hostname: 'example.substack.com'
  });

  try {
    // Test connectivity
    const isConnected = await client.testConnectivity();
    if (!isConnected) {
      throw new Error('Failed to connect to Substack API');
    }

    // Get your profile
    const myProfile = await client.ownProfile();
    console.log(`📊 Dashboard for ${myProfile.name} (@${myProfile.slug})`);
    console.log(`👥 Followers: ${myProfile.followerCount}`);

    // Get recent posts with engagement
    console.log(`\n📄 Recent Posts:`);
    for await (const post of myProfile.posts({ limit: 5 })) {
      console.log(`\n  "${post.title}"`);
      console.log(`  📅 ${post.publishedAt?.toLocaleDateString()}`);
      console.log(`  💖 ${post.reactions?.length || 0} reactions`);

      // Get recent comments
      const comments = [];
      for await (const comment of post.comments({ limit: 3 })) {
        comments.push(comment);
      }
      console.log(`  💬 ${comments.length} recent comments`);
    }

    // Get and interact with other profiles
    console.log(`\n👥 Community Interaction:`);
    const otherProfile = await client.profileForSlug('interesting-writer');
    console.log(`Found profile: ${otherProfile.name}`);

    // Like their recent post
    for await (const post of otherProfile.posts({ limit: 1 })) {
      await post.like();
      console.log(`Liked: "${post.title}"`);
      
      // Add a supportive comment
      await post.addComment('Great insights! Thanks for sharing.');
      console.log(`Added comment to: "${post.title}"`);
      break;
    }

    // Create a status update
    const statusNote = await myProfile.createNote({
      body: '🚀 Just published some new content! Exciting times ahead.'
    });
    console.log(`\n📝 Status update published: ${statusNote.id}`);

  } catch (error) {
    console.error('❌ Dashboard error:', error.message);
  }
}

// Run the dashboard
substackDashboard();
```

## Environment Setup

For production use, set up your environment variables:

```bash
# .env file
SUBSTACK_API_KEY=your-connect-sid-cookie-value
SUBSTACK_HOSTNAME=yoursite.substack.com
```

```typescript
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const client = new SubstackClient({
  apiKey: process.env.SUBSTACK_API_KEY!,
  hostname: process.env.SUBSTACK_HOSTNAME
});
```

## Next Steps

- Check out the [API Reference](api-reference.md) for detailed method documentation
- See [Entity Model](entity-model.md) for comprehensive entity documentation
- Review [Examples](examples.md) for more usage patterns  
- Read about [Development](development.md) if you want to contribute
