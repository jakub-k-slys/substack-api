# Quickstart

This guide will help you get started with the Substack API client quickly.

## Prerequisites

You'll need:
- A Substack API key for authentication
- Node.js 16+ or a modern browser environment
- TypeScript (recommended) or JavaScript

## Installation

```bash
npm install substack-api
```

## Basic Setup

First, import the library:

```typescript
import { Substack } from 'substack-api';
```

Create a client instance with your API key:

```typescript
// For a specific publication
const client = new Substack({
  hostname: 'example.substack.com',
  apiKey: 'your-api-key-here'
});

// Or use the default hostname (substack.com)
const defaultClient = new Substack({
  apiKey: 'your-api-key-here'
});
```

**Important:** Never hardcode your API key in client-side code. Use environment variables:

```typescript
const client = new Substack({
  hostname: 'example.substack.com',
  apiKey: process.env.SUBSTACK_API_KEY!
});
```

## Working with Posts

Get posts with pagination:

```typescript
// Get recent posts
const posts = await client.getPosts({
  offset: 0,
  limit: 10
});

console.log(`Found ${posts.length} posts`);
posts.forEach(post => {
  console.log(`- ${post.title} (${post.type})`);
  console.log(`  Published: ${new Date(post.post_date).toLocaleDateString()}`);
  console.log(`  Paywalled: ${post.paywalled ? 'Yes' : 'No'}`);
});
```

Get a specific post:

```typescript
const post = await client.getPost('my-awesome-post');
console.log(`Title: ${post.title}`);
console.log(`URL: ${post.canonical_url}`);
```

Search posts:

```typescript
const searchResults = await client.searchPosts({
  query: 'typescript',
  type: 'newsletter',
  limit: 10,
  published_after: '2023-01-01'
});

console.log(`Found ${searchResults.total} posts about TypeScript`);
searchResults.results.forEach(post => {
  console.log(`- ${post.title}`);
});
```

## Working with Comments

Get comments for a post:

```typescript
const comments = await client.getComments(postId, {
  offset: 0,
  limit: 20
});

comments.forEach(comment => {
  const adminFlag = comment.author.is_admin ? ' [ADMIN]' : '';
  console.log(`${comment.author.name}${adminFlag}: ${comment.body.substring(0, 100)}...`);
});
```

Get a specific comment:

```typescript
const comment = await client.getComment(commentId);
console.log(`Comment by ${comment.author.name}: ${comment.body}`);
```

## Working with Notes

Notes are short-form posts that appear in feeds, similar to social media posts.

Get your notes feed:

```typescript
const notes = await client.getNotes({ limit: 10 });

notes.items.forEach(note => {
  if (note.comment) {
    const user = note.context.users[0];
    console.log(`${user.name}: ${note.comment.body}`);
  }
});

// Check if there are more notes
if (notes.hasMore()) {
  const moreNotes = await notes.next();
  console.log(`Loaded ${moreNotes?.items.length} more notes`);
}
```

Publish a simple note:

```typescript
const response = await client.publishNote('Just discovered something amazing! 🚀');
console.log(`Note published: ${response.id}`);
```

Publish a formatted note:

```typescript
const formattedNote = await client
  .note('🎉 Big announcement!')
  .note('I just released a new ')
  .bold('TypeScript library')
  .simple(' for developers.')
  .note('Check it out! 💪')
  .publish();

console.log(`Formatted note published: ${formattedNote.id}`);
```

## Working with User Profiles

Get a user's public profile:

```typescript
const profile = await client.getPublicProfile('john-doe');
console.log(`Name: ${profile.name}`);
console.log(`Handle: @${profile.handle}`);
console.log(`Subscribers: ${profile.subscriberCountString}`);

// List their publications
profile.publicationUsers.forEach(pubUser => {
  console.log(`- ${pubUser.publication.name} (${pubUser.role})`);
});
```

Get users you follow:

```typescript
const followingIds = await client.getFollowingIds();
console.log(`You follow ${followingIds.length} users`);

const followingProfiles = await client.getFollowingProfiles();
followingProfiles.forEach(profile => {
  console.log(`${profile.name} (@${profile.handle}) - ${profile.subscriberCountString} subscribers`);
});
```

## Error Handling

The client uses a custom `SubstackError` class for API-related errors:

