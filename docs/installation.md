# Installation

## Requirements

- Node.js 18 or higher
- A Substack account with both `substack.sid` and `connect.sid` session cookies

## Install

```bash
npm install substack-api
```

```bash
yarn add substack-api
```

```bash
pnpm add substack-api
```

## TypeScript Configuration

The library ships with TypeScript definitions. For optimal integration, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

## Verify Installation

```typescript
import { SubstackClient } from 'substack-api';

const token = btoa(JSON.stringify({
  substack_sid: process.env.SUBSTACK_SID!,
  connect_sid: process.env.CONNECT_SID!
}));

const client = new SubstackClient({
  publicationUrl: 'yourname.substack.com',
  token
});

const isConnected = await client.testConnectivity();
console.log('Connected:', isConnected);
```

## Development Installation

To contribute or run from source:

```bash
git clone https://github.com/jakub-k-slys/substack-api.git
cd substack-api
pnpm install
pnpm build
pnpm test
```

## Next Steps

- [Quickstart](quickstart.md) — authenticate and make your first API call
- [API Reference](api-reference.md) — complete method documentation
