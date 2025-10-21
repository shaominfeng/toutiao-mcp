/**
 * 程序员知识分享自动发布脚本
 *
 * 功能流程：
 * 1. 展示知识主题清单（第一阶段：NestJS）
 * 2. 用户选择主题
 * 3. 使用 AI 生成高质量技术文章
 * 4. 自动发布到今日头条文章
 *
 * 使用方法：
 * npm run auto-publish-knowledge
 */

import { TouTiaoAuth } from '../lib/auth';
import { TouTiaoPublisher } from '../lib/publisher';
import * as readline from 'readline';
import axios from 'axios';
import * as dotenv from 'dotenv';

// 加载环境变量
dotenv.config();

// ============================================================================
// NestJS 知识主题清单
// ============================================================================

interface KnowledgeTopic {
  id: number;
  category: string;
  title: string;
  keywords: string[];
  difficulty: '入门' | '进阶' | '高级';
  estimatedWords: number;
  description: string;
}

const NESTJS_TOPICS: KnowledgeTopic[] = [
  // 基础入门篇
  {
    id: 1,
    category: '基础入门',
    title: 'NestJS 框架简介：为什么选择 NestJS？',
    keywords: ['NestJS', 'Node.js', '框架对比', '企业级开发'],
    difficulty: '入门',
    estimatedWords: 1500,
    description: '介绍 NestJS 的诞生背景、核心特性、与 Express/Koa 的对比、适用场景'
  },
  {
    id: 2,
    category: '基础入门',
    title: 'NestJS 快速上手：创建你的第一个应用',
    keywords: ['快速开始', '项目搭建', 'CLI工具', 'Hello World'],
    difficulty: '入门',
    estimatedWords: 1800,
    description: '从零开始搭建 NestJS 项目，理解项目结构，创建第一个控制器和服务'
  },
  {
    id: 3,
    category: '基础入门',
    title: 'NestJS 核心概念：模块、控制器与服务',
    keywords: ['Module', 'Controller', 'Provider', '依赖注入'],
    difficulty: '入门',
    estimatedWords: 2000,
    description: '深入理解 NestJS 的三大核心概念，掌握依赖注入的原理和使用'
  },
  {
    id: 4,
    category: '基础入门',
    title: 'NestJS 装饰器详解：让代码更优雅',
    keywords: ['Decorator', '装饰器模式', '元数据', 'TypeScript'],
    difficulty: '入门',
    estimatedWords: 1800,
    description: '详解 NestJS 中常用的装饰器，理解装饰器的工作原理和最佳实践'
  },

  // 核心功能篇
  {
    id: 5,
    category: '核心功能',
    title: 'NestJS 中间件与拦截器的使用',
    keywords: ['Middleware', 'Interceptor', '请求处理', 'AOP'],
    difficulty: '进阶',
    estimatedWords: 2200,
    description: '掌握中间件和拦截器的使用场景、实现方式和执行顺序'
  },
  {
    id: 6,
    category: '核心功能',
    title: 'NestJS 管道与数据验证',
    keywords: ['Pipe', 'Validation', 'class-validator', 'DTO'],
    difficulty: '进阶',
    estimatedWords: 2000,
    description: '使用管道进行数据转换和验证，构建健壮的 API 输入验证'
  },
  {
    id: 7,
    category: '核心功能',
    title: 'NestJS 守卫与权限控制',
    keywords: ['Guard', '身份认证', '权限管理', 'RBAC'],
    difficulty: '进阶',
    estimatedWords: 2500,
    description: '实现认证和授权机制，保护你的 API 端点'
  },
  {
    id: 8,
    category: '核心功能',
    title: 'NestJS 异常处理与过滤器',
    keywords: ['Exception', 'Filter', '错误处理', '全局异常'],
    difficulty: '进阶',
    estimatedWords: 1800,
    description: '构建统一的异常处理机制，提升应用的健壮性'
  },

  // 数据库篇
  {
    id: 9,
    category: '数据库集成',
    title: 'NestJS + TypeORM：打造类型安全的数据层',
    keywords: ['TypeORM', 'ORM', 'Database', 'Entity'],
    difficulty: '进阶',
    estimatedWords: 2800,
    description: '集成 TypeORM，实现实体定义、关系映射、查询构建'
  },
  {
    id: 10,
    category: '数据库集成',
    title: 'NestJS + Prisma：现代化数据库工具链',
    keywords: ['Prisma', 'ORM', 'Schema', 'Migration'],
    difficulty: '进阶',
    estimatedWords: 2500,
    description: '使用 Prisma 构建类型安全的数据库访问层，提升开发效率'
  },
  {
    id: 11,
    category: '数据库集成',
    title: 'NestJS 数据库事务与性能优化',
    keywords: ['Transaction', '事务管理', '性能优化', '连接池'],
    difficulty: '高级',
    estimatedWords: 2600,
    description: '深入理解数据库事务，优化数据库查询性能'
  },

  // 高级特性篇
  {
    id: 12,
    category: '高级特性',
    title: 'NestJS 微服务架构实战',
    keywords: ['Microservices', 'TCP', 'Redis', 'RabbitMQ'],
    difficulty: '高级',
    estimatedWords: 3000,
    description: '构建基于 NestJS 的微服务架构，掌握服务间通信'
  },
  {
    id: 13,
    category: '高级特性',
    title: 'NestJS GraphQL API 开发指南',
    keywords: ['GraphQL', 'Apollo', 'Schema', 'Resolver'],
    difficulty: '高级',
    estimatedWords: 2800,
    description: '使用 NestJS 构建 GraphQL API，实现灵活的数据查询'
  },
  {
    id: 14,
    category: '高级特性',
    title: 'NestJS WebSocket 实时通信',
    keywords: ['WebSocket', 'Socket.io', '实时通信', 'Gateway'],
    difficulty: '高级',
    estimatedWords: 2400,
    description: '实现 WebSocket 服务，构建实时应用'
  },
  {
    id: 15,
    category: '高级特性',
    title: 'NestJS 任务调度与定时任务',
    keywords: ['Schedule', 'Cron', 'Job', 'Queue'],
    difficulty: '进阶',
    estimatedWords: 2000,
    description: '实现定时任务和后台作业处理'
  },

  // 测试与部署篇
  {
    id: 16,
    category: '测试与部署',
    title: 'NestJS 单元测试与集成测试',
    keywords: ['Testing', 'Jest', 'E2E', 'Mock'],
    difficulty: '进阶',
    estimatedWords: 2600,
    description: '编写高质量的测试代码，确保应用稳定性'
  },
  {
    id: 17,
    category: '测试与部署',
    title: 'NestJS 应用性能监控与优化',
    keywords: ['Performance', 'Monitoring', 'APM', 'Profiling'],
    difficulty: '高级',
    estimatedWords: 2400,
    description: '监控应用性能，定位和解决性能瓶颈'
  },
  {
    id: 18,
    category: '测试与部署',
    title: 'NestJS 生产环境部署最佳实践',
    keywords: ['Deploy', 'Docker', 'CI/CD', 'Production'],
    difficulty: '高级',
    estimatedWords: 2800,
    description: '掌握生产环境部署流程，实现持续集成与部署'
  },

  // 实战项目篇
  {
    id: 19,
    category: '实战项目',
    title: 'NestJS 实战：构建 RESTful API',
    keywords: ['RESTful', 'CRUD', 'API设计', '最佳实践'],
    difficulty: '进阶',
    estimatedWords: 3500,
    description: '从零到一构建一个完整的 RESTful API 项目'
  },
  {
    id: 20,
    category: '实战项目',
    title: 'NestJS 实战：用户认证系统开发',
    keywords: ['JWT', 'Passport', '认证', '授权'],
    difficulty: '进阶',
    estimatedWords: 3200,
    description: '实现完整的用户注册、登录、权限管理系统'
  },
  {
    id: 21,
    category: '实战项目',
    title: 'NestJS 实战：文件上传与处理',
    keywords: ['File Upload', 'Multer', 'Storage', '图片处理'],
    difficulty: '进阶',
    estimatedWords: 2400,
    description: '实现文件上传、存储、处理的完整方案'
  },
  {
    id: 22,
    category: '实战项目',
    title: 'NestJS 实战：构建博客系统',
    keywords: ['Blog', 'CMS', '全栈开发', '项目实战'],
    difficulty: '高级',
    estimatedWords: 4000,
    description: '综合运用 NestJS 知识构建一个完整的博客系统'
  },

  // 最佳实践篇
  {
    id: 23,
    category: '最佳实践',
    title: 'NestJS 项目结构与代码组织',
    keywords: ['Architecture', '项目结构', '代码规范', 'Best Practice'],
    difficulty: '进阶',
    estimatedWords: 2200,
    description: '学习如何组织大型 NestJS 项目的代码结构'
  },
  {
    id: 24,
    category: '最佳实践',
    title: 'NestJS 配置管理与环境变量',
    keywords: ['Config', 'Environment', 'dotenv', '配置管理'],
    difficulty: '入门',
    estimatedWords: 1800,
    description: '掌握配置管理的最佳实践，管理不同环境的配置'
  },
  {
    id: 25,
    category: '最佳实践',
    title: 'NestJS 日志记录与监控',
    keywords: ['Logging', 'Winston', 'Monitoring', '日志管理'],
    difficulty: '进阶',
    estimatedWords: 2000,
    description: '构建完善的日志系统，提升问题排查效率'
  },
  {
    id: 26,
    category: '最佳实践',
    title: 'NestJS 安全性最佳实践',
    keywords: ['Security', 'CORS', 'Helmet', 'Rate Limit'],
    difficulty: '高级',
    estimatedWords: 2600,
    description: '保护你的应用免受常见安全威胁'
  },

  // 进阶技巧篇
  {
    id: 27,
    category: '进阶技巧',
    title: 'NestJS 自定义装饰器开发',
    keywords: ['Custom Decorator', 'Metadata', 'Reflection', '高级技巧'],
    difficulty: '高级',
    estimatedWords: 2400,
    description: '深入理解装饰器原理，开发自定义装饰器'
  },
  {
    id: 28,
    category: '进阶技巧',
    title: 'NestJS 动态模块与模块化设计',
    keywords: ['Dynamic Module', 'Module Design', '可复用性'],
    difficulty: '高级',
    estimatedWords: 2800,
    description: '创建可配置、可复用的动态模块'
  },
  {
    id: 29,
    category: '进阶技巧',
    title: 'NestJS 请求上下文与异步钩子',
    keywords: ['Context', 'AsyncLocalStorage', 'Request Scope'],
    difficulty: '高级',
    estimatedWords: 2400,
    description: '理解请求作用域和上下文管理'
  },
  {
    id: 30,
    category: '进阶技巧',
    title: 'NestJS 源码解析：深入理解框架原理',
    keywords: ['Source Code', '源码分析', '框架原理', '底层实现'],
    difficulty: '高级',
    estimatedWords: 3500,
    description: '通过源码理解 NestJS 的核心实现原理'
  },
];

