# GitHub 发布指南

## 📦 准备工作完成状态

✅ 所有必要的文件已创建：
- ✅ README.md - 项目说明文档
- ✅ LICENSE - MIT 许可证
- ✅ .gitignore - Git 忽略文件配置
- ✅ .env.example - 环境变量示例
- ✅ package.json - Node.js 项目配置
- ✅ CHANGELOG.md - 版本变更日志
- ✅ CONTRIBUTING.md - 贡献指南
- ✅ start.sh - Linux/Mac 启动脚本
- ✅ proxy.js - 主程序文件
- ✅ start.ps1 - Windows 启动脚本

✅ Git 仓库已初始化
✅ 初始 commit 已创建

---

## 🚀 发布到 GitHub 的步骤

### 步骤 1：在 GitHub 上创建新仓库

1. 访问 https://github.com/new
2. 填写仓库信息：
   - **Repository name**: `cx-proxy`（或您喜欢的名称）
   - **Description**: `A lightweight Node.js HTTP proxy that converts OpenAI-compatible API requests into DeepSeek API calls`
   - **Public/Private**: 根据需要选择
   - **不要勾选** "Initialize this repository with a README"（我们已经有了）
   - **不要勾选** "Add .gitignore"（我们已经有了）
   - **不要勾选** "Choose a license"（我们已经有了）
3. 点击 "Create repository"

### 步骤 2：添加远程仓库

```bash
# 方法一：使用 HTTPS
git remote add origin https://github.com/your-username/cx-proxy.git

# 方法二：使用 SSH（推荐，如果已配置 SSH 密钥）
git remote add origin git@github.com:your-username/cx-proxy.git
```

**注意**：请将 `your-username` 替换为您的 GitHub 用户名。

### 步骤 3：推送到 GitHub

```bash
# 推送到主分支
git push -u origin master
```

如果遇到错误，可能需要先拉取远程仓库（因为是新建的空仓库，应该不会有问题）：
```bash
git pull origin master --allow-unrelated-histories
git push -u origin master
```

### 步骤 4：验证发布

1. 访问您的 GitHub 仓库页面
2. 确认所有文件都已上传
3. 检查 README.md 是否正确显示

---

## 🏷️ 添加 GitHub 标签（可选）

### 创建 v1.0.0 标签

```bash
# 创建带注释的标签
git tag -a v1.0.0 -m "Release version 1.0.0"

# 推送标签到 GitHub
git push origin v1.0.0
```

### 查看所有标签

```bash
git tag
```

---

## 📝 后续操作建议

### 1. 更新 README.md 中的仓库链接

将 README.md 中的所有 `your-username` 替换为您的实际 GitHub 用户名：

```bash
# 编辑 README.md
# 查找并替换所有出现 "your-username" 的地方
```

### 2. 添加 GitHub Topics（标签）

在 GitHub 仓库页面：
1. 点击 "About" 部分
2. 点击 "Add topics"
3. 添加相关标签，例如：
   - `deepseek`
   - `openai`
   - `api-proxy`
   - `nodejs`
   - `llm`
   - `chat-api`

### 3. 启用 GitHub Pages（可选，用于项目网站）

1. 访问仓库的 "Settings"
2. 点击 "Pages"
3. 在 "Build and deployment" 下：
   - Source: 选择 "Deploy from a branch"
   - Branch: 选择 `master` 分支和 `/ (root)` 目录
4. 点击 "Save"

您的项目网站将在 `https://your-username.github.io/cx-proxy/` 可访问。

### 4. 添加 Issues 模板（可选）

创建 `.github/ISSUE_TEMPLATE/bug_report.md` 和 `.github/ISSUE_TEMPLATE/feature_request.md`

### 5. 添加 Pull Request 模板（可选）

创建 `.github/pull_request_template.md`

### 6. 设置保护规则（推荐）

1. 访问仓库的 "Settings"
2. 点击 "Branches"
3. 点击 "Add rule"
4. 设置保护规则：
   - Branch name pattern: `master`
   - 勾选 "Require a pull request before merging"
   - 勾选 "Require approvals"（至少 1 个）
   - 勾选 "Require status checks to pass before merging"

---

## 🎯 发布检查清单

发布前请确认：

- [ ] 所有文件已添加到 Git
- [ ] README.md 内容完整且准确
- [ ] LICENSE 文件存在
- [ ] .gitignore 配置正确
- [ ] .env.example 已创建（不包含真实密钥）
- [ ] package.json 信息正确
- [ ] 代码通过语法检查
- [ ] 没有提交敏感信息（如 API 密钥、密码等）
- [ ] Git commit 信息清晰
- [ ] README.md 中的链接已更新为您的仓库地址

---

## 📚 常见问题

### Q: 如何更新 GitHub 上的代码？

```bash
# 修改代码后
git add .
git commit -m "描述您的更改"
git push
```

### Q: 如何克隆已发布的仓库？

```bash
git clone https://github.com/your-username/cx-proxy.git
cd cx-proxy
```

### Q: 如何删除错误的 commit？

```bash
# 如果是最新的 commit
git reset --soft HEAD~1
# 重新提交
git commit -m "新的提交信息"
git push --force
```

**警告**：`--force` 操作有风险，仅在确定要修改远程历史时使用。

### Q: 如何创建新的分支？

```bash
git checkout -b feature/new-feature
# 进行开发...
git add .
git commit -m "Add new feature"
git push -u origin feature/new-feature
```

---

## 🎉 恭喜！

您的项目已成功发布到 GitHub！

接下来您可以：
- 🔗 分享仓库链接给他人
- 📢 在社交媒体上宣传
- 🐛 接收 Issue 和 Pull Request
- 🌟 鼓励用户给项目点 Star

---

## 📞 需要帮助？

如果在发布过程中遇到问题，请：
1. 查看 [GitHub 官方文档](https://docs.github.com/)
2. 在 GitHub 上创建 Issue
3. 搜索相关问题的解决方案

祝您发布顺利！🚀
