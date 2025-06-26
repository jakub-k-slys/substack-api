# Agent Instructions

This repository provides a TypeScript client for interacting with the **Substack API**. It supports authentication, fetching and managing subscribers, publishing posts (including drafts), and other operations typically needed when integrating Substack into custom automation workflows.

It is designed to be used as a library and integrated into broader systems (e.g., automation via `n8n` or standalone publishing scripts).

## Required Commands

Run these before committing:

- `npm run lint` – checks formatting and code style
- `npm run build` – validates that the project compiles
- `npm test` – runs the test suite with Jest

Make sure to run `npm install` after cloning the repo to install dependencies.

## Commit and PR Guidelines

- Follow [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/):  
  Examples: `feat: add post scheduling`, `fix: correct auth token refresh`, `chore: update dependencies`
- Pull request titles should use the same format
- PR descriptions should explain:
  - What feature/bug is addressed
  - Which commands were run (e.g., lint, build, test)
  - Any potential breaking changes

## Project Overview

This library abstracts Substack's public and semi-public APIs into a friendly TypeScript interface. It's meant for developers building tools around newsletters, automated campaigns, or subscriber analytics.

The main goals:
- Encapsulate HTTP request logic
- Expose typed methods with clear input/output
- Keep implementation testable and clean

## Directory Structure

- `src/` – core library logic
  - `client.ts` – Substack API client implementation
  - `types.ts` – shared TypeScript interfaces and types
  - `note-builder.ts` – helper for building formatted notes
  - `tests/` – Jest-based unit tests
- `tests/e2e/` – end-to-end integration tests
- `docs/` – comprehensive documentation
- `.github/workflows/` – GitHub Actions for CI (lint, build, test)

## Architecture

The API client is built as a class-based wrapper around Axios. Each method represents a high-level API action (e.g. `getSubscribers()`, `createPost()`), and supports error handling, retries, and optional debugging.

Most methods return `Promise<T>` with a typed response.

Authentication is handled via bearer tokens or cookies, depending on the method used.

## Coding Guidelines

- Use TypeScript strictly – avoid `any` unless necessary
- Prefer named exports and immutable data
- Keep functions pure where possible
- Use `async/await` and handle errors gracefully
- Add JSDoc comments on all public-facing methods

## Testing Strategy

Use `npm test` to run unit tests and `npm run test:e2e` for end-to-end tests.

### Unit Tests
Tests should cover:
- Response parsing
- Error conditions
- Helper utilities

Mocks should be used to avoid real Substack API calls.

### End-to-End Tests
The repository includes E2E tests that validate integration with real Substack servers:
- Located in `tests/e2e/` directory
- Require API credentials (`.env` file setup)
- Use conditional test patterns to skip when credentials are unavailable
- Designed to be safe, repeatable, and isolated

## Actions Workflows

- **test.yaml** – Lint, build, and test on push and PR to `main`
- **release.yaml** – Automated releases and publishing
- **lintpr.yaml** – PR title and commit message validation
- **dependabot.yml** – Automated dependency updates