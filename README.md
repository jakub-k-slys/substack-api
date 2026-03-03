# Substack API

[![npm version](https://badge.fury.io/js/substack-api.svg)](https://badge.fury.io/js/substack-api)
[![Documentation Status](https://readthedocs.org/projects/substack-api/badge/?version=latest)](https://substack-api.readthedocs.io/en/latest/?badge=latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A modern, type-safe TypeScript client for the Substack API. Build newsletter automation, content management tools, and subscriber analytics with ease.

## QuickStart

```bash
pnpm add substack-api
```

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  token: '<your-bearer-token>',      // see "Authentication" below
  publicationUrl: 'https://yoursite.substack.com'
});

// Get your profile and iterate through posts
const profile = await client.ownProfile();
for await (const post of profile.posts({ limit: 5 })) {
  console.log(`"${post.title}" - ${post.publishedAt?.toLocaleDateString()}`);
}

// Test connectivity
const isConnected = await client.testConnectivity();
```

## Authentication

All requests are proxied through the [substack-gateway](https://substack-gateway.vercel.app) and authenticated with a Bearer token that encodes two Substack session cookies.

### Step 1 — Obtain your session cookies

1. Log in to [substack.com](https://substack.com) in your browser.
2. Open DevTools → Application → Cookies → `substack.com`.
3. Copy the values of **`substack.sid`** and **`connect.sid`**.

### Step 2 — Build the token

The token is a base64-encoded JSON object containing both cookies:

```typescript
const token = btoa(JSON.stringify({
  substack_sid: '<value of substack.sid cookie>',
  connect_sid:  '<value of connect.sid cookie>'
}));
```

In Node.js you can also use `Buffer`:

```typescript
const token = Buffer.from(JSON.stringify({
  substack_sid: '<value of substack.sid cookie>',
  connect_sid:  '<value of connect.sid cookie>'
})).toString('base64');
```

### Step 3 — Pass the token to the client

```typescript
const client = new SubstackClient({
  token,
  publicationUrl: 'https://yoursite.substack.com'
});
```

## Documentation

📚 **[Complete Documentation →](https://substack-api.readthedocs.io/)**

- [Installation Guide](docs/installation.md) - Setup and requirements
- [QuickStart Tutorial](docs/quickstart.md) - Get started in minutes
- [API Reference](docs/api-reference.md) - Complete method documentation
- [Entity Model](docs/entity-model.md) - Modern object-oriented API
- [Examples](docs/examples.md) - Real-world usage patterns

## License

MIT