// ============================================================================
// AI 内容生成提示词
// ============================================================================

function generateArticlePrompt(topic: KnowledgeTopic): string {
  return `你是一位资深的 Node.js 和 NestJS 专家，有多年的企业级项目开发经验。请根据以下主题创作一篇技术文章：

【文章主题】
${topic.title}

【主题信息】
- 分类：${topic.category}
- 难度：${topic.difficulty}
- 关键词：${topic.keywords.join('、')}
- 描述：${topic.description}
- 目标字数：${topic.estimatedWords} 字左右

【创作要求】

1. **文章结构**：
   - 引人入胜的开头（场景化或问题导向）
   - 清晰的层次结构（使用 ## 和 ### 标题）
   - 循序渐进的内容展开
   - 实用的总结和展望

2. **技术深度**：
   - 准确的技术概念解释
   - 丰富的代码示例（使用 TypeScript）
   - 实际应用场景说明
   - 常见问题和解决方案
   - 最佳实践建议

3. **代码示例**：
   - 使用 \`\`\`typescript 代码块
   - 代码要完整、可运行
   - 添加详细的注释
   - 展示从简单到复杂的演进过程

4. **写作风格**：
   - 语言通俗易懂，避免过度专业化
   - 使用类比和比喻帮助理解
   - 适当使用表情符号增强可读性（但不要过多）
   - 语气专业但友好，像是在和同行交流

5. **内容亮点**：
   - 包含实用的小技巧（💡 Tips）
   - 标注重要的注意事项（⚠️ 注意）
   - 分享踩坑经验
   - 提供延伸阅读建议

6. **SEO 优化**：
   - 标题包含核心关键词
   - 自然融入相关技术术语
   - 结尾包含相关话题标签

【输出格式】
请直接输出 Markdown 格式的文章内容，不要包含任何其他说明。文章开头不要重复标题。

开始创作吧！`;
}

