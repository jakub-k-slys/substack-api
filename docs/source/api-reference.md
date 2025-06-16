# API Reference

This section provides detailed documentation for all classes, methods, and types available in the Substack API client.

## Substack Class

The main class for interacting with the Substack API.

### Constructor

```typescript
new Substack(config?: SubstackConfig)
```

**Parameters:**
- `config` (optional): Configuration object
  - `hostname`: The publication's hostname (e.g., 'example.substack.com')
  - `apiVersion`: API version to use (default: 'v1')

### Methods

#### getPublication

```typescript
getPublication(hostname?: string): Promise<SubstackPublication>
```

Get publication details.

**Parameters:**
- `hostname` (optional): The publication's hostname. If not provided, uses the configured hostname.

**Returns:**
- Promise resolving to a `SubstackPublication` object

#### getPosts

```typescript
getPosts(params?: PaginationParams): Promise<SubstackPost[]>
```

Get posts for the publication.

**Parameters:**
- `params` (optional): Pagination parameters
  - `offset`: Number of items to skip
  - `limit`: Maximum number of items to return

**Returns:**
- Promise resolving to an array of `SubstackPost` objects

#### getPost

```typescript
getPost(slug: string): Promise<SubstackPost>
```

Get a specific post by its slug.

**Parameters:**
- `slug`: The post's slug

**Returns:**
- Promise resolving to a `SubstackPost` object

#### searchPosts

```typescript
searchPosts(params: SearchParams): Promise<SubstackSearchResult>
```

Search posts with various filters.

**Parameters:**
- `params`: Search parameters
  - `query`: Search query string
  - `type` (optional): Post type ('newsletter' | 'podcast' | 'thread')
  - `published_before` (optional): ISO date string
  - `published_after` (optional): ISO date string
  - `offset` (optional): Number of items to skip
  - `limit` (optional): Maximum number of items to return

**Returns:**
- Promise resolving to a `SubstackSearchResult` object

#### getComments

```typescript
getComments(postId: number, params?: PaginationParams): Promise<SubstackComment[]>
```

Get comments for a specific post.

**Parameters:**
- `postId`: The post's ID
- `params` (optional): Pagination parameters
  - `offset`: Number of items to skip
  - `limit`: Maximum number of items to return

**Returns:**
- Promise resolving to an array of `SubstackComment` objects

#### getComment

```typescript
getComment(commentId: number): Promise<SubstackComment>
```

Get a specific comment by its ID.

**Parameters:**
- `commentId`: The comment's ID

**Returns:**
- Promise resolving to a `SubstackComment` object

## Types

### SubstackConfig

```typescript
interface SubstackConfig {
  hostname?: string;
  apiVersion?: string;
}
```

Configuration options for the Substack client.

### SubstackPublication

```typescript
interface SubstackPublication {
  name: string;
  hostname: string;
  subdomain: string;
  logo?: {
    url: string;
  };
  description?: string;
}
```

Represents a Substack publication.

### SubstackPost

```typescript
interface SubstackPost {
  id: number;
  title: string;
  subtitle?: string;
  slug: string;
  post_date: string;
  description?: string;
  audience?: string;
  canonical_url: string;
  cover_image?: string;
  podcast_url?: string;
  type: 'newsletter' | 'podcast' | 'thread';
  published: boolean;
  paywalled: boolean;
}
```

Represents a post on Substack.

### SubstackComment

```typescript
interface SubstackComment {
  id: number;
  body: string;
  created_at: string;
  parent_post_id: number;
  author: {
    id: number;
    name: string;
    is_admin?: boolean;
  };
}
```

Represents a comment on a Substack post.

### SubstackSearchResult

```typescript
interface SubstackSearchResult {
  total: number;
  results: SubstackPost[];
}
```

Represents search results for posts.

### PaginationParams

```typescript
interface PaginationParams {
  offset?: number;
  limit?: number;
}
```

Parameters for paginated requests.

### SearchParams

```typescript
interface SearchParams extends PaginationParams {
  query: string;
  published_before?: string;
  published_after?: string;
  type?: 'newsletter' | 'podcast' | 'thread';
}
```

Parameters for searching posts.

## Errors

### SubstackError

```typescript
class SubstackError extends Error {
  constructor(
    message: string,
    public readonly status?: number,
    public readonly response?: Response
  )
}
```

Custom error class for API-related errors.

**Properties:**
- `message`: Error message
- `status`: HTTP status code (if available)
- `response`: Original Response object (if available)
