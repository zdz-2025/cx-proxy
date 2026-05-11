一个轻量级的 Node.js HTTP 代理服务器，将 OpenAI 兼容的 API 请求转换为 codex 调用。作为本地网关运行，无需 npm 依赖，单文件部署。

✨ 特性
🚀 零依赖：仅使用 Node.js 内置模块
🔄 完整 API 支持：、、/v1/models/v1/chat/completions/v1/responses
🌊 流式响应：支持 SSE （Server-Sent Events） 流式输出
🛠️ 工具调用：完整支持 function/tool 调用
📊 多 Choice 支持：处理上游返回的多个候选项
🔧 灵活配置：通过环境变量自定义所有设置
🌐 CORS 支持：允许跨域请求
📝 请求日志：详细的请求日志记录

项目代码的编写，github的发布由claude-code和opencode共同完成，模型使用deepseek-v4-flash，含整个流程均在项目中体现。
