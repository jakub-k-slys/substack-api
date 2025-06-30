# End-to-End Tests

This directory contains end-to-end (E2E) tests that validate the Substack API client against real Substack servers.

## Overview

E2E tests are designed to:

- Test real integration with Substack API endpoints
- Validate authentication and authorization
- Ensure core workflows function correctly
- Catch integration issues that unit tests might miss

## Test Structure

- `auth.e2e.test.ts` - Authentication and API access tests
- `publication.e2e.test.ts` - Publication data retrieval tests
- `notes.e2e.test.ts` - Notes operations tests
- `profiles.e2e.test.ts` - User profile tests
- `comments.e2e.test.ts` - Comment operations tests
- `setup.ts` - Global test setup and environment configuration
- `global.d.ts` - TypeScript type declarations for tests
- `tsconfig.json` - TypeScript configuration for E2E tests

## Running E2E Tests

### Prerequisites

1. **Substack API credentials**: You need a valid Substack API key
2. **Environment setup**: Create a `.env` file in the project root

### Quick Start

```bash
# Copy the environment template
cp .env.example .env

# Edit .env and add your credentials
SUBSTACK_API_KEY=your-api-key-here
SUBSTACK_HOSTNAME=yoursite.substack.com  # optional

# Run E2E tests
npm run test:e2e
```

### Available Commands

```bash
# Run all tests (unit + E2E) - RECOMMENDED
npm test

# Run only unit tests
npm run test:unit

# Run only E2E tests
npm run test:e2e

# Run E2E tests in watch mode
npm run test:e2e:watch

# Legacy: Run both unit and E2E tests (same as npm test)
npm run test:all
```

## Test Behavior

### Without Credentials

When no API credentials are provided, **E2E tests will fail immediately** with a clear error message explaining how to set up credentials. This ensures that missing credentials are caught early in the development process.

**Error message example:**

```
❌ Missing required Substack credentials. Set SUBSTACK_API_KEY and SUBSTACK_HOSTNAME.

Required environment variables:
- SUBSTACK_API_KEY: Your Substack API key (required)
- SUBSTACK_HOSTNAME: Your Substack hostname (optional)
```

### With Credentials

Tests run against the real Substack API using your provided credentials. Tests are designed to be:

- **Safe**: Read-only operations that don't create unwanted content
- **Repeatable**: Can be run multiple times without side effects
- **Isolated**: Each test is independent and doesn't rely on others

### Error Handling

Tests gracefully handle various scenarios:

- Missing or invalid credentials
- Network errors and timeouts
- API endpoints that may not be available for all account types
- Rate limiting (through appropriate timeouts)

## CI/CD Integration

E2E tests are integrated into the GitHub Actions workflow:

- **Trigger**: Only runs on pushes to the main branch in the main repository
- **Credentials**: Uses repository secrets for API credentials
- **Artifacts**: Test results are uploaded as artifacts

## Adding New Tests

When creating new E2E tests:

1. **No credential checking needed** - Tests will automatically fail if credentials are missing
2. **Use standard test() function**:

   ```typescript
   test('should test something', async () => {
     // Test implementation - credentials guaranteed to be available
   })
   ```

3. **Handle errors gracefully**:

   ```typescript
   try {
     const result = await client.someMethod()
     // Assert expectations
   } catch (error) {
     console.log('Operation not available:', error)
   }
   ```

4. **Avoid creating content** unless absolutely necessary for the test
5. **Add descriptive logging** for skipped operations
6. **Follow existing naming conventions**

## Debugging

- Use `console.log()` statements for debugging (they'll show in test output)
- Check the test setup in `setup.ts` if tests aren't running as expected
- Verify your `.env` file is properly configured
- Ensure your API key has the necessary permissions

## Security

- **Never commit** your `.env` file or API credentials to version control
- The `.env` file is already included in `.gitignore`
- Use repository secrets for CI/CD credentials
- API keys should have minimal required permissions