// ============================================================================
// 工具函数
// ============================================================================

/**
 * 创建命令行输入接口
 */
function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

/**
 * 异步获取用户输入
 */
function askQuestion(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer.trim());
    });
  });
}

/**
 * 按分类展示主题清单
 */
function displayTopics() {
  console.log('\n' + '='.repeat(80));
  console.log('📚 NestJS 知识分享主题清单（第一阶段）');
  console.log('='.repeat(80));

  const categories = [...new Set(NESTJS_TOPICS.map(t => t.category))];

  categories.forEach(category => {
    console.log(`\n【${category}】`);
    const topicsInCategory = NESTJS_TOPICS.filter(t => t.category === category);

    topicsInCategory.forEach(topic => {
      const difficultyEmoji = topic.difficulty === '入门' ? '🟢' : topic.difficulty === '进阶' ? '🟡' : '🔴';
      console.log(`  ${topic.id}. ${difficultyEmoji} ${topic.title}`);
      console.log(`     关键词: ${topic.keywords.join(', ')} | 字数: ~${topic.estimatedWords}`);
    });
  });

  console.log('\n' + '='.repeat(80));
}

/**
 * 根据 ID 查找主题
 */
function findTopicById(id: number): KnowledgeTopic | undefined {
  return NESTJS_TOPICS.find(t => t.id === id);
}

