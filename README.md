> [!WARNING]
> This library is no longer actively developed. The current generation
> of this project is [Substack Gateway OSS](https://github.com/jakub-k-slys/substack-gateway-oss)
> — a Python REST API and MCP server that replaces this TypeScript client.
> If you are building new integrations, start there.

# Substack API

[![npm version](https://badge.fury.io/js/substack-api.svg)](https://badge.fury.io/js/substack-api)
[![Documentation Status](https://readthedocs.org/projects/substack-api/badge/?version=latest)](https://substack-api.readthedocs.io/en/latest/?badge=latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)

A modern, type-safe TypeScript client for the Substack API. Build newsletter
automation, content management tools, and subscriber analytics with ease.

## Quickstart

```bash
pnpm add substack-api
```

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  token: 'your-connect-sid-cookie-value',
  publicationUrl: 'example.substack.com'
});

const profile = await client.ownProfile();
for await (const post of profile.posts({ limit: 5 })) {
  console.log(`"${post.title}" - ${post.publishedAt?.toLocaleDateString()}`);
}

const isConnected = await client.testConnectivity();
```

## Documentation

📚 [Complete Documentation](https://substack-api.readthedocs.io/)

- [Installation Guide](docs/installation.md)
- [QuickStart Tutorial](docs/quickstart.md)
- [API Reference](docs/api-reference.md)
- [Entity Model](docs/entity-model.md)
- [Examples](docs/examples.md)

## Successor Project

This library served as the foundation for a broader ecosystem. The current
generation is [Substack Gateway OSS](https://github.com/jakub-k-slys/substack-gateway-oss)
— a language-agnostic REST API and MCP server that exposes the same
capabilities to any client, including Claude, n8n, and custom agents.

## Author

Built by [Jakub Slys](https://iam.slys.dev) — Backend Engineer building
distributed systems for telecoms, running a self-hosted Kubernetes homelab,
and building AI automation pipelines with n8n, MCP, and Claude.

This library was the first step toward automating my own Substack at
[iam.slys.dev](https://iam.slys.dev), where I write about system design,
machine learning fundamentals, and the AI tools I actually build and run
in production.

→ [iam.slys.dev](https://iam.slys.dev)

## License

MIT
