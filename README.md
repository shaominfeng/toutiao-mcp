# 今日头条 MCP 服务器

中文 | [English](README.en.md)

一个用于自动化发布内容到今日头条的模型上下文协议（MCP）服务器。这个基于 TypeScript 的服务器提供与 Claude 等 AI 助手的无缝集成，简化内容创作和分发工作流程。

## 功能特性

- **自动化认证**：通过 Selenium WebDriver 登录，支持安全的 Cookie 管理
- **内容发布**：发布图文文章和微头条，支持图片、标签和分类
- **内容管理**：列表查询和删除已发布文章
- **数据分析**：跟踪账号表现并生成数据报告
- **AI 集成**：内置 AI 驱动的内容生成支持
- **Markdown 支持**：将 Markdown 内容转换为今日头条兼容的 HTML
- **文言格式**：支持文言 Markdown 转换以增强格式化效果
- **安全存储**：加密的 Cookie 存储用于会话管理

## 前置要求

- Node.js 18+
- Chrome/Chromium 浏览器（用于 Selenium 自动化）
- 今日头条账号

## 安装

1. 克隆仓库：

```bash
git clone https://github.com/yourusername/toutiao-mcp.git
cd toutiao-mcp
```

2. 安装依赖：

```bash
npm install
```

3. 配置环境变量：

```bash
cp .env.example .env
```

编辑 `.env` 文件并设置你的配置：

```env
# Cookie 加密密钥（必填）
COOKIE_ENCRYPTION_KEY=your-secure-password-at-least-32-characters-long

# Selenium 设置
SELENIUM_HEADLESS=false
SELENIUM_IMPLICIT_WAIT=10000
SELENIUM_EXPLICIT_WAIT=30000

# 日志配置
LOG_LEVEL=info
ENABLE_CONSOLE_LOG=true
ENABLE_FILE_LOG=true

# 可选：AI 集成
ANTHROPIC_API_KEY=sk-ant-xxx
```

> [!IMPORTANT]
> `COOKIE_ENCRYPTION_KEY` 必须至少 32 个字符长。更改此密钥会导致现有存储的 Cookie 失效。

4. 构建项目：

```bash
npm run build
```

## 使用方法

### 作为 MCP 服务器运行

启动 MCP 服务器以与 AI 助手集成：

```bash
npm start
```

服务器会暴露 MCP 工具，可被兼容的 AI 客户端调用。

### 开发模式

在开发模式下运行（支持热重载）：

```bash
npm run dev
```

### 身份认证

首次使用 Selenium 登录：

```bash
npm run login
```

这会打开一个浏览器窗口，你可以手动登录。Cookie 会被保存供后续会话使用。

### 发布内容

#### 自动发布脚本

从知识库发布内容：

```bash
npm run auto-publish-knowledge
```

使用 AI 生成内容并发布：

```bash
npm run auto-publish-ai
```

发布自定义内容：

```bash
npm run publish-custom
```

#### 使用 MCP 工具

服务器运行后，AI 助手可以调用以下工具：

**认证**
- `login_with_credentials` - 使用用户名/密码登录
- `check_login_status` - 验证当前登录状态

**发布**
- `publish_article` - 发布完整文章
- `publish_micro_post` - 发布微头条（类似推文）

**管理**
- `get_article_list` - 列出已发布文章
- `delete_article` - 删除文章

**分析**
- `get_account_overview` - 获取账号统计数据
- `get_article_stats` - 获取指定文章的统计数据
- `generate_report` - 生成分析报告（日报/周报/月报）

## MCP 工具参考

### publish_article

发布完整文章到今日头条。

```typescript
{
  title: string;        // 2-30 个字符
  content: string;      // 文章内容（支持 Markdown）
  images?: string[];    // 图片文件路径
  tags?: string[];      // 文章标签
  category?: string;    // 文章分类
}
```

**示例：**

```json
{
  "title": "TypeScript 入门指南",
  "content": "# 简介\n\nTypeScript 是 JavaScript 的类型化超集...",
  "images": ["./images/typescript-logo.png"],
  "tags": ["TypeScript", "编程", "教程"],
  "category": "科技"
}
```

### publish_micro_post

发布短内容微头条。

```typescript
{
  content: string;      // 内容
  images?: string[];    // 最多 9 张图片
  topic?: string;       // 话题标签
}
```

### get_article_list

获取已发布文章列表。

```typescript
{
  page?: number;        // 默认：1
  pageSize?: number;    // 默认：20
  status?: string;      // 'all' | 'published' | 'draft' | 'review'
}
```

## 项目结构