/**
 * 生成文章内容
 * @param topic 主题信息
 * @param method 生成方式：'ai' 使用 AI 生成，'mock' 使用模拟内容
 */
async function generateArticle(
  topic: KnowledgeTopic,
  method: 'ai' | 'mock' = 'mock'
): Promise<{ title: string; content: string }> {
  console.log(`\n🤖 正在生成文章...`);
  console.log(`   主题: ${topic.title}`);
  console.log(`   难度: ${topic.difficulty}`);
  console.log(`   预计字数: ${topic.estimatedWords}`);
  console.log(`   生成方式: ${method === 'ai' ? 'AI 生成' : '模拟内容'}`);

  // 如果选择模拟内容，直接返回
  if (method === 'mock') {
    console.log('\n📝 使用模拟内容生成...');
    const content = generateMockArticle(topic);
    console.log('✅ 模拟内容生成完成');
    console.log(`   生成字数: ${content.length} 字`);

    return {
      title: topic.title,
      content: content,
    };
  }

  // 使用 AI 生成
  const prompt = generateArticlePrompt(topic);

  console.log('\n📝 生成的 AI 提示词：');
  console.log('─'.repeat(80));
  console.log(prompt);
  console.log('─'.repeat(80));

  try {
    // 从环境变量获取配置
    const apiKey = process.env.OPENAI_API_KEY;
    const baseURL = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';

    if (!apiKey) {
      console.error('\n❌ 未配置 OPENAI_API_KEY，请在 .env 文件中配置');
      console.log('💡 自动切换到模拟内容生成...');
      const content = generateMockArticle(topic);
      return {
        title: topic.title,
        content: content,
      };
    }

    console.log(`\n🔗 使用 API 端点: ${baseURL}`);
    console.log('🔑 API Key 已配置');

    // 调用 AI API
    const apiUrl = `${baseURL}${baseURL.endsWith('/') ? '' : '/'}chat/completions`;
    console.log(`\n📡 正在调用 AI API: ${apiUrl}`);

    const response = await axios.post(apiUrl, {
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 120000, // 120秒超时
    });

    const content = response.data.choices[0].message.content;

    console.log('\n✅ AI 内容生成完成');
    console.log(`   生成字数: ${content.length} 字`);

    return {
      title: topic.title,
      content: content,
    };

  } catch (error: any) {
    console.error(`\n❌ AI 生成失败:`);

    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error(`   状态码: ${error.response.status}`);
        console.error(`   错误信息: ${JSON.stringify(error.response.data, null, 2)}`);
      } else if (error.request) {
        console.error(`   网络错误: 无法连接到 API 服务器`);
      } else {
        console.error(`   错误: ${error.message}`);
      }
    } else {
      console.error(`   错误: ${error}`);
    }

    console.log('\n💡 使用模拟内容作为后备方案...');
    const content = generateMockArticle(topic);

    return {
      title: topic.title,
      content: content,
    };
  }
}

