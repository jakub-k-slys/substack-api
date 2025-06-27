# Dev Container Configuration

This directory contains the development container configuration for the Substack API project, providing a consistent development environment for all contributors.

## What's Included

- **Node.js 20 (LTS)** - Latest stable Node.js version
- **Git & GitHub CLI** - Version control and GitHub integration
- **VS Code Extensions**:
  - ESLint - Code linting and formatting
  - Prettier - Code formatting
  - GitLens - Enhanced Git capabilities
  - TypeScript - Language support
  - Jest Test Runner - Test debugging and execution
  - Code Spell Checker - Spell checking for code
  - Auto Rename Tag - HTML/XML tag renaming

## Quick Start

### GitHub Codespaces
1. Click the "Code" button in the GitHub repository
2. Select "Codespaces" tab
3. Click "Create codespace on main" (or your branch)
4. Wait for the container to build and dependencies to install

### VS Code Remote - Containers
1. Install the "Remote - Containers" extension in VS Code
2. Clone this repository locally
3. Open the repository in VS Code
4. When prompted, click "Reopen in Container"
5. Wait for the container to build and dependencies to install

## Features

- **Automatic Setup**: Dependencies are installed automatically via `postCreateCommand`
- **Consistent Environment**: Same Node.js version and tools across all development environments
- **Integrated Testing**: Debug and run tests directly in VS Code
- **Code Quality**: Pre-configured linting and formatting tools
- **Development Tasks**: Pre-defined VS Code tasks for common operations
- **Debug Configurations**: Ready-to-use debug setups for Jest testing

## Available Tasks

Use `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac) and type "Tasks: Run Task" to access:

- **Install Dependencies** - Run `npm install`
- **Build** - Compile TypeScript to JavaScript
- **Test** - Run unit tests
- **Test Watch** - Run tests in watch mode
- **Lint** - Check code style and quality
- **Format** - Format code with Prettier
- **E2E Tests** - Run end-to-end tests

## Debugging

The configuration includes debug configurations for:

- **Debug Jest Tests** - Debug all unit tests
- **Debug Current Jest Test** - Debug the currently open test file
- **Debug E2E Tests** - Debug end-to-end tests

Access via the VS Code debugger panel (Run and Debug view).

## Environment Variables

For E2E tests, copy `.env.example` to `.env` and add your Substack API credentials:

```bash
cp .env.example .env
# Edit .env with your credentials
```

## Performance

The dev container is configured for optimal performance with:
- Bind mount for workspace files
- Proper Node.js user permissions
- Efficient Docker layer caching

## Configuration

All VS Code settings, tasks, and debug configurations are defined in the `devcontainer.json` file, ensuring they only apply when using the dev container and don't interfere with local VS Code setups.