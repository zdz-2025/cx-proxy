# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Initial release of cx Proxy
- Support for `/v1/models` endpoint
- Support for `/v1/chat/completions` endpoint (streaming and non-streaming)
- Support for `/v1/responses` endpoint with format conversion
- Full support for function/tool calls
- Multi-choice support for responses
- CORS headers for cross-origin requests
- Request logging with timestamps
- Environment variable configuration
- Model name sanitization (removes context-size markers)
- Error handling and logging
- Timeout mechanism for upstream requests

### Fixed
- Memory optimization using Buffer.concat instead of string concatenation
- Fixed UPSTREAM_TIMEOUT configuration bug (NaN handling)
- Added headersSent checks to prevent duplicate response headers
- Improved error handling with detailed logging
- Fixed /v1/models configuration logic for empty model lists

### Changed
- Refactored SSE builder for better maintainability
- Improved code structure and readability
- Enhanced error messages

---

## [1.0.0] - 2026-05-09

### Added
- Initial public release
- Core proxy functionality
- Documentation and setup guides
