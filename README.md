# 今日头条 MCP 服务器 (Node.js/TypeScript)

一个功能完整的今日头条内容管理MCP服务器，使用 Node.js 和 TypeScript 实现，支持自动登录、内容发布、数据分析等功能。

## ✨ 主要特性

- 🔐 **用户认证管理** - 自动登录、Cookie持久化、登录状态检查
- 📝 **内容发布功能** - 图文文章发布、微头条发布、图片上传与压缩
- 📊 **数据分析统计** - 阅读量统计、粉丝增长分析、内容表现评估
- 🗂️ **内容管理** - 获取文章列表、删除内容、状态管理
- 📈 **报告生成** - 自动生成日报、周报、月报
- ⚡ **现代化架构** - 基于 TypeScript + MCP SDK，类型安全
- 🛠️ **开发友好** - 完整的类型定义、模块化设计

## 📦 技术栈

- **运行时**: Node.js 18+
- **语言**: TypeScript 5.x
- **框架**: @modelcontextprotocol/sdk
- **自动化**: Selenium WebDriver
- **HTTP客户端**: Axios
- **图片处理**: Sharp

## 🚀 快速开始

### 1. 安装依赖

```bash
cd toutiao-mcp
npm install
```

### 2. 登录今日头条

在开始发布内容之前，需要先登录今日头条账号：

```bash
npm run login
```

**登录流程：**
1. 脚本会自动打开 Chrome 浏览器
2. 跳转到今日头条登录页面
3. 手动输入手机号并获取验证码
4. 完成登录后，Cookie 会自动保存
5. 浏览器自动关闭

**注意事项：**
- 登录凭证保存在 `toutiao_cookies.json` 文件中
- 登录状态可以持续使用，无需每次都登录
- 如果提示登录过期，重新运行登录脚本即可

### 3. 发布内容测试

使用交互式发布工具：

```bash
npm run test
```

**功能特点：**
- ✅ 自动检测登录状态
- ✅ 支持微头条和图文文章发布
- ✅ 交互式输入界面
- ✅ 发布前确认

### 4. 启动 MCP 服务器

```bash
npm run dev
```

或构建后运行：

```bash
npm run build
npm start
```

## 🤖 自动发布微头条

本项目提供了多种自动化发布微头条的方式，从热点新闻自动化到自定义内容发布，满足不同需求。

### 方式一：自动发布热点新闻（推荐新手）

从热点平台（微博、知乎、抖音等）获取热点新闻，AI 自动总结后发布：

```bash
# 交互式配置（推荐）
npm run auto-publish

# 快速模式
npm run auto-publish -- --quick

# 指定参数
npm run auto-publish -- --source weibo --count 3 --interval 60
```

**支持的新闻源**：
- `weibo` - 微博热搜
- `zhihu` - 知乎热榜
- `toutiao` - 今日头条热榜
- `douyin` - 抖音热点
- `baidu` - 百度热搜
- `netease` - 网易新闻
- `thepaper` - 澎湃新闻

**配置选项**：
- `--source` - 新闻源选择
- `--count` - 发布数量（1-10条）
- `--interval` - 发布间隔（秒）
- `--topic` - 是否包含话题标签
- `--emoji` - 是否添加表情符号

### 方式二：AI 增强版自动发布（推荐）

使用 AI 生成更高质量的内容和话题标签：

```bash
npm run auto-publish-ai
```

**特点**：
- 🤖 AI 智能搜索网络并生成专业内容
- 🏷️ 自动提取和优化话题标签
- 🔍 支持测试模式（预览内容不实际发布）
- ⚙️ 可配置 AI 提供商（OpenAI/Anthropic/Local）

**环境变量配置**（可选）：
```bash
export OPENAI_API_KEY="your-key"
export ANTHROPIC_API_KEY="your-key"
```

### 方式三：发布自定义内容

从本地文件读取内容并发布，支持添加图片和话题：

```bash
# 基础用法
npm run publish-custom -- ./news.txt

# 带话题标签
npm run publish-custom -- ./news.txt --topic "热点资讯"

# 添加配图（最多9张）
npm run publish-custom -- ./news.txt --images ./img1.jpg,./img2.jpg

# 完整示例
npm run publish-custom -- ./news.md --topic "科技" --images ./cover.jpg --yes
```

**参数说明**：
- `--topic` - 话题标签
- `--images` - 图片路径（逗号分隔）
- `--yes` - 跳过预览确认

### 方式四：知识分享自动发布

专门为程序员技术知识分享设计，包含完整的学习路径：

```bash
npm run auto-publish-knowledge
```

**特点**：
- 📚 包含30个 NestJS 主题的完整学习路径
- 🎯 使用 AI 生成高质量技术文章
- 📝 发布到今日头条文章（非微头条）

### 📖 详细文档

- **自动发布指南**：[AUTO_PUBLISH_GUIDE.md](./AUTO_PUBLISH_GUIDE.md)
- **自定义发布指南**：[docs/PUBLISH-CUSTOM-GUIDE.md](./docs/PUBLISH-CUSTOM-GUIDE.md)
- **知识分享指南**：[KNOWLEDGE_SHARING_GUIDE.md](./KNOWLEDGE_SHARING_GUIDE.md)
- **快速开始**：[QUICKSTART.md](./QUICKSTART.md)

### ⚠️ 使用建议

