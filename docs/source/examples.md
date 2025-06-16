# Examples

This section provides practical examples of using the Substack API client in various scenarios.

## Basic Usage

### Initialize the Client

```typescript
import { Substack } from 'substack-api';

// For a specific publication
const client = new Substack({
  hostname: 'example.substack.com'
});

// Or use default
const defaultClient = new Substack();
```

## Publication Examples

### Get Publication Details

```typescript
async function getPublicationInfo() {
  try {
    // Get details for configured publication
    const publication = await client.getPublication();
    console.log('Publication:', publication.name);
    console.log('Description:', publication.description);
    
    // Get details for another publication
    const other = await client.getPublication('other.substack.com');
    console.log('Other publication:', other.name);
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

## Post Management Examples

### List Recent Posts

```typescript
async function listRecentPosts() {
  try {
    const posts = await client.getPosts({
      limit: 10
    });
    
    posts.forEach(post => {
      console.log(`${post.title} - ${post.post_date}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Search Posts by Date Range

```typescript
async function searchPostsByDate() {
  try {
    const results = await client.searchPosts({
      query: '',  // empty query to match all posts
      published_after: '2023-01-01',
      published_before: '2023-12-31',
      limit: 20
    });
    
    console.log(`Found ${results.total} posts`);
    results.results.forEach(post => {
      console.log(`${post.title} - ${post.post_date}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

### Get Post with Comments

```typescript
async function getPostWithComments(slug: string) {
  try {
    // Get the post
    const post = await client.getPost(slug);
    console.log('Post:', post.title);
    
    // Get comments for the post
    const comments = await client.getComments(post.id, {
      limit: 10
    });
    
    console.log('Recent comments:');
    comments.forEach(comment => {
      console.log(`${comment.author.name}: ${comment.body}`);
    });
  } catch (error) {
    console.error('Error:', error.message);
  }
}
```

## Advanced Examples

### Paginated Post Search

```typescript
async function searchAllPosts(query: string) {
  const pageSize = 20;
  let offset = 0;
  const allResults: SubstackPost[] = [];
  
  try {
    while (true) {
      const results = await client.searchPosts({
        query,
        offset,
        limit: pageSize
      });
      
      allResults.push(...results.results);
      
      if (results.results.length < pageSize) {
        break;  // No more results
      }
      
      offset += pageSize;
    }
    
    console.log(`Found ${allResults.length} total posts`);
    return allResults;
  } catch (error) {
    console.error('Error:', error.message);
    return allResults;
  }
}
```

### Error Handling

```typescript
async function robustPublicationFetch(hostname: string) {
  try {
    const publication = await client.getPublication(hostname);
    return publication;
  } catch (error) {
    if (error instanceof SubstackError) {
      switch (error.status) {
        case 404:
          console.error(`Publication ${hostname} not found`);
          break;
        case 429:
          console.error('Rate limit exceeded. Try again later.');
          break;
        default:
          console.error(`API Error (${error.status}): ${error.message}`);
      }
    } else {
      console.error('Unexpected error:', error);
    }
    return null;
  }
}
```

### TypeScript Integration

```typescript
import type {
  SubstackPublication,
  SubstackPost,
  SubstackComment,
  SubstackConfig,
  PaginationParams,
  SearchParams
} from 'substack-api';

// Type-safe configuration
const config: SubstackConfig = {
  hostname: 'example.substack.com',
  apiVersion: 'v1'
};

// Type-safe search parameters
const searchParams: SearchParams = {
  query: 'typescript',
  type: 'newsletter',
  limit: 10
};

// Type-safe function implementation
async function getLatestPosts(params: PaginationParams): Promise<SubstackPost[]> {
  const client = new Substack(config);
  return client.getPosts(params);
}
```

These examples demonstrate common usage patterns and best practices when working with the Substack API client. For more detailed information about specific methods and types, refer to the [API Reference](api-reference.md) section.
