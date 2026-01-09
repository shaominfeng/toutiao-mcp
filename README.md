# Toutiao MCP Server

[English](README.en.md) | 中文

一个基于 Model Context Protocol (MCP) 的今日头条自动化发布服务器，让 AI 助手能够直接发布和管理今日头条内容。

## 特性

- **MCP 集成** - 为 Claude 等 AI 助手提供标准化的今日头条 API 接口
- **自动化认证** - 使用 Selenium WebDriver 实现登录和会话管理
- **内容发布** - 支持发布图文文章和微头条，包含图片、标签和分类
- **安全存储** - AES-256-GCM 加密的 Cookie 存储
- **命令行工具** - 提供独立的发布脚本，无需 MCP 也可使用

## 快速开始

### 前置条件

- Node.js 18+
- Chrome 或 Chromium 浏览器
- 今日头条账号

### 安装

```bash
# 克隆仓库
git clone https://github.com/yourusername/toutiao-mcp.git
cd toutiao-mcp

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
```

编辑 `.env` 文件，设置必需的配置：

```env
# Cookie 加密密钥（至少 32 字符）
COOKIE_ENCRYPTION_KEY=your-secure-password-at-least-32-characters-long

# Selenium 配置
SELENIUM_HEADLESS=false

# 可选：OpenAI API（用于 AI 生成内容）
# OPENAI_API_KEY=your-api-key
# OPENAI_BASE_URL=https://api.openai.com/v1
```

> [!IMPORTANT]
> `COOKIE_ENCRYPTION_KEY` 必须至少 32 个字符。修改此密钥会使已保存的 Cookie 失效。

### 首次登录

```bash
npm run login
```

浏览器会自动打开，请在浏览器中完成登录。Cookie 会被安全保存，后续无需重复登录。

## 使用方式

### 方式一：作为 MCP 服务器

启动 MCP 服务器，与 AI 助手集成：

```bash
npm start
```

在 Claude Desktop 配置文件中添加：

```json
{
  "mcpServers": {
    "toutiao": {
      "command": "node",
      "args": ["/path/to/toutiao-mcp/dist/index.js"]
    }
  }
}
```

然后你就可以在 Claude 中这样使用：

```
"帮我发布一篇关于 TypeScript 最佳实践的文章"
"发布一条关于今日科技新闻的微头条"
```

### 方式二：独立命令行工具

#### 自动发布热点新闻

从热点新闻源获取内容并发布：

```bash
# 交互式配置
npm run auto-publish

# 快速模式（使用默认配置）
npm run auto-publish -- --quick

# 自定义参数
npm run auto-publish -- --source weibo --count 3 --interval 60
```

#### 发布自定义内容

从文本文件发布内容：

```bash
# 基础用法
npm run publish-custom -- content.txt

# 添加话题标签
npm run publish-custom -- content.txt --topic "科技"

# 添加图片
npm run publish-custom -- content.txt --images img1.jpg,img2.jpg

# 自动确认（跳过预览）
npm run publish-custom -- content.txt --topic "科技" --yes
```

## MCP 工具

### publish_article

发布完整的图文文章。

**参数：**
```typescript
{
  title: string;        // 文章标题（2-30 字符）
  content: string;      // 文章内容（支持 HTML 或 Markdown）
  images?: string[];    // 图片路径列表
  tags?: string[];      // 文章标签
  category?: string;    // 文章分类
}
```

### publish_micro_post

发布微头条（类似推文）。

**参数：**
```typescript
{
  content: string;      // 微头条内容
  images?: string[];    // 图片路径（最多 9 张）
  topic?: string;       // 话题标签
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
│   │   ├── analytics.ts      # 数据分析
│   │   └── wenyan-converter.ts # Markdown 转换
│   ├── scripts/              # 独立脚本
│   │   ├── login.ts          # 登录脚本
│   │   ├── auto-publish-news.ts    # 自动发布
│   │   └── publish-custom-news.ts  # 自定义发布
│   ├── utils/                # 工具函数
│   │   ├── logger.ts         # 日志系统
│   │   └── cookie-storage.ts # Cookie 加密存储
│   └── types/                # TypeScript 类型定义
└── examples/                  # 示例文件
```

## 配置选项

### Selenium 配置

控制浏览器自动化行为：

```env
SELENIUM_HEADLESS=false           # 无头模式
SELENIUM_IMPLICIT_WAIT=10000      # 隐式等待时间（毫秒）
SELENIUM_EXPLICIT_WAIT=30000      # 显式等待时间（毫秒）
```

### 日志配置

```env
LOG_LEVEL=info                    # 日志级别：error | warn | info | debug
ENABLE_CONSOLE_LOG=true           # 控制台输出
ENABLE_FILE_LOG=true              # 文件输出
```

## 故障排除

### 登录失败

如果自动登录遇到问题：

```bash
# 删除旧的 Cookie 文件
rm toutiao_cookies.json

# 重新登录
npm run login
```

> [!TIP]
> 首次登录或遇到验证码时，请在浏览器窗口中手动完成验证。Cookie 会自动保存。

### 发布失败

**图片上传错误：**
- 确保图片文件存在且可访问
- 检查图片格式（支持 JPG、PNG、GIF）
- 验证图片大小不超过限制

**内容被拒绝：**
- 标题长度必须在 2-30 字符之间
- 避免使用违规关键词
- 查看今日头条的内容发布规范

### Chrome Driver 问题

> [!NOTE]
> 首次运行时，Selenium 会自动下载 ChromeDriver，这可能需要几分钟时间。

如果下载失败，可以手动下载并设置环境变量：

```bash
export CHROME_DRIVER_PATH=/path/to/chromedriver
```

## 开发

```bash
# 开发模式（热重载）
npm run dev

# 构建
npm run build

# 测试发布
npm run test
```

## 安全建议

- **保护密钥** - 不要将 `.env` 文件提交到版本控制
- **加密存储** - Cookie 使用 AES-256-GCM 加密存储
- **定期更新** - 及时更新依赖以修复安全漏洞
- **访问控制** - 在生产环境中限制 MCP 服务器的访问权限

## 限制

- 需要有效的今日头条创作者账号
- 发布频率受账号等级限制
- 某些内容可能需要平台审核
- UI 变更可能导致自动化失效（需要更新 selectors）

## 相关资源

- [Model Context Protocol](https://modelcontextprotocol.io) - MCP 官方文档
- [今日头条创作者平台](https://mp.toutiao.com) - 内容管理后台
- [Selenium WebDriver](https://www.selenium.dev/documentation/) - 浏览器自动化

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件
