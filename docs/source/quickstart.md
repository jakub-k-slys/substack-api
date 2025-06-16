# Quickstart

This guide will help you get started with the Substack API client quickly.

## Basic Setup

First, import the library:

```typescript
import { Substack } from 'substack-api';
```

Create a client instance:

```typescript
// For a specific publication
const client = new Substack({
  hostname: 'example.substack.com'
});

// Or use the default client
const defaultClient = new Substack();
```

## Working with Publications

Get publication details:

```typescript
// Get details for your configured publication
const publication = await client.getPublication();

// Or get details for another publication
const otherPublication = await client.getPublication('other.substack.com');
```

## Working with Posts

Get all posts:

```typescript
// Get posts with pagination
const posts = await client.getPosts({
  offset: 0,
  limit: 10
});
```

Get a specific post:

```typescript
const post = await client.getPost('post-slug');
```

Search posts:

```typescript
const searchResults = await client.searchPosts({
  query: 'typescript',
  type: 'newsletter',
  limit: 10,
  published_after: '2023-01-01',
  published_before: '2023-12-31'
});
```

## Working with Comments

Get comments for a post:

```typescript
const comments = await client.getComments(postId, {
  offset: 0,
  limit: 20
});
```

Get a specific comment:

```typescript
const comment = await client.getComment(commentId);
```

## Error Handling

The client uses a custom `SubstackError` class for error handling:

```typescript
try {
  const publication = await client.getPublication('nonexistent.substack.com');
} catch (error) {
  if (error instanceof SubstackError) {
    console.error(`API Error: ${error.message}`);
    console.error(`Status: ${error.status}`);
  }
}
```

## TypeScript Support

The library provides full TypeScript support. You can use type annotations for better IDE integration:

```typescript
import type { 
  SubstackPublication,
  SubstackPost,
  SubstackComment,
  SubstackConfig
} from 'substack-api';

const config: SubstackConfig = {
  hostname: 'example.substack.com',
  apiVersion: 'v1'
};

const client = new Substack(config);
```

## Complete Example

Here's a complete example that demonstrates several features:

```typescript
import { Substack, SubstackError } from 'substack-api';
import type { SubstackPost } from 'substack-api';

async function listRecentPosts(hostname: string) {
  // Create client for specific publication
  const client = new Substack({ hostname });

  try {
    // Get publication details
    const publication = await client.getPublication();
    console.log(`Fetching posts from: ${publication.name}`);

    // Get recent posts
    const posts = await client.getPosts({
      limit: 5
    });

    // Print post details
    for (const post of posts) {
      console.log(`\nPost: ${post.title}`);
      console.log(`Date: ${post.post_date}`);
      console.log(`URL: ${post.canonical_url}`);

      // Get comments for the post
      const comments = await client.getComments(post.id, {
        limit: 3
      });

      console.log(`Recent comments: ${comments.length}`);
      comments.forEach(comment => {
        console.log(`- ${comment.author.name}: ${comment.body}`);
      });
    }
  } catch (error) {
    if (error instanceof SubstackError) {
      console.error(`API Error (${error.status}): ${error.message}`);
    } else {
      console.error('Unexpected error:', error);
    }
  }
}

// Use the example
listRecentPosts('example.substack.com');
```

## Next Steps

- Check out the [API Reference](api-reference.md) for detailed API documentation
- See [Examples](examples.md) for more usage examples
- Read about [Development](development.md) if you want to contribute
