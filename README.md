# Substack API

A TypeScript client for interacting with the Substack webservice API.

## Installation

```bash
npm install substack-api
```

## Usage

```typescript
import { SubstackClient } from 'substack-api';

// Create a client instance
const client = new SubstackClient();

// Get publication details
const publication = await client.getPublication('example.substack.com');
console.log(publication);
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
