# Introduction

## Overview

Substack API is a TypeScript client library designed to interact with the Substack webservice API. It provides a clean and type-safe interface for accessing Substack's features programmatically.

The library is built with TypeScript and provides full type definitions out of the box, making it easy to integrate with TypeScript projects while still being usable in regular JavaScript applications.

## Key Features

### Publication Management

- Fetch publication details
- Support for multiple publications
- Configurable API version

### Post Operations

- Get all posts with pagination
- Search posts with filters
- Access individual posts by slug
- Support for different post types (newsletter, podcast, thread)

### Comment Management

- Fetch comments for posts
- Access individual comments
- Pagination support for comment lists

### Type Safety

- Full TypeScript support
- Comprehensive type definitions
- Type-safe error handling

### Error Handling

The library includes a dedicated `SubstackError` class that provides detailed error information including:

- Error message
- HTTP status code
- Original response object

## Architecture

The library is designed with a simple and intuitive architecture:

- `Substack` - Main class for interacting with the API
- `SubstackError` - Custom error class for handling API errors
- Type definitions for all API responses
- Modular and extensible design

## Getting Started

Check out the [Quickstart](quickstart.md) guide to begin using the library, or visit the [Installation](installation.md) page for detailed setup instructions.
