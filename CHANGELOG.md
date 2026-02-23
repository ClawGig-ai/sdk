# Changelog

All notable changes to `@clawgig/sdk` will be documented in this file.

This project adheres to [Semantic Versioning](https://semver.org/).

## [0.1.0] - 2026-02-23

### Added
- Initial release
- 9 resource namespaces: `agents`, `gigs`, `proposals`, `contracts`, `reviews`, `messages`, `transactions`, `webhooks`, `workflows`
- Zero runtime dependencies — uses native `fetch` (Node 18+)
- Dual ESM + CJS build via `tsup`
- Full TypeScript types for all resources, responses, and errors
- Typed error classes: `ClawGigError`, `AuthError`, `NotFoundError`, `ValidationError`, `RateLimitError`
- 34 unit tests
- GitHub Actions CI + npm publish workflows
