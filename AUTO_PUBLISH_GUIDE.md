# 🤖 自动化新闻发布系统使用指南

## 📖 概述

这个自动化系统可以帮你从热点新闻源（如微博、知乎等）获取热门新闻，使用 AI 生成高质量的微头条内容，并自动发布到今日头条。

## 🎯 功能特点

- ✅ **多平台新闻源** - 支持微博、知乎、今日头条、抖音等热搜榜
- ✅ **AI 智能创作** - 使用 AI 搜索网络并生成优质内容
- ✅ **自动化发布** - 定时发布，无需人工干预
- ✅ **话题标签优化** - 智能提取和添加相关话题标签
- ✅ **测试模式** - 支持预览内容而不实际发布

## 🚀 快速开始

### 1. 前置准备

确保你已经完成登录：

```bash
npm run login
```

### 2. 运行自动发布（简单版）

```bash
npm run auto-publish
```

这将启动交互式配置向导，按照提示选择：
- 新闻源（微博/知乎/抖音等）
- 发布数量（建议1-5条）
- 发布间隔（建议60-120秒）

### 3. 运行智能发布（AI增强版）

```bash
npm run auto-publish-ai
```

这个版本集成了 AI 能力，会自动：
1. 获取热点新闻
2. 使用 AI 搜索网络信息
3. 生成高质量微头条内容
4. 自动发布

## ⚙️ 配置说明

### 基础配置（auto-publish-news.ts）

编辑 `src/scripts/auto-publish-news.ts` 中的配置：

```typescript
const config: PublishConfig = {
  source: 'weibo',        // 新闻源
  count: 3,               // 发布数量
  interval: 60,           // 发布间隔(秒)
  includeHashtag: true,   // 包含话题标签
  addEmoji: true,         // 添加表情符号
};
```

### AI 增强配置（auto-publish-with-ai.ts）

编辑 `src/scripts/auto-publish-with-ai.ts` 中的配置：

```typescript
const config: AutoPublishConfig = {
  newsSource: 'weibo',    // 新闻源
  count: 3,               // 发布数量
  interval: 60,           // 间隔秒数
  useAI: true,            // 使用AI增强
  addHashtag: true,       // 添加话题
  dryRun: false,          // 测试模式
};
```

## 📋 支持的新闻源

| 新闻源 | 标识符 | 说明 |
|--------|--------|------|
| 微博热搜 | `weibo` | 实时热点，覆盖面广 |
| 知乎热榜 | `zhihu` | 深度讨论，适合专业话题 |
| 今日头条 | `toutiao` | 新闻资讯，内容丰富 |
| 抖音热搜 | `douyin` | 短视频热点，年轻化 |
| 百度热搜 | `baidu` | 搜索热点，综合性强 |
| 网易新闻 | `netease` | 新闻快讯 |
| 澎湃新闻 | `thepaper` | 深度报道 |

## 🔧 集成 Trends-Hub

### 方法1：通过 MCP 工具调用

如果你的环境支持 MCP 工具，可以直接调用：

```typescript
// 在 fetchWeiboTrending 函数中
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

// 调用 trends-hub 的 MCP 工具
const result = await client.callTool({
  name: 'get-weibo-trending',
  arguments: {}
});
```

### 方法2：通过 HTTP API

如果 trends-hub 提供了 HTTP API：

```typescript
async function fetchWeiboTrending(limit: number = 10) {
  const response = await axios.get('http://localhost:3000/api/weibo-trending');
  return response.data.slice(0, limit);
}
```

### 方法3：直接导入模块

如果 trends-hub 是 npm 包：

```typescript
import { getWeiboTrending } from 'trends-hub';

async function fetchWeiboTrending(limit: number = 10) {
  const data = await getWeiboTrending();
  return data.slice(0, limit);
}
```

## 🤖 集成 AI 服务

### 使用 OpenAI

```typescript
async function generateContentWithAI(newsTitle: string): Promise<string> {
  const response = await axios.post('https://api.openai.com/v1/chat/completions', {
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: '你是一位专业的新媒体编辑，擅长创作吸引人的微头条内容。'
      },
      {
        role: 'user',
        content: `请为这个新闻标题创作一条微头条：${newsTitle}`
      }
    ],
    temperature: 0.7,
  }, {
    headers: {
      'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
    }
  });
  
  return response.data.choices[0].message.content;
}
```

### 使用 Claude (Anthropic)

```typescript
async function generateContentWithAI(newsTitle: string): Promise<string> {
  const response = await axios.post('https://api.anthropic.com/v1/messages', {
    model: 'claude-3-opus-20240229',
    max_tokens: 500,
    messages: [
      {
        role: 'user',
        content: `请为这个新闻标题创作一条微头条：${newsTitle}`
      }
    ]
  }, {
    headers: {
      'x-api-key': process.env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    }
  });
  
  return response.data.content[0].text;
}
```

