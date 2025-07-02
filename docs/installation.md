# Installation

## Requirements

- Node.js 16 or higher  
- npm or yarn package manager
- A Substack account with publication access

## NPM Installation

You can install the package using npm:

```bash
npm install substack-api
```

## Yarn Installation

If you prefer using yarn:

```bash
yarn add substack-api
```

## TypeScript Configuration

The library is written in TypeScript and includes type definitions out of the box. No additional setup is required for TypeScript projects.

For optimal TypeScript integration, ensure your `tsconfig.json` includes:

```json
{
  "compilerOptions": {
    "esModuleInterop": true,
    "moduleResolution": "node"
  }
}
```

## Verification

To verify the installation, you can create a simple test file:

```typescript
import { SubstackClient } from 'substack-api';

const client = new SubstackClient({
  apiKey: 'your-connect-sid-cookie-value',
  hostname: 'example.substack.com'
});

async function test() {
  try {
    const isConnected = await client.testConnectivity();
    console.log('Connection status:', isConnected ? 'Connected' : 'Failed');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

test();
```

## Development Installation

If you want to contribute to the library or run it from source:

1. Clone the repository:
   ```bash
   git clone https://github.com/jakub-k-slys/substack-api.git
   cd substack-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

## Next Steps

Once installed, you can:

- Follow the [Quickstart](quickstart.md) guide to begin using the library
- Check out the [Examples](examples.md) for common use cases
- Read the [API Reference](api-reference.md) for detailed API documentation
