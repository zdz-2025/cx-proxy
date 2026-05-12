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

## [1.1.0] - 2026-05-12

### Added
- `/v1/responses` 端点支持流式响应 (`stream: true`)，实时转换 Chat Completions SSE → Responses API SSE 事件
- `convertInputContent()` 函数支持 `input_image`（image_url）和 `input_file`（filename+file_data）内容类型

### Fixed
- `upstreamPipe` 增加客户端断连清理（`clientRes.on("close")` 自动销毁上游请求），防止资源泄漏
- `upstreamPipe` 增加上游流异常处理（`dsRes.on("error")`）
- `req.on("error")` 增加 `req.destroyed` 检查，防止重复 reject

### Changed
- `toChatBody()` 中 `stream` 字段不再硬编码为 `false`，改为透传客户端请求值

---

## [1.0.0] - 2026-05-09

### Added
- Initial public release
- Core proxy functionality
- Documentation and setup guides