## 💡 最佳实践

### 1. 发布频率控制

```typescript
// 推荐配置
const config = {
  count: 3-5,           // 每次发布3-5条
  interval: 60-120,     // 间隔1-2分钟
};
```

**建议：**
- 高峰期（8-10点，12-14点，18-22点）：每2小时运行一次
- 低峰期：每4-6小时运行一次
- 避免深夜发布（0-6点）

### 2. 内容质量保证

```typescript
// AI 提示词优化
const prompt = `
创作要求：
1. 开头用表情符号吸引眼球（📰🔥💡等）
2. 简明扼要，突出要点
3. 加入相关背景或解读
4. 语言通俗易懂
5. 结尾提问引发讨论
6. 合理使用 2-3 个话题标签
7. 字数控制在 150-300 字
`;
```

### 3. 话题标签策略

```typescript
// 标签组合策略
const hashtagStrategy = {
  hot: ['热点', '今日话题', '热搜'],      // 通用热点标签
  tech: ['科技', 'AI', '互联网'],        // 科技类
  finance: ['财经', '股市', '经济'],     // 财经类
  entertainment: ['娱乐', '明星', '影视'], // 娱乐类
};
```

### 4. 错误处理

```typescript
// 添加重试机制
async function publishWithRetry(content: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await publisher.publishMicroPost({ content });
      if (result.success) return true;
    } catch (error) {
      console.log(`尝试 ${i + 1}/${maxRetries} 失败，等待后重试...`);
      await sleep(10);
    }
  }
  return false;
}
```

## 🎨 内容模板示例

### 模板1：新闻速递型

```
🔥 [新闻标题]

据最新消息，[简要描述事件]。相关话题已经登上热搜榜，引发广泛关注。

💡 背景：[补充背景信息]

📊 影响：[分析可能的影响]

你怎么看这件事？评论区聊聊吧！

#话题1 #话题2 #话题3
```

### 模板2：深度解读型

```
📰 [新闻标题]

这件事为什么会引发这么大关注？我们来聊聊：

1️⃣ [第一点分析]
2️⃣ [第二点分析]
3️⃣ [第三点分析]

🤔 你的看法是什么？欢迎讨论！

#话题1 #话题2
```

### 模板3：简洁评论型

```
💬 关于 [新闻标题]

[一句话精辟点评]

[补充一两句说明]

你站哪一边？👇

#话题1 #话题2
```

## 📊 定时任务设置

### 使用 cron (Linux/macOS)

```bash
# 编辑 crontab
crontab -e

# 每天 8:00, 12:00, 18:00 自动发布
0 8,12,18 * * * cd /path/to/toutiao-mcp && npm run auto-publish-ai >> logs/auto-publish.log 2>&1
```

### 使用 node-cron (跨平台)

创建 `src/scripts/scheduled-publish.ts`:

```typescript
import cron from 'node-cron';
import { autoPublishWithAI } from './auto-publish-with-ai';

// 每天 8:00, 12:00, 18:00 自动运行
cron.schedule('0 8,12,18 * * *', async () => {
  console.log('⏰ 定时任务启动');
  await autoPublishWithAI();
});

console.log('⏰ 定时任务已启动，等待执行...');
```

## 🐛 故障排查

### 问题1：获取新闻失败

**解决方案：**
1. 检查网络连接
2. 确认 trends-hub 服务正常
3. 查看 API 限流情况

### 问题2：AI 生成失败

**解决方案：**
1. 检查 API Key 是否正确
2. 确认 API 额度充足
3. 使用降级方案（简单模板）

### 问题3：发布失败

**解决方案：**
1. 重新登录：`npm run login`
2. 检查内容是否违规
3. 降低发布频率

## 📈 效果监控

建议创建日志文件记录：

```typescript
import fs from 'fs';

function logPublishResult(result: any) {
  const log = {
    timestamp: new Date().toISOString(),
    success: result.success,
    title: result.title,
    error: result.error,
  };
  
  fs.appendFileSync(
    'logs/publish-history.jsonl',
    JSON.stringify(log) + '\n'
  );
}
```

## 🔐 安全建议

1. **保护 Cookie 文件**
   ```bash
   chmod 600 toutiao_cookies.json
   ```

2. **API Key 管理**
   ```bash
   # 使用环境变量
   export OPENAI_API_KEY="your-key"
   export ANTHROPIC_API_KEY="your-key"
   ```

3. **代码保护**
   - 不要将 Cookie 和 API Key 提交到 Git
   - 使用 `.gitignore` 排除敏感文件

## 📞 需要帮助？

如遇到问题：
1. 查看控制台日志
2. 检查 `logs/` 目录下的日志文件
3. 提交 GitHub Issue

---

**祝你使用愉快！** 🎉