/**
 * 生成模拟文章内容
 */
function generateMockArticle(topic: KnowledgeTopic): string {
  return `## 前言

大家好，我是一名全栈开发工程师，今天想和大家分享关于 ${topic.title} 的一些实战经验和心得。

${topic.description}

## 核心概念

在 NestJS 中，${topic.keywords[0]} 是一个非常重要的概念。让我们通过实际代码来理解它。

## 代码示例

\`\`\`typescript
// 示例代码
import { Module } from '@nestjs/common';

@Module({
  // 配置信息
})
export class ExampleModule {}
\`\`\`

💡 **小贴士**：这里的代码展示了基本用法，在实际项目中需要根据具体场景调整。

## 实战应用

在企业级项目中，我们经常会遇到以下场景：

1. **场景一**：基础功能实现
2. **场景二**：性能优化
3. **场景三**：错误处理

让我们逐一分析。

## 最佳实践

根据我的项目经验，这里有几个重要的最佳实践：

⚠️ **注意事项**：
- 注意点 1
- 注意点 2
- 注意点 3

## 常见问题

在使用过程中，可能会遇到以下问题：

**Q1: 如何解决某个问题？**
A: 解决方案...

## 总结

通过本文，我们学习了 ${topic.keywords.join('、')} 的相关知识。希望这些内容对你有所帮助。

在后续的文章中，我们将继续深入探讨 NestJS 的其他特性。如果你对本文有任何疑问，欢迎在评论区交流！

---

📌 相关主题推荐：
#NestJS #Node.js #后端开发 #企业级应用 #${topic.keywords[0]}

👨‍💻 关于作者：全栈开发工程师，专注于 Node.js 和现代 Web 技术栈，分享实用的开发经验和技术洞察。`;
}

/**
 * 转换内容格式
 * @param content 原始 Markdown 内容
 * @param format 目标格式：'html' 或 'markdown'
 * @returns 转换后的内容
 */
function convertContentFormat(content: string, format: 'html' | 'markdown' = 'markdown'): string {
  if (format === 'markdown') {
    return content; // 已经是 Markdown 格式，直接返回
  }

  // 转换为 HTML 格式
  if (format === 'html') {
    return convertMarkdownToHtml(content);
  }

  return content;
}

/**
 * 将 Markdown 转换为 HTML
 * @param markdown Markdown 内容
 * @returns HTML 内容
 */
