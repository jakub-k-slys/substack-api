# Development

This guide is for developers who want to contribute to the Substack API client library or understand its internal architecture.

## Development Setup

### Prerequisites

* Node.js 16 or higher
* npm or yarn package manager  
* Git
* A Substack account for testing

### Getting Started

#### Option 1: Dev Container (Recommended)

For the most consistent development experience, use the provided dev container configuration:

**GitHub Codespaces:**
1. Click the "Code" button in the GitHub repository
2. Select "Codespaces" tab  
3. Click "Create codespace on main"
4. Dependencies will be installed automatically

**VS Code Remote - Containers:**
1. Install the "Remote - Containers" extension in VS Code
2. Clone the repository locally
3. Open in VS Code and click "Reopen in Container" when prompted
4. Dependencies will be installed automatically

#### Option 2: Local Development

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

### Environment Setup

Create a `.env` file for testing:

```bash
# .env
SUBSTACK_API_KEY=your-connect-sid-cookie-value
SUBSTACK_HOSTNAME=example.substack.com
```

To get your connect.sid cookie value:
1. Login to Substack in your browser
2. Open Developer Tools (F12)
3. Go to Application/Storage → Cookies → `https://substack.com`
4. Copy the `connect.sid` value

## Project Structure

```text
substack-api/
├── src/
│   ├── substack-client.ts    # Main SubstackClient implementation  
│   ├── http-client.ts        # HTTP client with authentication
│   ├── entities/             # Entity classes (Profile, Post, Note, Comment)
│   │   ├── profile.ts
│   │   ├── own-profile.ts  
│   │   ├── post.ts
│   │   ├── note.ts
│   │   └── comment.ts
│   ├── types/               # TypeScript type definitions
│   │   ├── api-types.ts
│   │   ├── entity-types.ts
│   │   └── config-types.ts
│   ├── note-builder.ts      # Helper for building formatted notes
│   └── index.ts             # Public API exports
├── tests/
│   ├── unit/                # Unit tests for individual components
│   ├── integration/         # Integration tests for entity interactions
│   └── e2e/                 # End-to-end tests with real API
├── docs/                    # Comprehensive documentation
│   ├── api-reference.md     # Complete API documentation
│   ├── entity-model.md      # Entity model guide
│   ├── examples.md          # Real-world usage examples
│   ├── quickstart.md        # Getting started guide
│   └── ...
├── samples/                 # Sample applications and scripts
├── dist/                    # Compiled JavaScript files
├── .env.example             # Environment variables template
├── jest.config.js           # Jest configuration for unit tests
├── jest.integration.config.js # Jest configuration for integration tests
├── jest.e2e.config.js       # Jest configuration for E2E tests
├── package.json             # Project configuration
├── tsconfig.json            # TypeScript configuration
└── README.md                # Project overview
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

### Testing Strategy

The project uses a comprehensive 3-tier testing strategy:

#### 1. Unit Tests (`npm test`)
- **Purpose**: Test individual components in isolation
- **Location**: `tests/unit/`
- **Speed**: Very fast (< 1 second)
- **Scope**: Functions, classes, utilities
- **Mocking**: Heavy use of mocks for external dependencies

```bash
npm test              # Run all unit tests
npm run test:watch    # Run in watch mode for development
```

#### 2. Integration Tests (`npm run test:integration`)
- **Purpose**: Test component interactions and entity relationships
- **Location**: `tests/integration/`
- **Speed**: Fast (few seconds)
- **Scope**: Entity navigation, async iteration, error handling
- **Mocking**: Mock HTTP layer, real entity logic

```bash
npm run test:integration          # Run integration tests
npm run test:integration:watch    # Watch mode
```

#### 3. End-to-End Tests (`npm run test:e2e`)
- **Purpose**: Validate against real Substack API
- **Location**: `tests/e2e/`
- **Speed**: Slower (network dependent)
- **Scope**: Full workflow validation, API compatibility
- **Mocking**: No mocks - real API calls

```bash
npm run test:e2e     # Run E2E tests (requires credentials)
```

### End-to-End Testing

The project includes end-to-end (E2E) tests that validate integration with the real Substack server. These tests are located in the `tests/e2e/` directory.

#### Setting Up E2E Tests

1. **Set up credentials**: Create a `.env` file in the project root with your Substack credentials:

   ```bash
   # Copy the example file
   cp .env.example .env
   ```

   Edit the `.env` file and add your connect.sid cookie:

   ```bash
   SUBSTACK_API_KEY=your-connect-sid-cookie-value
   SUBSTACK_HOSTNAME=yoursite.substack.com  # optional
   ```

   **Important**: Never commit your `.env` file to version control. It's already included in `.gitignore`.

2. **Obtain credentials**: Get your connect.sid cookie value:
   - Login to Substack in your browser
   - Open Developer Tools (F12)  
   - Go to Application/Storage → Cookies → `https://substack.com`
   - Copy the `connect.sid` value

