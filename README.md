# Substack API

[![npm version](https://badge.fury.io/js/substack-api.svg)](https://badge.fury.io/js/substack-api)
[![Build & Test](https://github.com/jakub-k-slys/substack-api/workflows/Build%20&%20Test/badge.svg)](https://github.com/jakub-k-slys/substack-api/actions)
[![Documentation Status](https://readthedocs.org/projects/substack-api/badge/?version=latest)](https://substack-api.readthedocs.io/en/latest/?badge=latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

**A modern, type-safe TypeScript client for the Substack API.** Perfect for developers building newsletter automation, content management tools, subscriber analytics, or custom publishing workflows. Whether you're creating automated content distribution, building subscriber dashboards, or integrating Substack with your existing systems, this library provides everything you need.

**✨ Who it's for:**
- **Content Creators** building automation around their Substack publications
- **Developers** integrating Substack into larger applications
- **Data Analysts** creating subscriber and engagement analytics
- **Marketing Teams** building custom newsletter management tools

## Installation

Install the package via npm:

```bash
npm install substack-api
```

## Hello World

Get started in just a few lines:

```typescript
import { SubstackClient } from 'substack-api';

// Initialize client with your API key (cookie-based authentication)
const client = new SubstackClient({
  apiKey: 'your-connect-sid-cookie-value',  // Your connect.sid cookie value
  hostname: 'example.substack.com'          // Your publication hostname
});

// Get your profile and latest posts
const profile = await client.ownProfile();
console.log(`👋 Hello ${profile.name}!`);

// Iterate through your recent posts with modern async syntax
for await (const post of profile.posts({ limit: 3 })) {
  console.log(`📄 "${post.title}" - ${post.publishedAt?.toLocaleDateString()}`);
}
```

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

## 🚀 Key Features

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
- 🔐 **Authentication** - Secure API key-based authentication

## Authentication Setup

This library uses **cookie-based authentication** with your Substack `connect.sid` cookie value.

### Getting Your API Key

1. **Log into Substack** in your browser
2. **Open Developer Tools** (F12 or right-click → Inspect)
3. **Go to Application/Storage tab** → Cookies
4. **Find your publication's domain** (e.g., `yourname.substack.com`)
5. **Copy the `connect.sid` cookie value** - this is your API key

### Client Initialization

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  apiKey: 'your-connect-sid-cookie-value',  // Required: Your connect.sid cookie
  hostname: 'example.substack.com',         // Required: Your publication hostname
  perPage: 25,                             // Optional: Items per page (default: 25)
  cacheTTL: 300                            // Optional: Cache TTL in seconds (default: 300)
});

// Test your connection
if (await client.testConnectivity()) {
  console.log('✅ Successfully connected to Substack API');
} else {
  console.log('❌ Connection failed - check your credentials');
}
```

### Environment Variables

For production use, store credentials in environment variables:

```bash
# .env file
SUBSTACK_API_KEY=your-connect-sid-cookie-value
SUBSTACK_HOSTNAME=yourname.substack.com
```

```typescript
import { SubstackClient } from 'substack-api';
import { config } from 'dotenv';

config(); // Load .env file

const client = new SubstackClient({
  apiKey: process.env.SUBSTACK_API_KEY!,
  hostname: process.env.SUBSTACK_HOSTNAME!
});
```

## API Methods Reference

### Profile Methods

#### Get Your Own Profile
```typescript
const profile = await client.ownProfile();
console.log(`Name: ${profile.name}, Handle: @${profile.slug}`);

// OwnProfile has additional write capabilities
await profile.createPost({
  title: 'My New Post',
  body: 'Post content here',
  isDraft: false
});

await profile.createNote({
  body: 'Quick note content',
  formatting: [{ start: 0, end: 5, type: 'bold' }]
});

// Get users you follow
for await (const followee of profile.followees({ limit: 10 })) {
  console.log(`Following: ${followee.name}`);
}
```

#### Get Profile by ID
```typescript
const profile = await client.profileForId(12345);
```

#### Get Profile by Slug/Handle
```typescript
const profile = await client.profileForSlug('example-user');
```

### Content Methods

#### Get Post by ID
```typescript
const post = await client.postForId(98765);
console.log(`Title: ${post.title}, Author: ${post.author.name}`);

// Interact with the post
await post.like();                    // Like the post
await post.addComment('Great post!'); // Add a comment

// Get comments
for await (const comment of post.comments({ limit: 5 })) {
  console.log(`💬 ${comment.author.name}: ${comment.body}`);
}
```

#### Get Note by ID
```typescript
const note = await client.noteForId(45678);
console.log(`Note: ${note.body}, Author: ${note.author.name}`);

// Interact with the note
await note.like();                      // Like the note  
await note.addComment('Nice insight!'); // Add a comment

// Get comments
for await (const comment of note.comments({ limit: 3 })) {
  console.log(`💬 ${comment.author.name}: ${comment.body}`);
}
```

#### Get Comment by ID
```typescript
const comment = await client.commentForId(23456);
console.log(`Comment: ${comment.body}, Author: ${comment.author.name}`);
```

### Utility Methods

#### Test Connectivity
```typescript
const isConnected = await client.testConnectivity();
console.log(isConnected ? 'Connected' : 'Connection failed');
```

## Working with Entities

### Profile Entity

The `Profile` class represents a Substack user profile:

```typescript
const profile = await client.profileForSlug('example-user');

// Profile properties
console.log(profile.name);        // Full name
console.log(profile.slug);        // Handle/username  
console.log(profile.bio);         // Bio description
console.log(profile.url);         // Profile URL
console.log(profile.avatarUrl);   // Avatar image URL

// Navigate to related content
for await (const post of profile.posts({ limit: 10 })) {
  console.log(`📄 ${post.title}`);
}

for await (const note of profile.notes({ limit: 5 })) {
  console.log(`📝 ${note.body.substring(0, 100)}...`);
}
```

### Post Entity

The `Post` class represents a Substack post:

```typescript
const post = await client.postForId(12345);

// Post properties
console.log(post.title);          // Post title
console.log(post.body);           // Post content/body
console.log(post.publishedAt);    // Publication date
console.log(post.author);         // Author profile
console.log(post.url);            // Post URL
console.log(post.isPaywalled);    // Paywall status

// Navigate to comments
for await (const comment of post.comments({ limit: 10 })) {
  console.log(`💬 ${comment.author.name}: ${comment.body}`);
}
```

### Note Entity

The `Note` class represents a Substack note (short-form content):

```typescript
const note = await client.noteForId(67890);

// Note properties
console.log(note.body);           // Note content
console.log(note.publishedAt);    // Publication date
console.log(note.author);         // Author profile
console.log(note.url);            // Note URL

// Navigate to comments
for await (const comment of note.comments({ limit: 5 })) {
  console.log(`💬 ${comment.author.name}: ${comment.body}`);
}
```

### Comment Entity

The `Comment` class represents a comment on posts or notes:

```typescript
const comment = await client.commentForId(23456);

// Comment properties
console.log(comment.body);        // Comment content
console.log(comment.publishedAt); // Comment date
console.log(comment.author);      // Comment author
console.log(comment.url);         // Comment URL
```

## Async Iterators & Pagination

This library uses modern **async iterators** for seamless pagination. No need to manage page tokens or offsets manually!

### Basic Iteration

```typescript
// Iterate through all posts (automatically handles pagination)
for await (const post of profile.posts()) {
  console.log(post.title);
}

// Limit the number of items
for await (const post of profile.posts({ limit: 10 })) {
  console.log(post.title);
}
```

### Collecting Results

```typescript
// Collect results into an array
const recentPosts = [];
for await (const post of profile.posts({ limit: 5 })) {
  recentPosts.push(post);
}
console.log(`Found ${recentPosts.length} recent posts`);

// Or use Array.fromAsync (Node.js 22+)
const posts = await Array.fromAsync(profile.posts({ limit: 5 }));
```

### Pagination Configuration

The client uses configurable page sizes for optimal performance:

```typescript
const client = new SubstackClient({
  apiKey: 'your-api-key',
  perPage: 50  // Fetch 50 items per API request (default: 25)
});
```

**How it works:**
- Default `perPage`: 25 items per API request
- Iterator automatically fetches next pages as needed
- `limit` parameter controls total items returned across all pages
- Intelligent request sizing when limits are smaller than page size

## Caching Mechanism

The client includes **automatic in-memory caching** for improved performance:

### Default Behavior

```typescript
const client = new SubstackClient({
  apiKey: 'your-api-key',
  cacheTTL: 300  // Cache responses for 5 minutes (default)
});

// First call hits the API
const profile1 = await client.profileForId(12345);

// Second call returns cached result (within 5 minutes)
const profile2 = await client.profileForId(12345);
```

### Cache Benefits

- **Reduced API calls** for repeated requests
- **Faster response times** for cached data  
- **Automatic expiration** via TTL (Time To Live)
- **Memory-only storage** - no external dependencies

### Customizing Cache

```typescript
const client = new SubstackClient({
  apiKey: 'your-api-key',
  cacheTTL: 600  // Cache for 10 minutes
});

// Disable caching by setting TTL to 0
const noCacheClient = new SubstackClient({
  apiKey: 'your-api-key', 
  cacheTTL: 0
});
```

**Cache Behavior:**
- Only caches `GET` requests (read-only operations)
- Uses request URL and method as cache keys
- Cache is per-client instance
- Cache doesn't persist across application restarts

## Error Handling

The library provides comprehensive error handling with custom error types:

```typescript
import { SubstackClient } from 'substack-api';

try {
  const client = new SubstackClient({
    apiKey: 'your-api-key',
    hostname: 'example.substack.com'
  });
  
  const profile = await client.ownProfile();
  console.log(`Welcome ${profile.name}!`);
  
} catch (error) {
  // Handle specific HTTP errors
  if (error.message.includes('401')) {
    console.error('❌ Authentication failed - check your API key');
  } else if (error.message.includes('404')) {
    console.error('❌ Resource not found');
  } else if (error.message.includes('429')) {
    console.error('❌ Rate limit exceeded - try again later');
  } else {
    console.error('❌ Unexpected error:', error.message);
  }
}
```

### Common Error Scenarios

- **401 Unauthorized**: Invalid API key or expired session
- **404 Not Found**: Resource doesn't exist or insufficient permissions  
- **429 Too Many Requests**: Rate limit exceeded
- **Network errors**: Connection issues or timeouts

### Best Practices

```typescript
// Always test connectivity first
const client = new SubstackClient({ apiKey: 'your-key' });

if (!(await client.testConnectivity())) {
  throw new Error('Failed to connect to Substack API');
}

// Handle async iterator errors
try {
  for await (const post of profile.posts({ limit: 10 })) {
    console.log(post.title);
  }
} catch (error) {
  console.error('Error fetching posts:', error.message);
}
```

## Documentation

📚 **[Read the full documentation →](https://substack-api.readthedocs.io/)**

The documentation includes:

- **[Installation Guide](https://substack-api.readthedocs.io/en/latest/installation.html)** - Detailed installation instructions
- **[Quickstart Tutorial](https://substack-api.readthedocs.io/en/latest/quickstart.html)** - Get up and running quickly
- **[API Reference](https://substack-api.readthedocs.io/en/latest/api-reference.html)** - Complete API documentation
- **[Examples](https://substack-api.readthedocs.io/en/latest/examples.html)** - Real-world usage examples
- **[Development Guide](https://substack-api.readthedocs.io/en/latest/development.html)** - Contributing and development setup

## Testing Strategy

The project uses a comprehensive **3-tier testing approach**:

### 1. Unit Tests (`npm run test:unit`)
- **Fast, isolated tests** for individual components  
- **Mock external dependencies** to test logic in isolation
- **High coverage** of core functionality
- **Run automatically** in CI/CD pipeline

```bash
npm run test:unit
```

### 2. Integration Tests (`npm run test:integration`)
- **Test component interactions** without external API calls
- **Use test data fixtures** for realistic scenarios
- **Validate data transformation** and entity relationships
- **Safe to run** without API credentials

```bash
npm run test:integration
```

### 3. End-to-End Tests (`npm run test:e2e`)
- **Real API integration** with live Substack servers
- **Requires API credentials** (`.env` file setup)
- **Validates complete workflows** from authentication to data retrieval
- **Conditionally skipped** when credentials unavailable

```bash
# Copy environment template
cp .env.example .env

# Add your credentials to .env
SUBSTACK_API_KEY=your-connect-sid-cookie-value
SUBSTACK_HOSTNAME=yourname.substack.com

# Run E2E tests
npm run test:e2e
```

### Running All Tests

```bash
# Run all test types
npm test

# Run with watch mode
npm run test:watch
```

### Test Structure

```
tests/
├── unit/           # Unit tests with mocks
├── integration/    # Integration tests with fixtures  
└── e2e/           # End-to-end tests with real API
    ├── README.md  # E2E test documentation
    └── setup.ts   # Test environment setup
```

**Sample Test Data**: Integration tests use sample data located in `tests/integration/fixtures/` to simulate real API responses without making actual API calls.

**E2E Test Requirements**: E2E tests require valid Substack API credentials and will automatically skip if credentials are unavailable.

## Getting Started

### 🚀 Quick Setup

1. **Install the library**:
   ```bash
   npm install substack-api
   ```

2. **Get your API credentials** (see [Authentication Setup](#authentication-setup))

3. **Try the sample app**:
   ```bash
   # Clone the repository
   git clone https://github.com/jakub-k-slys/substack-api.git
   cd substack-api
   
   # Install dependencies
   npm install
   
   # Set up environment
   cp .env.example .env
   # Edit .env with your credentials
   
   # Run the sample
   npm run sample
   ```

### 📁 Sample Applications

The [`samples/`](./samples) directory contains complete example applications:

- **[`samples/index.ts`](./samples/index.ts)** - Comprehensive example showing profile management, content fetching, and relationship navigation
- **Interactive examples** with error handling and user prompts
- **Real-world usage patterns** for common integration scenarios

### 🛠️ Development Environment

For quick development setup, use GitHub Codespaces with the included devcontainer:

1. **Click "Code" → "Open with Codespaces"** on the repository page
2. **Wait for environment setup** (automatic dependency installation)
3. **Start coding immediately** with full TypeScript support

The devcontainer includes:
- Node.js and npm pre-installed
- TypeScript and development tools configured
- Extensions for optimal development experience
- Environment ready for testing and building

## Documentation

📚 **[Read the full documentation →](https://substack-api.readthedocs.io/)**

The documentation includes:

- **[Installation Guide](https://substack-api.readthedocs.io/en/latest/installation.html)** - Detailed installation instructions
- **[Quickstart Tutorial](https://substack-api.readthedocs.io/en/latest/quickstart.html)** - Get up and running quickly
- **[API Reference](https://substack-api.readthedocs.io/en/latest/api-reference.html)** - Complete API documentation
- **[Examples](https://substack-api.readthedocs.io/en/latest/examples.html)** - Real-world usage examples
- **[Development Guide](https://substack-api.readthedocs.io/en/latest/development.html)** - Contributing and development setup

## Community & Support

- **🐛 Found a bug?** [Open an issue](https://github.com/jakub-k-slys/substack-api/issues/new)
- **💡 Have a feature request?** [Start a discussion](https://github.com/jakub-k-slys/substack-api/discussions)
- **❓ Need help?** [Ask in GitHub Discussions](https://github.com/jakub-k-slys/substack-api/discussions)
- **📖 Want to contribute?** See our [Contributing Guide](./CONTRIBUTING.md)

## License

MIT - see [LICENSE](./LICENSE) file for details.

---

**Made with ❤️ for the Substack community**