function convertMarkdownToHtml(markdown: string): string {
  let html = '';
  const lines = markdown.split('\n');
  let inCodeBlock = false;
  let codeBlockContent: string[] = [];
  let codeLanguage = '';
  let inList = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmedLine = line.trim();

    // 处理代码块
    if (trimmedLine.startsWith('```')) {
      if (!inCodeBlock) {
        // 开始代码块
        inCodeBlock = true;
        codeLanguage = trimmedLine.substring(3).trim();
        codeBlockContent = [];
      } else {
        // 结束代码块
        inCodeBlock = false;
        html += `<pre><code class="language-${codeLanguage}">${escapeHtml(codeBlockContent.join('\n'))}</code></pre>\n`;
        codeBlockContent = [];
        codeLanguage = '';
      }
      continue;
    }

    // 在代码块内
    if (inCodeBlock) {
      codeBlockContent.push(line);
      continue;
    }

    // 处理标题
    if (trimmedLine.startsWith('### ')) {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += `<h3>${processInlineFormatting(trimmedLine.substring(4))}</h3>\n`;
    } else if (trimmedLine.startsWith('## ')) {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += `<h2>${processInlineFormatting(trimmedLine.substring(3))}</h2>\n`;
    } else if (trimmedLine.startsWith('# ')) {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += `<h1>${processInlineFormatting(trimmedLine.substring(2))}</h1>\n`;
    }
    // 处理无序列表
    else if (trimmedLine.match(/^[-*]\s+/)) {
      if (!inList) {
        html += '<ul>\n';
        inList = true;
      }
      const content = trimmedLine.replace(/^[-*]\s+/, '');
      html += `<li>${processInlineFormatting(content)}</li>\n`;
    }
    // 处理有序列表
    else if (trimmedLine.match(/^\d+\.\s+/)) {
      if (!inList) {
        html += '<ol>\n';
        inList = true;
      }
      const content = trimmedLine.replace(/^\d+\.\s+/, '');
      html += `<li>${processInlineFormatting(content)}</li>\n`;
    }
    // 处理分隔线
    else if (trimmedLine === '---' || trimmedLine === '***') {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += '<hr>\n';
    }
    // 处理空行
    else if (trimmedLine === '') {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += '\n';
    }
    // 处理普通段落
    else if (trimmedLine.length > 0) {
      if (inList) {
        html += '</ul>\n';
        inList = false;
      }
      html += `<p>${processInlineFormatting(trimmedLine)}</p>\n`;
    }
  }

  // 关闭未闭合的列表
  if (inList) {
    html += '</ul>\n';
  }

  return html;
}

/**
 * 处理内联格式（粗体、斜体、代码、链接等）
 * @param text 文本内容
 * @returns 处理后的 HTML
 */
function processInlineFormatting(text: string): string {
  // 处理行内代码 `code`
  text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

  // 处理粗体 **text** 或 __text__
  text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/__([^_]+)__/g, '<strong>$1</strong>');

  // 处理斜体 *text* 或 _text_
  text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  text = text.replace(/_([^_]+)_/g, '<em>$1</em>');

  // 处理链接 [text](url)
  text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');

  return text;
}

/**
 * HTML 转义
 * @param text 文本内容
 * @returns 转义后的内容
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * 发布文章
 */
