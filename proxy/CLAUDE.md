# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A lightweight Node.js HTTP proxy that converts OpenAI-compatible API requests into DeepSeek API calls. Acts as a local gateway — no npm dependencies, single-file deployment.

## Architecture

Single `proxy.js` file (no framework, no dependencies) with these layers:

- **HTTP server** (line 303): Node.js built-in `http.createServer`, listens on `127.0.0.1:3000`
- **Routes**: `GET /v1/models`, `POST /v1/chat/completions`, `POST /v1/responses`
- **Chat Completions path**: streams (SSE) or buffers request to upstream `/v1/chat/completions`
- **Responses API path**: Converts OpenAI `/v1/responses` format to chat completions, then converts the upstream response back to SSE events (streaming) or JSON (non-streaming)
- **Model name handling**: `sanitizeModel()` strips context-size markers like `[1m]`, `[128k]` from model names

## Configuration (all env vars)

| Env Var | Purpose |
|---|---|
| `UPSTREAM_BASE` | Upstream API base URL (default: `https://api.deepseek.com`) |
| `UPSTREAM_API_KEY`  | API key for upstream auth |
| `UPSTREAM_MODEL_NAME` | Override model name sent to upstream | 
| `UPSTREAM_MODEL_LIST` | Comma-separated model IDs for `/v1/models` endpoint |
| `UPSTREAM_TIMEOUT` | Upstream request timeout in ms (default: 60000) |

## Common Commands

```powershell
# Start the proxy (foreground)
node proxy.js

# Start using the PowerShell launcher (background, hidden window)
.\start.ps1

# The proxy listens on http://127.0.0.1:3000
```

## Key Behaviors

- CORS headers open to all origins (useful for browser-based LLM clients)
- Request body limited to 10 MB
- Non-200 upstream responses are forwarded as-is
- Upstream timeouts and errors return `{"error":{"message":"...","type":"proxy_error"}}`
- Responses API endpoint converts tool calls (`function_call` items) bidirectionally
- Logs each request on `finish`: `HH:MM:SS.ms METHOD /path STATUS model XXms`