```
toutiao-mcp/
├── src/
│   ├── index.ts              # MCP 服务器入口
│   ├── lib/
│   │   ├── auth.ts           # 认证管理
│   │   ├── publisher.ts      # 发布功能
│   │   ├── analytics.ts      # 分析和报告
│   │   ├── config.ts         # 配置管理
│   │   └── wenyan-converter.ts # Markdown 转换
│   ├── scripts/              # 自动化脚本
│   ├── utils/                # 工具函数（日志、Cookie 存储等）
│   └── types/                # TypeScript 类型定义
├── examples/                  # 示例内容文件
├── logs/                     # 应用日志
└── data/                     # 数据存储
```

## 配置

### Selenium 选项

控制浏览器自动化行为：

- `SELENIUM_HEADLESS`：无头模式运行浏览器（true/false）
- `SELENIUM_IMPLICIT_WAIT`：元素的默认等待时间（毫秒）
- `SELENIUM_EXPLICIT_WAIT`：操作的最大等待时间（毫秒）

### 内容设置

- `MAX_IMAGE_SIZE`：图片文件最大大小（字节）
- `IMAGE_QUALITY`：图片压缩质量（1-100）
- `DEFAULT_CATEGORY`：默认文章分类

### 日志配置

- `LOG_LEVEL`：日志详细程度（error, warn, info, debug）
- `LOG_DIR`：日志文件目录
- `ENABLE_CONSOLE_LOG`：在控制台显示日志
- `ENABLE_FILE_LOG`：将日志写入文件

## 故障排除

### 登录问题

> [!TIP]
> 如果自动登录失败，尝试运行 `npm run login` 在浏览器窗口中手动认证。

**常见问题：**
- 需要验证码验证 - 在 `npm run login` 期间手动完成
- 会话过期 - 删除 `toutiao_cookies.json` 并重新登录
- 凭据无效 - 验证环境变量中的用户名/密码

### 发布失败

**图片上传错误：**
- 确保图片在最大大小限制以内
- 验证图片路径正确且可访问
- 检查图片格式是否支持（JPG、PNG、GIF）

**内容被拒绝：**
- 查看今日头条的内容指南
- 确保标题长度为 2-30 个字符
- 检查是否有受限关键词或主题

### 性能

> [!NOTE]
> 首次运行可能需要较长时间，因为 Selenium 会自动下载 Chrome 驱动。

提升运行速度：
- 启用无头模式：`SELENIUM_HEADLESS=true`
- 如果网络快，减少等待时间
- 使用更小的图片或降低 `IMAGE_QUALITY`

## 安全考虑

- **Cookie 加密**：所有 Cookie 使用 AES-256-GCM 静态加密
- **环境变量**：永远不要将 `.env` 文件提交到版本控制
- **API 密钥**：保护好 `ANTHROPIC_API_KEY` 和 `COOKIE_ENCRYPTION_KEY`
- **访问控制**：考虑在受限环境中运行 MCP 服务器

## 示例

### 基础文章发布

```bash
# 使用示例内容测试发布
npm run test
```

### 文言格式转换

服务器支持文言 Markdown 格式以增强 HTML 渲染：

```bash
npm run test-wenyan
```

## API 集成

这个 MCP 服务器设计用于与支持模型上下文协议的 AI 助手配合工作。将其连接到 Claude 或其他兼容客户端以启用自然语言内容发布。

**与 Claude 的示例工作流：**

1. 启动 MCP 服务器：`npm start`
2. 配置 Claude 连接到服务器
3. 询问 Claude："发布一篇关于 TypeScript 最佳实践的文章"
4. Claude 使用 MCP 工具进行认证和发布

## 开发

### 构建

```bash
npm run build
```

### 运行测试

```bash
npm test
```

### 项目脚本

- `npm run dev` - 开发模式（支持热重载）
- `npm run build` - 编译 TypeScript 到 JavaScript
- `npm run login` - 交互式登录
- `npm test` - 测试发布功能
- `npm run auto-publish-news` - 从新闻源自动发布
- `npm run auto-publish-ai` - 发布 AI 生成的内容
- `npm run auto-publish-knowledge` - 从知识库发布

## 限制

- 需要具有内容发布权限的活跃今日头条账号
- 根据账号等级有速率限制
- 某些内容可能需要今日头条手动审核
- 如果今日头条更新其 UI，Selenium 自动化可能会失效

## 资源

- [模型上下文协议](https://modelcontextprotocol.io)
- [今日头条创作者平台](https://mp.toutiao.com)
- [Selenium WebDriver 文档](https://www.selenium.dev/documentation/)

## 许可证

MIT