1. **首次使用**：必须先运行 `npm run login` 登录
2. **发布频率**：建议控制在每次3-5条，间隔1-2分钟
3. **内容限制**：微头条建议2000字以内
4. **图片要求**：支持JPG/PNG/GIF/WebP，建议小于5MB
5. **平台规则**：遵守今日头条的内容发布规范

## 📁 项目结构

```
toutiao-mcp/
├── src/
│   ├── lib/
│   │   ├── auth.ts          # 认证管理
│   │   ├── publisher.ts     # 内容发布
│   │   ├── analytics.ts     # 数据分析
│   │   └── config.ts        # 配置管理
│   ├── types/
│   │   └── index.ts         # TypeScript 类型定义
│   ├── scripts/
│   │   ├── login.ts         # 登录脚本
│   │   └── test-publish.ts  # 发布测试脚本
│   └── index.ts             # MCP 服务器主入口
├── package.json
├── tsconfig.json
└── README.md
```

## 🛠️ 主要功能模块

### 1. 认证管理 (auth.ts)
- 自动登录（Selenium）
- Cookie持久化存储
- 登录状态检查和维护
- 用户信息获取

### 2. 内容发布 (publisher.ts)
- 图文文章发布（支持富文本、图片、标签）
- 微头条发布（支持图片、话题、位置）
- 图片自动上传和压缩
- 获取文章列表
- 删除文章

### 3. 数据分析 (analytics.ts)
- 账户概览数据（粉丝数、文章数、阅读量）
- 文章详细统计（阅读、评论、分享、点赞）
- 趋势分析（指定时间段的数据变化）
- 报告生成（日报、周报、月报）

## 🔧 MCP 工具列表

### 用户认证
- `login_with_credentials` - 使用用户名密码登录
- `check_login_status` - 检查当前登录状态

### 内容发布
- `publish_article` - 发布图文文章
- `publish_micro_post` - 发布微头条

### 内容管理
- `get_article_list` - 获取文章列表
- `delete_article` - 删除文章

### 数据分析
- `get_account_overview` - 获取账户概览
- `get_article_stats` - 获取文章统计
- `generate_report` - 生成数据报告

## 📝 使用示例

### 发布微头条

```typescript
import { TouTiaoAuth } from './lib/auth';
import { TouTiaoPublisher } from './lib/publisher';

const auth = new TouTiaoAuth();
const publisher = new TouTiaoPublisher(auth);

// 确保已登录
const isLoggedIn = await auth.checkLoginStatus();
if (!isLoggedIn) {
  await auth.loginWithSelenium();
}

// 发布微头条
const result = await publisher.publishMicroPost({
  content: `🎉 今天分享一个超实用的工具

通过自动化工具可以大大提高内容发布效率！

✨ 主要特点：
• 自动登录管理
• 智能内容发布
• 多平台兼容

#工具分享 #效率提升`,
  topic: '科技',
});

console.log(result);
```

### 发布图文文章

```typescript
const result = await publisher.publishArticle({
  title: '科技前沿：AI发展趋势',
  content: `人工智能正在改变我们的生活...

第一部分：技术革新
...

第二部分：应用场景
...`,
  images: ['./cover.jpg'],
  tags: ['AI', '科技', '人工智能'],
  category: '科技',
});

console.log(result);
```

### 获取数据分析

```typescript
import { TouTiaoAnalytics } from './lib/analytics';

const analytics = new TouTiaoAnalytics(auth);

// 获取账户概览
const overview = await analytics.getAccountOverview();
console.log(overview);

// 生成周报
const report = await analytics.generateReport('weekly');
console.log(report);
```

## 🔨 开发指南

### 安装开发依赖

```bash
npm install
```

### 开发模式运行

```bash
npm run dev
```

### 构建项目

```bash
npm run build
```

构建输出在 `dist/` 目录。

### 类型检查

TypeScript 提供完整的类型检查，所有接口和类型定义在 `src/types/index.ts` 中。

## 🚨 注意事项

1. **环境要求**:
   - Node.js 18 或更高版本
   - Chrome 浏览器（用于 Selenium 自动登录）
   - macOS / Windows / Linux

2. **登录要求**: 首次使用需要手动登录一次，后续会自动保持登录状态

3. **图片格式**: 支持 JPG、PNG、WebP 格式，自动压缩优化

4. **内容长度**:
   - 微头条：建议2000字符以内
   - 图文文章：支持长文本
   - 文章标题：2-30个字

5. **发布频率**: 建议控制发布频率，避免被平台限制

## 🐛 故障排除

### 常见问题

1. **登录失败**
   - 检查 Chrome 浏览器是否已安装
   - 确认网络连接正常
   - 检查是否被防火墙阻止

2. **图片上传失败**
   - 检查图片文件是否存在
   - 确认图片格式支持
   - 检查图片大小（建议小于2MB）

3. **发布失败**
   - 确认已登录 (`npm run login`)
   - 检查内容是否符合平台规范
   - 查看控制台错误日志

### 日志查看

运行时日志会输出到控制台，包含详细的操作步骤和错误信息。


## 📄 许可证

MIT License

## 🔗 相关链接

- [MCP SDK 文档](https://github.com/modelcontextprotocol/sdk)
- [今日头条创作者平台](https://mp.toutiao.com/)
- [Selenium WebDriver](https://www.selenium.dev/)
- [TypeScript 文档](https://www.typescriptlang.org/)

## 📞 支持与反馈

如有问题或建议，请通过以下方式联系：

- 提交 GitHub Issue
- 查看项目 Wiki

---

**立即开始使用 Node.js 版本的今日头条 MCP 服务器！** 🚀