#### Running E2E Tests

```bash
npm run test:e2e              # Run all E2E tests
npm run test:e2e -- --testNamePattern="Profile" # Run specific tests
```

E2E tests are designed to be:
- **Safe**: Read-only operations where possible, minimal writes
- **Isolated**: Each test cleans up after itself
- **Conditional**: Skip gracefully when credentials are unavailable
- **Respectful**: Include delays to avoid overwhelming the API

Run E2E tests in watch mode:

```bash
npm run test:e2e:watch
```

Run both unit and E2E tests:

```bash
npm run test:all
```

#### E2E Test Behavior

- **Without credentials**: Tests will be automatically skipped with a warning message explaining how to set up credentials.
- **With credentials**: Tests will run against the real Substack API using your provided credentials.
- **Test isolation**: E2E tests are designed to be read-only and safe to run multiple times without creating unwanted content.
- **Timeout**: E2E tests have a 30-second timeout to account for network latency.

#### E2E Test Coverage

The E2E test suite covers:

- **Authentication**: Verifying API key authentication works
- **Publication operations**: Getting publication details and metadata
- **Post operations**: Fetching posts, pagination, searching, and individual post retrieval
- **Comment operations**: Fetching comments for posts and individual comments
- **Notes operations**: Fetching notes and pagination (note publishing tests are commented out to avoid creating content)
- **Profile operations**: Getting user profiles and public profiles

#### Creating New E2E Tests

When adding new E2E tests:

1. Use the conditional test pattern with `skipIfNoCredentials()`
2. Handle API errors gracefully (some operations may not be available for all accounts)
3. Avoid tests that create persistent content unless absolutely necessary
4. Add logging for skipped operations to help with debugging
5. Follow the existing test structure and naming conventions

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

### Runtime Type Validation

The library uses io-ts for runtime type validation of API responses to ensure data safety beyond TypeScript's compile-time checks.

#### Why Runtime Validation?

While TypeScript provides excellent static typing, API responses are dynamic and can change without notice. Runtime validation with io-ts provides:

- **Type safety at runtime**: Validates that API responses match expected shapes
- **Early error detection**: Catches data inconsistencies before they reach domain models
- **Robust error handling**: Provides detailed error messages for invalid data
- **Composable validation**: Uses composable codecs for complex nested structures

#### Using io-ts Codecs

The library defines io-ts codecs for key internal types in `src/internal/types/io-ts-codecs.ts`:

```typescript
// Raw Post codec
export const RawPostCodec = t.type({
  id: t.number,
  title: t.string,
  slug: t.string,
  post_date: t.string,
  canonical_url: t.string,
  type: t.union([t.literal('newsletter'), t.literal('podcast'), t.literal('thread')])
  // ... other fields
})

export type RawPost = t.TypeOf<typeof RawPostCodec>
```

#### Validation in Services

Services use validation utilities to validate API responses:

```typescript
import { decodeOrThrow } from '../validation'
import { RawPostCodec } from '../types'

async getPostById(id: number): Promise<SubstackPost> {
  const rawResponse = await this.httpClient.get<unknown>(`/api/v1/posts/by-id/${id}`)
  
  // Validate the response with io-ts before returning
  return decodeOrThrow(RawPostCodec, rawResponse, 'Post response')
}
```

#### Validation Utilities

Two main utilities are provided in `src/internal/validation.ts`:

- **`decodeOrThrow`**: Validates data and throws an error on failure (used in production code)
- **`decodeEither`**: Returns an Either type for error handling (used in tests and error-safe contexts)

#### Adding New Codecs

When adding new API endpoints or modifying existing ones:

1. Define io-ts codecs for the expected response shapes
2. Use `decodeOrThrow` in service methods to validate responses
3. Add tests for both successful and failing validation scenarios

Example test:

```typescript
it('should validate valid post data', () => {
  const validPost = { id: 123, title: 'Test', /* ... */ }
  const result = decodeEither(RawPostCodec, validPost)
  expect(isRight(result)).toBe(true)
})

it('should reject invalid post data', () => {
  const invalidPost = { id: 'not-a-number', /* ... */ }
  expect(() => decodeOrThrow(RawPostCodec, invalidPost, 'test')).toThrow()
})
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
