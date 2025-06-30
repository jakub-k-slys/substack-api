# Substack API

[![npm version](https://badge.fury.io/js/substack-api.svg)](https://badge.fury.io/js/substack-api)
[![Documentation Status](https://readthedocs.org/projects/substack-api/badge/?version=latest)](https://substack-api.readthedocs.io/en/latest/?badge=latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A TypeScript client for interacting with the Substack webservice API. This library provides a clean, type-safe interface to fetch publication details, posts, comments, and perform searches across Substack publications.

## 🚀 New Entity Model

The library now features a modern, object-oriented entity model alongside the original client:

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({ apiKey: 'your-api-key' });

// Get profiles with fluent navigation
const profile = await client.profileForSlug('example-user');
for await (const post of profile.posts({ limit: 5 })) {
  console.log(`${post.title} by ${post.author.name}`);
  
  // Navigate relationships seamlessly
  for await (const comment of post.comments({ limit: 3 })) {
    console.log(`  Comment: ${comment.body}`);
  }
}

// Test connectivity
const isConnected = await client.testConnectivity();
```

**[📖 See Entity Model Documentation](docs/entity-model.md)**

## Features

- 🏗️ **Modern Entity Model** - New object-oriented API with fluent navigation (`profile.posts()`, `post.comments()`)
- 🔄 **Async Iterators** - Seamless pagination with `for await` syntax
- 🛡️ **Type Safety** - Full TypeScript support with entity classes (Profile, Post, Note, Comment)
- 🔍 **Publication Management** - Fetch publication details and metadata
- 📝 **Post Operations** - Get posts, search by criteria, and access individual posts
- 💬 **Comment System** - Retrieve comments and comment threads
- 📄 **Smart Pagination** - Built-in pagination with configurable page sizes (default: 25)
- 🚀 **Built-in Caching** - Automatic in-memory caching with TTL for improved performance
- ⚡ **Error Handling** - Comprehensive error handling with custom error types
- 🔧 **Configurable** - Support for different API versions and custom configurations
- 🔄 **Backwards Compatible** - Original `Substack` class still available

## Quick Start

Install the package:

```bash
npm install substack-api
```

### Entity Model (Recommended)

The new entity model provides fluent navigation and modern async iterator support:

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  apiKey: 'your-api-key-here'
});

// Get a profile and iterate through posts
const profile = await client.profileForSlug('example-user');
for await (const post of profile.posts({ limit: 10 })) {
  console.log(`${post.title} by ${post.author.name}`);
}

// Test connectivity
if (await client.testConnectivity()) {
  console.log('Connected to Substack API');
}
```

### Legacy Client

The original client is still available for backwards compatibility:

```typescript
import { Substack } from 'substack-api';

// Create a client for a specific publication
const client = new Substack({
  hostname: 'example.substack.com',
  apiKey: 'your-api-key-here',
  perPage: 50, // Custom page size
  cacheTTL: 300 // Cache for 5 minutes
});

// Fetch recent posts
for await (const post of client.getPosts({ limit: 10 })) {
  console.log(`${post.title} - ${post.post_date}`);
}

// Search for posts
const results = await client.searchPosts({
  query: 'typescript',
  type: 'newsletter'
});
```

## Documentation

📚 **[Read the full documentation →](https://substack-api.readthedocs.io/)**

The documentation includes:

- **[Installation Guide](https://substack-api.readthedocs.io/en/latest/installation.html)** - Detailed installation instructions
- **[Quickstart Tutorial](https://substack-api.readthedocs.io/en/latest/quickstart.html)** - Get up and running quickly
- **[API Reference](https://substack-api.readthedocs.io/en/latest/api-reference.html)** - Complete API documentation
- **[Examples](https://substack-api.readthedocs.io/en/latest/examples.html)** - Real-world usage examples
- **[Development Guide](https://substack-api.readthedocs.io/en/latest/development.html)** - Contributing and development setup

## Testing

The project includes comprehensive testing:

- **Unit Tests**: Fast, isolated tests for individual components
- **End-to-End Tests**: Integration tests against real Substack servers

```bash
# Run unit tests
npm test

# Run E2E tests (requires API credentials)
npm run test:e2e

# Run all tests
npm run test:all
```

For E2E tests, copy `.env.example` to `.env` and add your Substack API credentials.

## License

MIT
