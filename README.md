# CX Proxy

一个轻量级的 Node.js HTTP 代理服务器，将 OpenAI 兼容的 API 请求转换为 codex 调用。作为本地网关运行，无需 npm 依赖，单文件部署。目前仅能实现基本对话功能，复杂的代码读取，链接读取尚未能实现。

## ✨ 特性

- 🚀 **零依赖**：仅使用 Node.js 内置模块
- 🔄 **完整 API 支持**：`/v1/models`、`/v1/chat/completions`、`/v1/responses`
- 🌊 **流式响应**：支持 SSE (Server-Sent Events) 流式输出
- 🛠️ **工具调用**：完整支持 function/tool calls
- 📊 **多 Choice 支持**：处理上游返回的多个候选项
- 🔧 **灵活配置**：通过环境变量自定义所有设置
- 🌐 **CORS 支持**：允许跨域请求
- 📝 **请求日志**：详细的请求日志记录

## 📋 环境要求

- Node.js >= 14.0.0

## 🚀 快速开始

### 1. 克隆仓库

```bash
git clone https://github.com/your-username/cx-proxy.git
cd cx-proxy
```

### 2. 配置环境变量

创建 `.env` 文件（或直接设置系统环境变量）：

```bash
# 必需：DeepSeek API 密钥
UPSTREAM_API_KEY=your_deepseek_api_key_here

# 可选配置
UPSTREAM_BASE=https://api.deepseek.com
UPSTREAM_MODEL_NAME=deepseek-chat
UPSTREAM_MODEL_LIST=deepseek-chat,deepseek-coder
UPSTREAM_TIMEOUT=60000
```

### 3. 启动服务

#### 方式一：直接运行
```bash
node proxy.js
```

#### 方式二：后台运行（Windows PowerShell）
```powershell
.\start.ps1
```

服务启动后将监听 `http://127.0.0.1:3000`

## ⚙️ 配置说明

| 环境变量 | 说明 | 默认值 |
|---------|------|--------|
| `UPSTREAM_BASE` | 上游 API 基础 URL | `https://api.deepseek.com` |
| `UPSTREAM_API_KEY` | API 密钥（必需） | - |
| `DEEPSEEK_API_KEY` | API 密钥（备用） | - |
| `UPSTREAM_MODEL_NAME` | 覆盖发送到上游的模型名称 | - |
| `UPSTREAM_MODEL_LIST` | `/v1/models` 端点返回的模型 ID 列表（逗号分隔） | - |
| `UPSTREAM_TIMEOUT` | 上游请求超时时间（毫秒） | `60000` |

## 📡 API 端点

### GET /v1/models
获取可用模型列表

**示例：**
```bash
curl http://127.0.0.1:3000/v1/models
```

### POST /v1/chat/completions
聊天完成 API（支持流式和非流式）

**示例：**
```bash
curl -X POST http://127.0.0.1:3000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "model": "deepseek-chat",
    "messages": [{"role": "user", "content": "Hello!"}],
    "stream": false
  }'
```

### POST /v1/responses
OpenAI Responses API（自动转换为 Chat Completions 格式）

**示例：**
```bash
curl -X POST http://127.0.0.1:3000/v1/responses \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_API_KEY" \
  -d '{
    "input": "What is the capital of France?",
    "model": "deepseek-chat"
  }'
```

## 🔧 高级功能

### 流式响应
```javascript
const response = await fetch('http://127.0.0.1:3000/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: 'Hello!' }],
    stream: true
  })
});

const reader = response.body.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  console.log(decoder.decode(value));
}
```

### 工具调用（Function Calling）
```javascript
const response = await fetch('http://127.0.0.1:3000/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer YOUR_API_KEY'
  },
  body: JSON.stringify({
    model: 'deepseek-chat',
    messages: [{ role: 'user', content: 'What is the weather in Beijing?' }],
    tools: [{
      type: 'function',
      function: {
        name: 'get_weather',
        description: 'Get the current weather',
        parameters: {
          type: 'object',
          properties: {
            location: { type: 'string' }
          },
          required: ['location']
        }
      }
    }]
  })
});
```

### 多 Choice 支持
代理会自动处理上游返回的多个候选项，每个 choice 都会生成独立的 output items。

## 📊 性能优化

- ✅ 使用 Buffer.concat 替代字符串拼接，减少内存占用
- ✅ 请求体大小限制：10 MB
- ✅ 超时机制防止长时间等待
- ✅ 错误处理和日志记录

## 🛡️ 安全建议

1. **不要将 `.env` 文件提交到 Git**
2. **在生产环境中使用反向代理**（如 Nginx）
3. **添加认证中间件**（如果需要）
4. **启用 HTTPS**（生产环境）
5. **配置防火墙规则**，限制访问来源

## 📝 日志格式

```
HH:MM:SS.ms METHOD /path STATUS model XXms
```

示例：
```
14:23:45.678 POST /v1/chat/completions 200 deepseek-chat 1234ms
```

## 🐛 故障排除

### 服务无法启动
- 检查端口 3000 是否被占用
- 确认 Node.js 版本 >= 14.0.0

### 请求超时
- 增加 `UPSTREAM_TIMEOUT` 环境变量值
- 检查网络连接

### 认证失败
- 确认 `UPSTREAM_API_KEY` 或 `DEEPSEEK_API_KEY` 已正确设置
- 验证 API 密钥是否有效

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📮 联系方式

如有问题或建议，请通过 GitHub Issues 联系。

## 🙏 致谢

感谢 DeepSeek 提供优秀的 API 服务！

---

**注意**：此代理仅用于个人开发和测试目的。在生产环境使用前，请确保实施适当的安全措施。
