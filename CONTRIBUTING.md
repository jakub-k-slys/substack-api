# Contributing to Substack API

Thank you for considering contributing to the Substack API client library! This document provides guidelines for contributing to this project.

## Development Setup

1. Fork the repository
2. Clone your fork locally
3. Install dependencies: `npm install`
4. Run tests to verify setup: `npm test`

## Test Strategy

This project uses a three-layer testing architecture designed to provide comprehensive coverage while maintaining clear separation of concerns:

### 1. 🧪 Unit Tests

**Location**: `tests/unit/`
**Purpose**: Test pure functions, utilities, and individual components in isolation
**Characteristics**: 
- Fast execution (< 1 second)
- No I/O operations
- No network calls
- Mock external dependencies
- High code coverage

**Running unit tests**:
```bash
npm run test:unit          # Run once
npm run test:watch         # Run in watch mode
```

**Example test structure**:
```typescript
describe('SubstackClient', () => {
  let client: SubstackClient
  
  beforeEach(() => {
    client = new SubstackClient({ apiKey: 'test', hostname: 'test.com' })
  })
  
  test('should handle API responses correctly', () => {
    // Test implementation
  })
})
```

### 2. 🔗 Integration Tests

**Location**: `tests/integration/`
**Purpose**: Test SDK behavior against known Substack API responses using sample data
**Characteristics**:
- Medium execution time (< 10 seconds)
- Uses local HTTP server with sample responses
- Tests data parsing and entity creation
- Validates sample data consistency
- No real network calls

**Running integration tests**:
```bash
npm run test:integration        # Run once
npm run test:integration:watch  # Run in watch mode
```

**Sample data**:
Integration tests use sample API responses stored in `samples/api/v1/`:
- `subscription` - Single subscription data
- `subscriptions` - Complete subscriptions list with publications
- `user/*/profile` - User profile data
- `user/*/public_profile` - Public profile data

**Example integration test**:
```typescript
describe('Sample Data Integration', () => {
  test('should parse subscription data correctly', () => {
    const samplePath = join(samplesDir, 'subscription')
    const sampleData = JSON.parse(readFileSync(samplePath, 'utf8'))
    
    expect(sampleData.id).toBeDefined()
    expect(sampleData.membership_state).toBe('subscribed')
  })
})
```

### 3. 🌐 End-to-End (E2E) Tests — 🔒 Read-only & Mandatory

**Location**: `tests/e2e/`
**Purpose**: Live testing against the actual Substack API using real credentials
**Characteristics**:
- ✅ **Read-only operations only** (e.g., fetching profiles, subscriptions, posts)
- ❌ **No create/update/delete operations** allowed
- **Mandatory** - CI fails if credentials are missing
- **Enforcement** - Tests fail immediately without proper credentials

**Running E2E tests**:
```bash
# Setup credentials first
cp .env.example .env
# Edit .env and add your SUBSTACK_API_KEY

npm run test:e2e           # Run once
npm run test:e2e:watch     # Run in watch mode
npm run test:all           # Run all test types
```

**Credential requirements**:
- `SUBSTACK_API_KEY`: Required - Your Substack API key
- `SUBSTACK_HOSTNAME`: Optional - Your Substack hostname

**Example E2E test**:
```typescript
describe('SubstackClient E2E', () => {
  beforeAll(() => {
    if (!global.E2E_CONFIG.hasCredentials) {
      throw new Error('E2E tests require credentials')
    }
  })
  
  test('should fetch real profile data', async () => {
    const profile = await client.profileForSlug('platformer')
    expect(profile.name).toBeTruthy()
  })
})
```

## CI/CD Integration

The GitHub Actions workflow runs all three test layers:

1. **Unit tests** - Always run, provide code coverage
2. **Integration tests** - Always run, validate sample data
3. **E2E tests** - Run with repository secrets, fail if credentials missing

## Writing New Tests

### Adding Unit Tests

1. Create test file in `tests/unit/`
2. Use `.test.ts` suffix
3. Mock external dependencies
4. Test individual functions/methods
5. Aim for high coverage

### Adding Integration Tests

1. Create test file in `tests/integration/`
2. Use `.integration.test.ts` suffix  
3. Test against sample data from `samples/api/v1/`
4. Validate data structures and parsing
5. Ensure referential integrity

### Adding E2E Tests

1. Create test file in `tests/e2e/`
2. Use `.e2e.test.ts` suffix
3. **Only use read-only operations**
4. Handle API errors gracefully
5. Add descriptive logging for debugging

### Sample Data Guidelines

When adding new sample data files:

1. Place in appropriate `samples/api/v1/` subdirectory
2. Ensure valid JSON format
3. Remove sensitive information
4. Use realistic, representative data
5. Maintain consistency with existing samples

## Development Workflow

### Before Making Changes

```bash
# Verify current state
npm run lint                # Check code style
npm run build               # Ensure compilation works
npm test                    # Run all tests
```

### Making Changes

1. Write tests first (TDD approach recommended)
2. Make minimal changes to pass tests
3. Ensure all tests pass
4. Update documentation if needed

### Before Submitting PR

```bash
# Final verification
npm run lint                # Fix any linting issues
npm run format              # Format code consistently
npm run build               # Ensure clean build
npm test                    # All tests must pass
```

## Code Style

- Use TypeScript strictly - avoid `any` unless necessary
- Prefer named exports and immutable data
- Keep functions pure where possible
- Use `async/await` and handle errors gracefully
- Add JSDoc comments on all public-facing methods
- Follow existing patterns and conventions

## Pull Request Guidelines

- **Keep changes focused and atomic**
- **Include tests for new functionality**
- **Update documentation as needed**
- **Follow conventional commits**: `feat:`, `fix:`, `test:`, `docs:`
- **Describe your changes in the PR description**
- **Ensure all CI checks pass**

## Test Debugging

### Unit Test Issues
- Check mocks are properly configured
- Verify TypeScript types match expectations
- Use `console.log` for debugging (remove before commit)

### Integration Test Issues
- Validate sample data JSON is valid
- Check file paths in `samples/api/v1/`
- Ensure data structures match expected interfaces

### E2E Test Issues
- Verify `.env` file has valid credentials
- Check API key permissions
- Review network connectivity
- Some operations may not be available for all account types

## Getting Help

- Check existing tests for patterns and examples
- Review the codebase for similar implementations
- Open an issue for clarification on requirements
- Ask questions in pull request discussions

## Security

- **Never commit** your `.env` file or API credentials
- **Use repository secrets** for CI/CD credentials
- **API keys should have minimal required permissions**
- **All E2E tests must be read-only operations**

Thank you for contributing to make this library better! 🚀