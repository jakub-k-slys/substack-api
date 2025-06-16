# Development

This section provides information for developers who want to contribute to the Substack API client library.

## Development Setup

### Prerequisites

* Node.js 14 or higher
* npm or yarn package manager
* Git

### Getting Started

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

## Project Structure

```text
substack-api/
├── src/
│   ├── client.ts        # Main Substack class implementation
│   ├── client.test.ts   # Tests for the client
│   ├── types.ts         # TypeScript type definitions
│   └── index.ts         # Public API exports
├── docs/
│   └── source/          # Documentation source files
├── dist/               # Compiled JavaScript files
├── package.json        # Project configuration
├── tsconfig.json      # TypeScript configuration
└── README.md          # Project overview
```

## Development Workflow

### Building

To build the project:

```bash
npm run build
```

This will:
1. Clean the dist directory
2. Compile TypeScript files
3. Generate type definitions

### Testing

Run the test suite:

```bash
npm test
```

Run tests in watch mode during development:

```bash
npm run test:watch
```

The project uses Jest for testing. Test files are located next to the files they test with a `.test.ts` suffix.

### Code Style

The project follows TypeScript best practices:

* Use explicit types where beneficial
* Document public APIs with JSDoc comments
* Follow consistent naming conventions
* Write unit tests for new functionality

### Documentation

Documentation is written in Markdown and built using Sphinx with MyST parser:

1. Install documentation dependencies:
   ```bash
   pip install sphinx sphinx-rtd-theme myst-parser
   ```

2. Build the documentation:
   ```bash
   cd docs
   make html
   ```

The built documentation will be available in `docs/build/html`.

## Contributing

### Contribution Process

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write or update tests
5. Update documentation
6. Submit a pull request

### Pull Request Guidelines

* Keep changes focused and atomic
* Follow existing code style
* Include tests for new functionality
* Update documentation as needed
* Describe your changes in the PR description

### Running Checks

Before submitting a PR, ensure:

1. All tests pass:
   ```bash
   npm test
   ```

2. TypeScript compiles without errors:
   ```bash
   npm run build
   ```

3. Documentation builds successfully:
   ```bash
   cd docs
   make html
   ```

## Release Process

1. Update version in package.json
2. Update CHANGELOG.md
3. Build the project:
   ```bash
   npm run build
   ```

4. Run tests:
   ```bash
   npm test
   ```

5. Commit changes:
   ```bash
   git add .
   git commit -m "Release v1.x.x"
   git tag v1.x.x
   git push origin main --tags
   ```

6. Publish to npm:
   ```bash
   npm publish
   ```

## Development Tips

### TypeScript Configuration

The project uses a strict TypeScript configuration. Key settings in `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "esModuleInterop": true,
    "declaration": true
  }
}
```

### Testing Tips

* Use Jest's mock capabilities for testing API calls
* Test error conditions and edge cases
* Use TypeScript in test files for better type checking

Example test structure:

```typescript
import { Substack, SubstackError } from './client';

describe('Substack', () => {
  let client: Substack;

  beforeEach(() => {
    client = new Substack();
  });

  it('should handle successful requests', async () => {
    // Test implementation
  });

  it('should handle errors', async () => {
    // Test implementation
  });
});
```

### Debugging

For debugging during development:

1. Use the `debug` npm package for logging
2. Add source maps in tsconfig.json:
   ```json
   {
     "compilerOptions": {
       "sourceMap": true
     }
   }
   ```

3. Use the VS Code debugger with the following launch configuration:
   ```json
   {
     "type": "node",
     "request": "launch",
     "name": "Debug Tests",
     "program": "${workspaceFolder}/node_modules/.bin/jest",
     "args": ["--runInBand"],
     "console": "integratedTerminal",
     "internalConsoleOptions": "neverOpen"
   }
