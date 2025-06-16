# Substack API

A TypeScript client for interacting with the Substack webservice API. This client provides a simple interface to interact with Substack publications, posts, and comments.

[![Documentation Status](https://readthedocs.org/projects/substack-api/badge/?version=latest)](https://substack-api.readthedocs.io/en/latest/?badge=latest)

## Documentation

Full documentation is available at [substack-api.readthedocs.io](https://substack-api.readthedocs.io/).

The documentation includes:
- Detailed API reference
- Getting started guide
- Examples and use cases
- Development guide
- Changelog

To build the documentation locally:

```bash
# Install Sphinx and theme
pip install sphinx sphinx-rtd-theme myst-parser

# Build the docs
cd docs
make html
```

The built documentation will be available in `docs/build/html`.

## Installation

```bash
npm install substack-api
```

## Usage

```typescript
import { Substack } from 'substack-api';

// Create a client instance for a specific publication
const client = new Substack({
  hostname: 'example.substack.com'
});

// Or use the default client
const defaultClient = new Substack();
```

### Getting Publication Details

```typescript
// Get details for a specific publication
const publication = await client.getPublication();

// Or get details for another publication
const otherPublication = await client.getPublication('other.substack.com');
```

### Working with Posts

```typescript
// Get all posts (with pagination)
const posts = await client.getPosts({
  offset: 0,
  limit: 10
});

// Get a specific post by slug
const post = await client.getPost('post-slug');

// Search posts
const searchResults = await client.searchPosts({
  query: 'typescript',
  type: 'newsletter',
  limit: 10,
  published_after: '2023-01-01',
  published_before: '2023-12-31'
});
```

### Working with Comments

```typescript
// Get comments for a post
const comments = await client.getComments(postId, {
  offset: 0,
  limit: 20
});

// Get a specific comment
const comment = await client.getComment(commentId);
```

### Error Handling

The client throws `SubstackError` for API-related errors:

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

## API Reference

### Substack

#### Constructor Options

```typescript
interface SubstackConfig {
  hostname?: string;      // The publication's hostname (e.g., 'example.substack.com')
  apiVersion?: string;    // API version to use (default: 'v1')
}
```

#### Methods

- `getPublication(hostname?: string): Promise<SubstackPublication>`
  - Get publication details
  - Optional hostname parameter to get details for another publication

- `getPosts(params?: PaginationParams): Promise<SubstackPost[]>`
  - Get posts for the publication
  - Supports pagination with offset and limit

- `getPost(slug: string): Promise<SubstackPost>`
  - Get a specific post by its slug

- `searchPosts(params: SearchParams): Promise<SubstackSearchResult>`
  - Search posts with various filters
  - Supports pagination, date ranges, and post types

- `getComments(postId: number, params?: PaginationParams): Promise<SubstackComment[]>`
  - Get comments for a specific post
  - Supports pagination

- `getComment(commentId: number): Promise<SubstackComment>`
  - Get a specific comment by ID

### Types

```typescript
interface PaginationParams {
  offset?: number;
  limit?: number;
}

interface SearchParams extends PaginationParams {
  query: string;
  published_before?: string;
  published_after?: string;
  type?: 'newsletter' | 'podcast' | 'thread';
}

interface SubstackPublication {
  name: string;
  hostname: string;
  subdomain: string;
  logo?: {
    url: string;
  };
  description?: string;
}

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

## Development

### Setup

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build the package
npm run build
```

### Testing

The project uses Jest for testing. Run the test suite with:

```bash
npm test
```

Or in watch mode:

```bash
npm run test:watch
```

### Building

To build the package:

```bash
npm run build
```

This will create the compiled JavaScript files in the `dist` directory.

## Publishing

Before publishing, make sure to:

1. Update the version in `package.json`
2. Run tests: `npm test`
3. Build the package: `npm run build`
4. Publish to npm: `npm publish`

## License

MIT
