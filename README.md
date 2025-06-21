# Substack API

[![npm version](https://badge.fury.io/js/substack-api.svg)](https://badge.fury.io/js/substack-api)
[![Documentation Status](https://readthedocs.org/projects/substack-api/badge/?version=latest)](https://substack-api.readthedocs.io/en/latest/?badge=latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A TypeScript client for interacting with the Substack webservice API. This library provides a clean, type-safe interface to fetch publication details, posts, comments, and perform searches across Substack publications.

## Features

- 🔍 **Publication Management** - Fetch publication details and metadata
- 📝 **Post Operations** - Get posts, search by criteria, and access individual posts
- 💬 **Comment System** - Retrieve comments and comment threads
- 📄 **Pagination Support** - Built-in pagination for all list operations
- 🛡️ **TypeScript First** - Full type safety with comprehensive type definitions
- ⚡ **Error Handling** - Comprehensive error handling with custom error types
- 🔧 **Configurable** - Support for different API versions and custom configurations

## Quick Start

Install the package:

```bash
npm install substack-api
```

Basic usage:

```typescript
import { Substack } from 'substack-api';

// Create a client for a specific publication
const client = new Substack({
  hostname: 'example.substack.com'
});

// Fetch recent posts
const posts = await client.getPosts({ limit: 5 });

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