```typescript
import { SubstackError } from 'substack-api';

try {
  const posts = await client.getPosts({ limit: 1000 }); // This will likely fail
} catch (error) {
  if (error instanceof SubstackError) {
    console.error(`API Error: ${error.message}`);
    console.error(`Status: ${error.status}`);
    
    // Handle specific error cases
    switch (error.status) {
      case 401:
        console.error('Check your API key');
        break;
      case 404:
        console.error('Resource not found');
        break;
      case 429:
        console.error('Rate limit exceeded');
        break;
    }
  } else {
    console.error('Unexpected error:', error);
  }
}
```

## TypeScript Support

The library provides full TypeScript support with comprehensive type definitions:

```typescript
import type { 
  SubstackPublication,
  SubstackPost,
  SubstackComment,
  SubstackNote,
  SubstackConfig,
  SubstackFullProfile
} from 'substack-api';

// Type-safe configuration
const config: SubstackConfig = {
  hostname: 'example.substack.com',
  apiVersion: 'v1',
  apiKey: process.env.SUBSTACK_API_KEY!
};

// Type-safe function
async function getTypedPosts(): Promise<SubstackPost[]> {
  const client = new Substack(config);
  return client.getPosts({ limit: 10 });
}

// Type guards
function isPaywalledPost(post: SubstackPost): boolean {
  return post.paywalled === true;
}
```

## Complete Example

Here's a complete example that demonstrates several features:

```typescript
import { Substack, SubstackError } from 'substack-api';
import type { SubstackPost } from 'substack-api';

async function substackDashboard(hostname: string, apiKey: string) {
  // Create client for specific publication
  const client = new Substack({ hostname, apiKey });

  try {
    // Get recent posts with engagement
    const posts = await client.getPosts({ limit: 5 });
    console.log(`📊 Dashboard - Recent Posts (${posts.length}):\n`);
    
    for (const post of posts) {
      console.log(`\n  ${post.title}`);
      console.log(`  📅 Published: ${new Date(post.post_date).toLocaleDateString()}`);
      console.log(`  🔗 URL: ${post.canonical_url}`);
      console.log(`  🔒 Paywalled: ${post.paywalled ? 'Yes' : 'No'}`);

      // Get comment engagement
      const comments = await client.getComments(post.id, { limit: 3 });
      console.log(`  💬 Recent comments: ${comments.length}`);
      
      comments.forEach(comment => {
        const adminFlag = comment.author.is_admin ? ' [ADMIN]' : '';
        console.log(`    - ${comment.author.name}${adminFlag}: ${comment.body.substring(0, 60)}...`);
      });
    }

    // Get recent notes
    console.log(`\n📋 Recent Notes:`);
    const notes = await client.getNotes({ limit: 3 });
    notes.items.forEach(note => {
      if (note.comment) {
        const user = note.context.users[0];
        console.log(`  ${user.name}: ${note.comment.body.substring(0, 80)}...`);
      }
    });

    // Get following statistics
    const followingIds = await client.getFollowingIds();
    console.log(`\n👥 Following: ${followingIds.length} users`);

    // Publish a status update
    const statusUpdate = await client
      .note('📊 Dashboard Report')
      .note(`Published `)
      .bold(`${posts.length} posts`)
      .simple(` recently with great engagement!`)
      .note('🚀 Keep up the great work!')
      .publish();
      
    console.log(`\n✅ Status update published: ${statusUpdate.id}`);

  } catch (error) {
    if (error instanceof SubstackError) {
      console.error(`❌ API Error (${error.status}): ${error.message}`);
    } else {
      console.error('❌ Unexpected error:', error);
    }
  }
}

// Use the example (replace with your actual values)
substackDashboard('example.substack.com', process.env.SUBSTACK_API_KEY!);
```

## Environment Setup

For production use, set up your environment variables:

```bash
# .env file
SUBSTACK_API_KEY=your-api-key-here
SUBSTACK_HOSTNAME=yoursite.substack.com
```

```typescript
// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

const client = new Substack({
  hostname: process.env.SUBSTACK_HOSTNAME,
  apiKey: process.env.SUBSTACK_API_KEY!
});
```

## Next Steps

- Check out the [API Reference](api-reference.md) for detailed API documentation
- See [Examples](examples.md) for more comprehensive usage examples  
- Read about [Development](development.md) if you want to contribute
- Review the [Installation Guide](installation.md) for advanced setup options
