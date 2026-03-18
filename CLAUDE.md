# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Build & Development
- `pnpm build` - Compile TypeScript to JavaScript
- `pnpm clean` - Remove dist/ directory
- `pnpm sample` - Run example code from samples/

### Testing
- `pnpm test` - Run all tests (unit, integration, e2e)
- `pnpm test:unit` - Unit tests only
- `pnpm test:integration` - Integration tests only
- `pnpm test:e2e` - End-to-end tests only
- `pnpm test:watch` - Unit tests in watch mode
- `pnpm test:integration:watch` - Integration tests in watch mode
- `pnpm test:e2e:watch` - E2E tests in watch mode

### Code Quality
- `pnpm lint` - Check code style and formatting
- `pnpm lint:fix` - Auto-fix linting issues
- `pnpm format` - Format code with Prettier
- `pnpm format:check` - Check formatting without changing files

**Required before committing:** Run `pnpm lint`, `pnpm build`, and `pnpm test`

## Architecture

This is a TypeScript client library for the Substack API using a service-oriented architecture:

### Core Structure
- **SubstackClient** (`src/substack-client.ts`) - Main client class that orchestrates services
- **Services** (`src/internal/services/`) - Business logic organized by domain (posts, notes, profiles, comments, etc.)
- **Domain Models** (`src/domain/`) - Entity classes with methods (Profile, Post, Note, Comment)
- **HTTP Layer** (`src/internal/http-client.ts`) - Abstraction over HTTP requests with error handling
- **Caching** (`src/internal/cache/`) - In-memory caching with decorator pattern

### Key Patterns
- **Entity-based API**: Domain objects have methods (e.g., `post.comments()`, `profile.posts()`)
- **Iterator Pattern**: Pagination handled via async iterators (`for await (const post of profile.posts())`)
- **Builder Pattern**: `NoteBuilder` for constructing formatted notes
- **Service Layer**: Separation of HTTP concerns from business logic
- **Functional Programming**: Uses fp-ts and io-ts for validation and error handling

### Dependencies
- **fp-ts**: Functional programming utilities
- **io-ts**: Runtime type validation
- **Jest**: Testing framework with separate configs for unit/integration/e2e tests

### Testing Strategy
- **Unit tests**: Mock HTTP responses, test business logic
- **Integration tests**: Real API calls with test data
- **E2E tests**: Full workflow tests requiring API credentials

### File Organization
- `src/domain/` - Domain entities and builders
- `src/internal/` - Internal services, HTTP client, validation, types
- `src/types/` - Public type definitions
- `tests/unit/` - Unit tests
- `tests/integration/` - Integration tests  
- `tests/e2e/` - End-to-end tests
- `samples/` - Example usage code

## Commit Guidelines

Follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat: add post scheduling`
- `fix: correct auth token refresh` 
- `chore: update dependencies`

Pull request titles should use the same format.