async function publishArticle(
  publisher: TouTiaoPublisher,
  title: string,
  content: string,
  dryRun: boolean
): Promise<boolean> {
  if (dryRun) {
    console.log('\n🔍 测试模式 - 预览文章内容：');
    console.log('='.repeat(80));
    console.log(`标题: ${title}`);
    console.log('='.repeat(80));
    console.log(content);
    console.log('='.repeat(80));
    console.log('✅ 测试模式：跳过实际发布');
    return true;
  }

  try {
    console.log('\n📤 正在发布文章到今日头条...');
    const result = await publisher.publishArticle({
      title,
      content,
    });

    if (result.success) {
      console.log('✅ 文章发布成功！');
      console.log(`   标题: ${result.title}`);
      return true;
    } else {
      console.error(`❌ 文章发布失败: ${result.message}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 发布异常: ${error}`);
    return false;
  }
}

/**
 * 等待用户确认
 */
async function waitForConfirmation(rl: readline.Interface): Promise<boolean> {
  const answer = await askQuestion(rl, '\n是否继续发布？(y/n): ');
  return answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes';
}

// ============================================================================
// 主流程
// ============================================================================

async function main() {
  console.clear();
  console.log('\n' + '='.repeat(80));
  console.log('🚀 程序员知识分享 - 自动发布系统');
  console.log('   第一阶段：NestJS 技术系列');
  console.log('='.repeat(80));

  const rl = createReadlineInterface();

  try {
    // 1. 展示主题清单
    displayTopics();

    // 2. 用户选择主题
    console.log('\n📝 请选择要发布的主题：');
    const topicIdStr = await askQuestion(rl, '请输入主题编号 (1-30): ');
    const topicId = parseInt(topicIdStr);

    if (isNaN(topicId) || topicId < 1 || topicId > NESTJS_TOPICS.length) {
      console.error('❌ 无效的主题编号');
      rl.close();
      return;
    }

    const selectedTopic = findTopicById(topicId);
    if (!selectedTopic) {
      console.error('❌ 未找到对应主题');
      rl.close();
      return;
    }

    console.log('\n✅ 已选择主题：');
    console.log(`   ${selectedTopic.id}. ${selectedTopic.title}`);
    console.log(`   分类: ${selectedTopic.category}`);
    console.log(`   难度: ${selectedTopic.difficulty}`);
    console.log(`   描述: ${selectedTopic.description}`);

    // 3. 选择模式
    const modeStr = await askQuestion(rl, '\n请选择模式 (1=测试模式, 2=实际发布): ');
    const dryRun = modeStr === '1';

    // 3.5 选择生成方式
    const methodStr = await askQuestion(rl, '\n请选择内容生成方式 (1=模拟内容, 2=AI生成) [默认:1]: ');
    const generateMethod: 'ai' | 'mock' = methodStr === '2' ? 'ai' : 'mock';

    console.log(`\n📋 运行配置：`);
    console.log(`   模式: ${dryRun ? '测试模式（不会实际发布）' : '实际发布模式'}`);
    console.log(`   生成方式: ${generateMethod === 'ai' ? 'AI 生成' : '模拟内容'}`);
    console.log(`   主题: ${selectedTopic.title}`);

    // 4. 检查登录状态（非测试模式）
    if (!dryRun) {
      console.log('\n📝 [1/4] 检查登录状态...');
      const auth = new TouTiaoAuth();
      const isLoggedIn = await auth.checkLoginStatus();

      if (!isLoggedIn) {
        console.error('❌ 未登录！请先运行: npm run login');
        rl.close();
        process.exit(1);
      }
      console.log('✅ 登录状态正常');
    } else {
      console.log('\n📝 [1/4] 测试模式：跳过登录检查');
    }

    // 5. 生成文章内容
    console.log('\n📝 [2/4] 生成文章内容...');
    const article = await generateArticle(selectedTopic, generateMethod);

    // 6. 用户确认
    console.log('\n📝 [3/4] 内容预览');
    console.log('─'.repeat(80));
    console.log(`标题: ${article.title}`);
    console.log(`字数: ${article.content.length} 字`);
    console.log('─'.repeat(80));
    console.log(article.content.substring(0, 500) + '...\n（以下内容省略）');
    console.log('─'.repeat(80));

    const confirmed = await waitForConfirmation(rl);
    if (!confirmed) {
      console.log('\n❌ 已取消发布');
      rl.close();
      return;
    }

    // 7. 发布文章
    console.log('\n📝 [4/4] 发布文章...');
    const auth = new TouTiaoAuth();
    const publisher = new TouTiaoPublisher(auth);

    const success = await publishArticle(publisher, article.title, article.content, dryRun);

    // 8. 显示结果
    console.log('\n' + '='.repeat(80));
    console.log('📊 发布结果');
    console.log('='.repeat(80));
    console.log(`\n状态: ${success ? '✅ 成功' : '❌ 失败'}`);
    console.log(`主题: ${selectedTopic.title}`);
    console.log(`分类: ${selectedTopic.category}`);
    console.log(`难度: ${selectedTopic.difficulty}`);

    if (!dryRun && success) {
      console.log('\n💡 提示：');
      console.log('   1. 请在浏览器中确认文章发布');
      console.log('   2. 检查文章格式是否正确');
      console.log('   3. 可以添加封面图片提升吸引力');
    }

    console.log('\n' + '='.repeat(80));
    console.log('🎉 流程完成！');
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('\n❌ 程序异常:', error);
  } finally {
    rl.close();
  }
}

// 运行主程序
if (require.main === module) {
  main().catch(error => {
    console.error('\n❌ 程序异常:', error);
    process.exit(1);
  });
}

export { main as autoPublishKnowledge, NESTJS_TOPICS };
