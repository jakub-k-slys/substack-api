# Changelog

All notable changes are documented here. This project follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html) and [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) conventions.

## [Unreleased]

## [3.1.0] - 2026-03

### Changed
- **Note publishing simplified**: replaced `NoteBuilder`/`ParagraphBuilder`/`ListBuilder`/`NoteWithLinkBuilder` with a single `OwnProfile.publishNote(content, options?)` method. The gateway now handles Markdown-to-Substack conversion server-side.

### Removed
- `OwnProfile.newNote()` — use `publishNote(content)` instead
- `OwnProfile.newNoteWithLink(url)` — use `publishNote(content, { attachment: url })` instead
- `NoteBuilder`, `NoteWithLinkBuilder` and all builder classes
- ~34 legacy pre-gateway type definition files from `src/internal/types/`
- `decodeEither` from `src/internal/validation` (unused)

## [3.0.0] - 2025-08

### Changed
- **Breaking**: All HTTP requests are now proxied through [substack-gateway](https://substack-gateway.vercel.app) instead of calling Substack directly
- **Breaking**: Authentication changed from session cookies to a base64-encoded token (`btoa(JSON.stringify({substack_sid, connect_sid}))`)
- HTTP layer replaced with a single `HttpClient` sending `Authorization: Bearer` + `x-publication-url` to the gateway
- `SubstackConfig` now accepts `gatewayUrl` to override the proxy endpoint

### Added
- `SubstackClient.testConnectivity()` — checks gateway health
- `client.noteForId(id)` — fetch a note by numeric ID
- Runtime validation of all gateway responses with io-ts

### Removed
- Direct Substack API calls (all now go through gateway)
- `client.profileForId(id)` — no gateway endpoint available
- `client.commentForId(id)` — no gateway endpoint available
- Dual HTTP client (publication + substack endpoints)
