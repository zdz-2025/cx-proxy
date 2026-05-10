const http = require("http");
const https = require("https");

// ── All configuration from environment variables ─────────────
const UPSTREAM_BASE = process.env.UPSTREAM_BASE || "https://api.deepseek.com";
const UPSTREAM_API_KEY = process.env.UPSTREAM_API_KEY  || "";
const UPSTREAM_MODEL_NAME = process.env.UPSTREAM_MODEL_NAME || "";
const UPSTREAM_MODEL_LIST = process.env.UPSTREAM_MODEL_LIST || "";
const UPSTREAM_TIMEOUT = parseInt(process.env.UPSTREAM_TIMEOUT) || 60000;
const MAX_BODY_SIZE = 10 * 1024 * 1024;
const PORT = 3000;

// Parse upstream URL
const UPSTREAM_URL = new URL(UPSTREAM_BASE);
const MODULE = UPSTREAM_URL.protocol === "http:" ? http : https;

// ── Helpers ──────────────────────────────────────────────────

function generateId(prefix = "") {
  return `${prefix}${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function sanitizeModel(name) {
  return (name || "").replace(/\s*\[\d+[kmg]\]\s*$/i, "").trim() || name;
}

function upstreamModel(clientModel) {
  return sanitizeModel(UPSTREAM_MODEL_NAME || clientModel || "default");
}

function upstreamOpt(path, body, headers) {
  const reqHeaders = { "Content-Type": "application/json", "Content-Length": Buffer.byteLength(body) };
  const auth = headers.authorization || headers.Authorization || (UPSTREAM_API_KEY ? `Bearer ${UPSTREAM_API_KEY}` : undefined);
  if (auth) reqHeaders.Authorization = auth;
  const opt = {
    hostname: UPSTREAM_URL.hostname,
    path,
    method: "POST",
    headers: reqHeaders,
  };
  if (UPSTREAM_URL.port) opt.port = Number(UPSTREAM_URL.port);
  return opt;
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let totalSize = 0;
    req.on("data", (chunk) => {
      chunks.push(chunk);
      totalSize += chunk.length;
      if (totalSize > MAX_BODY_SIZE) {
        reject(new Error("Request body too large"));
        req.destroy();
      }
    });
    req.on("end", () => {
      resolve(Buffer.concat(chunks).toString());
    });
    req.on("error", reject);
  });
}

function sendJSON(res, code, data) {
  if (!res.headersSent) {
    res.writeHead(code, { "Content-Type": "application/json" });
    res.end(JSON.stringify(data));
  }
}

function logReq(method, path, status, model, ms) {
  const ts = new Date().toISOString().slice(11, 23);
  console.log(`${ts} ${method} ${path} ${status} ${model || "-"} ${ms}ms`);
}

function logError(msg, error) {
  console.error(`[ERROR] ${msg}`, error?.message || error);
}

// ── Upstream request helpers ─────────────────────────────────

function upstreamFetch(chatBody, headers) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(chatBody);
    const opt = upstreamOpt("/v1/chat/completions", body, headers);
    const req = MODULE.request(opt, (res) => {
      const chunks = [];
      res.on("data", (chunk) => chunks.push(chunk));
      res.on("end", () => {
        const data = Buffer.concat(chunks).toString();
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) {
          logError("Failed to parse upstream response", e);
          console.error(`[ERROR] Response body: ${data.substring(0, 200)}...`);
          resolve({ status: res.statusCode, body: { error: { message: `Upstream returned non-JSON (${res.statusCode})`, type: "upstream_error" } } });
        }
      });
    });
    req.setTimeout(UPSTREAM_TIMEOUT, () => { req.destroy(); reject(new Error("Upstream timeout")); });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

function upstreamPipe(chatBody, headers, clientRes) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(chatBody);
    const opt = upstreamOpt("/v1/chat/completions", body, headers);
    const req = MODULE.request(opt, (dsRes) => {
      if (dsRes.statusCode !== 200) {
        const chunks = [];
        dsRes.on("data", (chunk) => chunks.push(chunk));
        dsRes.on("end", () => {
          const errBody = Buffer.concat(chunks).toString();
          try { sendJSON(clientRes, dsRes.statusCode, JSON.parse(errBody)); }
          catch { sendJSON(clientRes, dsRes.statusCode, { error: { message: `Upstream error (${dsRes.statusCode})`, type: "upstream_error" } }); }
          resolve(dsRes.statusCode);
        });
        return;
      }
      clientRes.writeHead(200, {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      });
      dsRes.pipe(clientRes);
      dsRes.on("end", () => resolve(200));
    });
    req.setTimeout(UPSTREAM_TIMEOUT, () => { req.destroy(); reject(new Error("Upstream timeout")); });
    req.on("error", reject);
    req.write(body);
    req.end();
  });
}

// ── Responses API → Chat Completions conversion ──────────────

function convertTools(tools) {
  if (!tools) return undefined;
  const f = tools.filter((t) => !t.type || t.type === "function").map((t) => ({
    type: "function",
    function: {
      name: t.name || (t.function && t.function.name) || "",
      description: t.description || (t.function && t.function.description) || "",
      parameters: t.parameters || (t.function && t.function.parameters) || {},
    },
  }));
  return f.length ? f : undefined;
}

function toChatBody(respBody) {
  const msgs = [];
  if (respBody.instructions) msgs.push({ role: "system", content: respBody.instructions });
  if (typeof respBody.input === "string") {
    msgs.push({ role: "user", content: respBody.input });
  } else if (Array.isArray(respBody.input)) {
    for (const item of respBody.input) {
      if (item.type === "message" && item.role === "user") {
        const t = Array.isArray(item.content)
          ? item.content.map((c) => c.type === "input_text" ? c.text : "").join("")
          : (item.content || "");
        msgs.push({ role: "user", content: t });
      } else if (item.type === "message" && item.role === "assistant") {
        const contentArr = Array.isArray(item.content) ? item.content : [];
        const textParts = contentArr.filter((c) => c.type === "output_text");
        const content = textParts.map((c) => c.text).join("") || null;
        const toolCalls = [];
        for (const c of contentArr) {
          if (c.type === "function_call") {
            toolCalls.push({
              id: c.id, type: "function",
              function: { name: c.name, arguments: c.arguments },
            });
          }
        }
        const msg = { role: "assistant", content };
        if (toolCalls.length > 0) msg.tool_calls = toolCalls;
        msgs.push(msg);
      } else if (item.type === "function_call_output") {
        msgs.push({ role: "tool", tool_call_id: item.call_id, content: item.output });
      }
    }
  }
  return {
    model: upstreamModel(respBody.model),
    messages: msgs,
    temperature: respBody.temperature,
    max_tokens: respBody.max_output_tokens,
    tools: convertTools(respBody.tools),
    stream: false,
  };
}

// ── SSE builder for Responses API (Refactored) ───────────────

function sseMsg(event, data) {
  return `event: ${event}\r\ndata: ${JSON.stringify(data)}\r\n\r\n`;
}

function mapUsage(u) {
  if (!u) return {};
  return {
    input_tokens: u.input_tokens ?? u.prompt_tokens ?? 0,
    output_tokens: u.output_tokens ?? u.completion_tokens ?? 0,
    total_tokens: u.total_tokens ?? 0,
  };
}

function createResponseCreatedEvent(respId, ts, model) {
  return sseMsg("response.created", {
    type: "response.created",
    response: { id: respId, object: "response", created_at: ts, status: "in_progress", model, output: [] },
  });
}

function createResponseCompletedEvent(respId, ts, model, status, output, usage) {
  return sseMsg("response.completed", {
    type: "response.completed",
    response: { id: respId, object: "response", created_at: ts, status, model, output, usage: mapUsage(usage) },
  });
}

function createOutputItemAddedEvent(itemId, outputIndex) {
  return sseMsg("response.output_item.added", {
    type: "response.output_item.added",
    output_index: outputIndex,
    item: { id: itemId, object: "realtime.item", type: "message", status: "in_progress", role: "assistant", content: [] },
  });
}

function createOutputItemDoneEvent(itemId, outputIndex, content) {
  return sseMsg("response.output_item.done", {
    type: "response.output_item.done",
    output_index: outputIndex,
    item: { id: itemId, object: "realtime.item", type: "message", status: "completed", role: "assistant", content },
  });
}

function processTextContent(itemId, outputIndex, contentIndex, text) {
  let buf = "";
  buf += sseMsg("response.content_part.added", {
    type: "response.content_part.added",
    item_id: itemId, output_index: outputIndex, content_index: contentIndex,
    part: { type: "output_text", text: "", annotations: [] },
  });
  buf += sseMsg("response.output_text.delta", {
    type: "response.output_text.delta",
    item_id: itemId, output_index: outputIndex, content_index: contentIndex,
    delta: text,
  });
  buf += sseMsg("response.content_part.done", {
    type: "response.content_part.done",
    item_id: itemId, output_index: outputIndex, content_index: contentIndex,
    part: { type: "output_text", text, annotations: [] },
  });
  return { buf, doneContent: { type: "output_text", text, annotations: [] } };
}

function processFunctionCall(itemId, outputIndex, contentIndex, call) {
  let buf = "";
  buf += sseMsg("response.content_part.added", {
    type: "response.content_part.added",
    item_id: itemId, output_index: outputIndex, content_index: contentIndex,
    part: { type: "function_call", id: call.id, name: call.name, arguments: "", status: "in_progress" },
  });
  buf += sseMsg("response.function_call_arguments.delta", {
    type: "response.function_call_arguments.delta",
    item_id: itemId, output_index: outputIndex, content_index: contentIndex,
    delta: call.arguments,
  });
  buf += sseMsg("response.function_call_arguments.done", {
    type: "response.function_call_arguments.done",
    item_id: itemId, output_index: outputIndex, content_index: contentIndex,
    arguments: call.arguments,
  });
  buf += sseMsg("response.content_part.done", {
    type: "response.content_part.done",
    item_id: itemId, output_index: outputIndex, content_index: contentIndex,
    part: { type: "function_call", id: call.id, name: call.name, arguments: call.arguments, status: "completed" },
  });
  return { buf, doneContent: { type: "function_call", id: call.id, name: call.name, arguments: call.arguments, status: "completed" } };
}

function buildSSE(dsRes) {
  const respId = generateId("resp_");
  const ts = Math.floor(Date.now() / 1000);
  const choices = dsRes.choices || [];
  const model = dsRes.model || "default";

  const outputItems = [];
  let buf = "";

  buf += createResponseCreatedEvent(respId, ts, model);

  choices.forEach((choice, choiceIndex) => {
    const msg = choice?.message || {};
    const text = msg.content || "";
    const toolCalls = msg.tool_calls || [];

    const items = [];
    if (text) items.push({ type: "output_text", text });
    items.push(...toolCalls.map(tc => ({ 
      type: "function_call", 
      id: tc.id, 
      name: tc.function.name, 
      arguments: tc.function.arguments 
    })));

    if (items.length === 0) {
      return;
    }

    const outputIndex = choiceIndex;
    const itemId = generateId("item_");
    const doneContent = [];

    buf += createOutputItemAddedEvent(itemId, outputIndex);

    items.forEach((item, index) => {
      if (item.type === "output_text") {
        const { buf: itemBuf, doneContent: dc } = processTextContent(itemId, outputIndex, index, item.text);
        buf += itemBuf;
        doneContent.push(dc);
      } else if (item.type === "function_call") {
        const { buf: itemBuf, doneContent: dc } = processFunctionCall(itemId, outputIndex, index, item);
        buf += itemBuf;
        doneContent.push(dc);
      }
    });

    buf += createOutputItemDoneEvent(itemId, outputIndex, doneContent);

    outputItems.push({ 
      id: itemId, 
      object: "realtime.item", 
      type: "message", 
      status: "completed", 
      role: "assistant", 
      content: doneContent 
    });
  });

  if (outputItems.length === 0) {
    return createResponseCompletedEvent(respId, ts, model, "completed", [], mapUsage(dsRes.usage));
  }

  const finishStatus = choices.some(c => c?.finish_reason === "tool_calls") ? "incomplete" : "completed";
  buf += createResponseCompletedEvent(respId, ts, model, finishStatus, outputItems, mapUsage(dsRes.usage));

  return buf;
}

// ── HTTP server ──────────────────────────────────────────────

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const start = Date.now();

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Headers", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  if (req.method === "OPTIONS") return res.writeHead(204).end();

  // Log on finish
  const origWriteHead = res.writeHead.bind(res);
  res.writeHead = function (status) { res.statusCode = status; return origWriteHead.apply(this, arguments); };
  res.on("finish", () => {
    logReq(req.method, url.pathname, res.statusCode, res._model || "-", Date.now() - start);
  });

  // ── GET /v1/models ──────────────────────────────────────
  if (req.method === "GET" && url.pathname === "/v1/models") {
    const modelIds = UPSTREAM_MODEL_LIST || UPSTREAM_MODEL_NAME || "default";
    const models = modelIds.split(",").map((id) => ({ 
      id: sanitizeModel(id.trim()) || "default", 
      object: "model", 
      created: Date.now(), 
      owned_by: "upstream" 
    }));
    return sendJSON(res, 200, { object: "list", data: models });
  }

  // ── POST /v1/chat/completions ──────────────────────────
  if (req.method === "POST" && url.pathname === "/v1/chat/completions") {
    readBody(req).then((body) => {
      try {
        const chatBody = JSON.parse(body);
        console.log(`  ← model: "${chatBody.model}"`);
        res._model = chatBody.model;
        chatBody.model = upstreamModel(chatBody.model);
        if (chatBody.stream) {
          upstreamPipe(chatBody, req.headers, res).catch((err) => {
            logError("upstreamPipe error", err);
            if (!res.headersSent) sendJSON(res, 500, { error: { message: err.message, type: "proxy_error" } });
          });
        } else {
          upstreamFetch(chatBody, req.headers).then((result) => {
            sendJSON(res, result.status, result.body);
          }).catch((err) => {
            logError("upstreamFetch error", err);
            if (!res.headersSent) sendJSON(res, 500, { error: { message: err.message, type: "proxy_error" } });
          });
        }
      } catch (err) {
        logError("JSON parse error", err);
        if (!res.headersSent) sendJSON(res, 400, { error: { message: "Invalid JSON body", type: "invalid_request_error" } });
      }
    }).catch((err) => {
      logError("readBody error", err);
      if (!res.headersSent) sendJSON(res, 413, { error: { message: err.message, type: "invalid_request_error" } });
    });
    return;
  }

  // ── POST /v1/responses ──────────────────────────────────
  if (req.method === "POST" && url.pathname === "/v1/responses") {
    readBody(req).then((body) => {
      try {
        const respBody = JSON.parse(body);
        res._model = respBody.model;
        const chatBody = toChatBody(respBody);

        upstreamFetch(chatBody, req.headers).then((result) => {
          if (result.status !== 200) return sendJSON(res, result.status, result.body);

          const sseBuf = buildSSE(result.body);
          res.writeHead(200, {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "Content-Length": Buffer.byteLength(sseBuf),
          });
          res.end(sseBuf);
        }).catch((err) => {
          logError("upstreamFetch error", err);
          if (!res.headersSent) sendJSON(res, 500, { error: { message: err.message, type: "proxy_error" } });
        });
      } catch (err) {
        logError("JSON parse error", err);
        if (!res.headersSent) sendJSON(res, 400, { error: { message: "Invalid JSON body", type: "invalid_request_error" } });
      }
    }).catch((err) => {
      logError("readBody error", err);
      if (!res.headersSent) sendJSON(res, 413, { error: { message: err.message, type: "invalid_request_error" } });
    });
    return;
  }

  sendJSON(res, 404, { error: { message: `Not found: ${req.method} ${url.pathname}` } });
});

server.listen(PORT, "127.0.0.1", () => {
  const parts = [`Proxy running on http://127.0.0.1:${PORT} → ${UPSTREAM_BASE}`];
  if (UPSTREAM_MODEL_NAME) parts.push(`  model: ${UPSTREAM_MODEL_NAME}`);
  if (UPSTREAM_API_KEY) parts.push(`  auth: enabled`);
  console.log(parts.join("\n"));
});
