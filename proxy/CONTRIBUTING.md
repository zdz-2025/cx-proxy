# 贡献指南

感谢您对 cx-Proxy 项目的关注！我们欢迎任何形式的贡献。

## 🤝 如何贡献

### 报告 Bug

如果您发现了 bug，请：

1. 在 [Issues](https://github.com//cx-proxy/issues) 中搜索是否已有相关问题
2. 如果没有，创建一个新的 Issue，并包含：
   - 清晰的标题和描述
   - 重现步骤
   - 预期行为和实际行为
   - 环境信息（Node.js 版本、操作系统等）
   - 相关的日志或错误信息

### 提出新功能

如果您有新的功能建议，请：

1. 在 [Issues](https://github.com//cx-proxy/issues) 中搜索是否已有相关建议
2. 如果没有，创建一个新的 Issue，详细描述：
   - 功能描述
   - 使用场景
   - 实现思路（如果有）

### 提交代码

#### 开发流程

1. **Fork 仓库**
   - 点击 GitHub 页面上的 "Fork" 按钮

2. **克隆到本地**
   ```bash
   git clone https://github.com//cx-proxy.git
   cd cx-proxy
   ```

3. **创建功能分支**
   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **进行开发**
   - 遵循现有代码风格
   - 添加必要的注释
   - 确保代码通过语法检查

5. **测试您的更改**
   ```bash
   # 语法检查
   node --check proxy.js

   # 启动服务测试
   node proxy.js
   ```

6. **提交更改**
   ```bash
   git add .
   git commit -m "描述您的更改"
   ```

7. **推送到您的 Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

8. **创建 Pull Request**
   - 在 GitHub 上创建 Pull Request
   - 详细描述您的更改
   - 引用相关的 Issue

#### 提交信息规范

使用清晰、描述性的提交信息：

```
type(scope): subject

body

footer
```

类型（type）：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更改
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 添加测试
- `chore`: 构建/工具更改

示例：
```
feat: add support for multiple choices in responses API

- Modified buildSSE function to handle all choices
- Each choice now generates independent output items
- Updated status detection to check all choices

Closes #123
```

#### 代码规范

- 使用 2 空格缩进
- 使用单引号
- 适当的注释
- 函数和变量使用有意义的名称
- 保持函数简洁，单一职责

## 📋 Pull Request 检查清单

在提交 PR 之前，请确保：

- [ ] 代码符合项目风格
- [ ] 已通过语法检查（`node --check proxy.js`）
- [ ] 添加了必要的文档
- [ ] 提交信息清晰描述了更改
- [ ] 没有引入新的警告或错误

## 🎯 主要贡献方向

我们特别欢迎以下类型的贡献：

- 🐛 Bug 修复
- ✨ 新功能实现
- 📚 文档改进
- 🧪 测试用例
- 🔧 性能优化
- 🌍 国际化支持
- 🛡️ 安全增强

## 💬 讨论与沟通

- 对于大型更改，建议先创建 Issue 进行讨论
- 在 PR 中保持积极沟通
- 及时回应 Review 意见

## 📜 许可证

通过贡献代码，您同意您的贡献将在 [MIT License](LICENSE) 下发布。

## 🙏 感谢

再次感谢您的贡献！每一个贡献都让这个项目变得更好。
