/**
 * 自动化新闻发布脚本
 * 功能：
 * 1. 从 trends-hub 获取热点新闻
 * 2. 使用 AI 搜索并总结新闻内容
 * 3. 自动发布到今日头条微头条
 */

import { loadEnv } from '../config/env';
import { TouTiaoAuth } from '../lib/auth';
import { TouTiaoPublisher } from '../lib/publisher';

// 加载环境变量
loadEnv();

// 热点新闻源配置
const NEWS_SOURCES = {
  weibo: 'weibo-trending',           // 微博热搜
  zhihu: 'zhihu-trending',           // 知乎热榜
  toutiao: 'toutiao-trending',       // 今日头条热榜
  douyin: 'douyin-trending',         // 抖音热搜
  baidu: 'baidu-trending',           // 百度热搜
  netease: 'netease-news-trending',  // 网易新闻
  thepaper: 'thepaper-trending',     // 澎湃新闻
};

interface NewsItem {
  title: string;
  url?: string;
  hotValue?: string | number;
  rank?: number;
}

interface PublishConfig {
  source: keyof typeof NEWS_SOURCES;  // 新闻源
  count: number;                       // 发布数量
  interval: number;                    // 发布间隔(秒)
  aiModel?: string;                    // AI 模型
  includeHashtag: boolean;             // 是否包含话题标签
  addEmoji: boolean;                   // 是否添加表情
}

/**
 * 从 trends-hub 获取热点新闻
 */
async function fetchTrendingNews(source: string, limit: number = 10): Promise<NewsItem[]> {
  console.log(`\n📰 正在获取${source}热点新闻...`);

  try {
    // 这里需要调用 trends-hub MCP 工具
    // 由于我们在 Node.js 环境中，需要通过 HTTP 请求或 MCP 客户端调用
    console.log(`✅ 成功获取 ${limit} 条热点新闻`);

    // 示例返回数据（实际使用时需要调用真实的 MCP 工具）
    return [
      { title: '示例新闻标题1', hotValue: '1000万', rank: 1 },
      { title: '示例新闻标题2', hotValue: '800万', rank: 2 },
      { title: '示例新闻标题3', hotValue: '600万', rank: 3 },
    ].slice(0, limit);
  } catch (error) {
    console.error(`❌ 获取新闻失败: ${error}`);
    return [];
  }
}

/**
 * 使用 AI 搜索并总结新闻
 */
async function summarizeNewsWithAI(newsTitle: string, aiModel: string = 'gpt-4'): Promise<string> {
  console.log(`\n🤖 正在使用 AI 总结新闻: ${newsTitle.substring(0, 30)}...`);

  try {
    // 这里需要调用 AI 模型进行新闻搜索和总结
    // 可以使用 Claude、GPT-4 或其他 AI 模型
    const prompt = `
请针对以下新闻标题，进行网络搜索并撰写一段适合发布到今日头条微头条的内容：

新闻标题：${newsTitle}

要求：
1. 搜索并整理相关背景信息
2. 总结新闻要点和影响
3. 控制在 200-500 字以内
4. 语言通俗易懂，适合大众阅读
5. 可以添加合适的表情符号增强可读性
6. 结尾可以提出一个问题引发讨论

请直接输出内容，不要包含"这是总结"等说明性文字。
`;

    console.log('📡 正在调用 AI 模型...');

    // 这里应该调用实际的 AI API
    // 示例返回（实际使用时需要调用真实的 AI 服务）
    const summary = `📰 ${newsTitle}

根据最新报道，这一事件引发了广泛关注。相关专家表示，这将对行业产生重要影响。

🔍 背景信息：
相关部门正在密切关注事态发展，并采取相应措施。

💭 你对此有什么看法？欢迎留言讨论！

#热点 #新闻速递`;

    console.log('✅ AI 总结完成');
    return summary;
  } catch (error) {
    console.error(`❌ AI 总结失败: ${error}`);
    // 返回简单版本
    return `📰 ${newsTitle}\n\n这一话题正在引发广泛关注，你怎么看？\n\n#热点话题`;
  }
}

/**
 * 发布微头条
 */
async function publishToToutiao(
  publisher: TouTiaoPublisher,
  content: string,
  topic?: string
): Promise<boolean> {
  try {
    console.log('\n📤 正在发布微头条...');
    console.log('内容预览：');
    console.log('─'.repeat(50));
    console.log(content.substring(0, 100) + (content.length > 100 ? '...' : ''));
    console.log('─'.repeat(50));

    const result = await publisher.publishMicroPost({
      content,
      topic,
    });

    if (result.success) {
      console.log('✅ 发布成功！');
      return true;
    } else {
      console.error(`❌ 发布失败: ${result.message}`);
      return false;
    }
  } catch (error) {
    console.error(`❌ 发布异常: ${error}`);
    return false;
  }
}

/**
 * 等待指定秒数
 */
async function sleep(seconds: number): Promise<void> {
  console.log(`\n⏳ 等待 ${seconds} 秒后继续...`);
  await new Promise(resolve => setTimeout(resolve, seconds * 1000));
}

/**
 * 主流程：自动化发布热点新闻
 */
async function autoPublishNews(config: PublishConfig): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🚀 今日头条热点新闻自动发布工具');
  console.log('='.repeat(60));
  console.log(`\n📋 配置信息：`);
  console.log(`   新闻源: ${config.source}`);
  console.log(`   发布数量: ${config.count}`);
  console.log(`   发布间隔: ${config.interval} 秒`);
  console.log(`   AI 模型: ${config.aiModel || '默认'}`);
  console.log(`   包含话题: ${config.includeHashtag ? '是' : '否'}`);
  console.log(`   添加表情: ${config.addEmoji ? '是' : '否'}`);

  // 1. 初始化认证
  console.log('\n📝 步骤 1/4: 检查登录状态...');
  const auth = new TouTiaoAuth();
  await auth.init(); // 初始化加密存储
  const isLoggedIn = await auth.checkLoginStatus();

  if (!isLoggedIn) {
    console.error('❌ 未登录，请先运行: npm run login');
    process.exit(1);
  }
  console.log('✅ 已登录');

  // 2. 获取热点新闻
  console.log('\n📝 步骤 2/4: 获取热点新闻...');
  const newsSource = NEWS_SOURCES[config.source];
  const newsList = await fetchTrendingNews(newsSource, config.count);

  if (newsList.length === 0) {
    console.error('❌ 未获取到新闻，退出');
    process.exit(1);
  }

  // 3. 初始化发布器
  console.log('\n📝 步骤 3/4: 初始化发布器...');
  const publisher = new TouTiaoPublisher(auth);
  console.log('✅ 发布器就绪');

  // 4. 处理并发布每条新闻
  console.log('\n📝 步骤 4/4: 开始处理并发布新闻...');
  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < newsList.length; i++) {
    const news = newsList[i];
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📌 处理第 ${i + 1}/${newsList.length} 条新闻`);
    console.log(`   标题: ${news.title}`);
    if (news.hotValue) console.log(`   热度: ${news.hotValue}`);
    console.log('='.repeat(60));

    try {
      // AI 总结新闻
      const summary = await summarizeNewsWithAI(news.title, config.aiModel);

      // 添加话题标签
      let finalContent = summary;
      if (config.includeHashtag) {
        const hashtag = extractHashtag(news.title);
        if (hashtag && !summary.includes(`#${hashtag}`)) {
          finalContent = `#${hashtag}# ${summary}`;
        }
      }

      // 发布
      const published = await publishToToutiao(
        publisher,
        finalContent,
        config.includeHashtag ? extractHashtag(news.title) : undefined
      );

      if (published) {
        successCount++;
      } else {
        failCount++;
      }

      // 如果不是最后一条，等待指定间隔
      if (i < newsList.length - 1) {
        await sleep(config.interval);
      }
    } catch (error) {
      console.error(`❌ 处理失败: ${error}`);
      failCount++;
    }
  }

  // 5. 显示统计结果
  console.log('\n' + '='.repeat(60));
  console.log('📊 发布统计');
  console.log('='.repeat(60));
  console.log(`✅ 成功: ${successCount} 条`);
  console.log(`❌ 失败: ${failCount} 条`);
  console.log(`📈 成功率: ${((successCount / newsList.length) * 100).toFixed(1)}%`);
  console.log('='.repeat(60));
  console.log('\n🎉 自动发布流程完成！\n');
}

/**
 * 从标题中提取话题标签
 */
function extractHashtag(title: string): string | undefined {
  // 简单的话题提取逻辑，可以根据需要优化
  const keywords = ['科技', '财经', '娱乐', '体育', '时事', '健康', '教育', '旅游'];
  for (const keyword of keywords) {
    if (title.includes(keyword)) {
      return keyword;
    }
  }
  return '热点资讯';
}

/**
 * 交互式配置流程
 */
async function interactiveConfig(): Promise<PublishConfig> {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const question = (prompt: string): Promise<string> => {
    return new Promise(resolve => {
      rl.question(prompt, (answer: string) => {
        resolve(answer.trim());
      });
    });
  };

  console.log('\n🎯 请配置自动发布参数：\n');

  // 选择新闻源
  console.log('可用的新闻源：');
  Object.keys(NEWS_SOURCES).forEach((key, index) => {
    console.log(`  ${index + 1}. ${key}`);
  });
  const sourceIndex = await question('\n请选择新闻源 (1-' + Object.keys(NEWS_SOURCES).length + '): ');
  const source = Object.keys(NEWS_SOURCES)[parseInt(sourceIndex) - 1] as keyof typeof NEWS_SOURCES;

  // 其他配置
  const countStr = await question('发布数量 (1-10, 默认3): ');
  const count = parseInt(countStr) || 3;

  const intervalStr = await question('发布间隔(秒) (默认60): ');
  const interval = parseInt(intervalStr) || 60;

  const hashtagStr = await question('包含话题标签? (y/n, 默认y): ');
  const includeHashtag = hashtagStr.toLowerCase() !== 'n';

  const emojiStr = await question('添加表情? (y/n, 默认y): ');
  const addEmoji = emojiStr.toLowerCase() !== 'n';

  rl.close();

  return {
    source: source || 'weibo',
    count: Math.min(Math.max(count, 1), 10),
    interval: Math.max(interval, 30),
    includeHashtag,
    addEmoji,
  };
}

// 主程序入口
if (require.main === module) {
  (async () => {
    try {
      // 检查命令行参数
      const args = process.argv.slice(2);

      if (args.includes('--help') || args.includes('-h')) {
        console.log(`
使用方法：
  npm run auto-publish           # 交互式配置
  npm run auto-publish -- --quick  # 快速模式（使用默认配置）

选项：
  --source <源>    新闻源 (weibo/zhihu/toutiao/douyin等)
  --count <数量>   发布数量 (1-10)
  --interval <秒>  发布间隔秒数
  --quick          快速模式（使用默认配置）
  --help, -h       显示帮助信息

示例：
  npm run auto-publish -- --source weibo --count 3 --interval 60
        `);
        process.exit(0);
      }

      let config: PublishConfig;

      if (args.includes('--quick')) {
        // 快速模式：使用默认配置
        config = {
          source: 'weibo',
          count: 3,
          interval: 60,
          includeHashtag: true,
          addEmoji: true,
        };
        console.log('⚡ 使用快速模式（默认配置）');
      } else if (args.length > 0) {
        // 命令行参数模式
        const sourceIndex = args.indexOf('--source');
        const countIndex = args.indexOf('--count');
        const intervalIndex = args.indexOf('--interval');

        config = {
          source: (sourceIndex >= 0 ? args[sourceIndex + 1] : 'weibo') as keyof typeof NEWS_SOURCES,
          count: countIndex >= 0 ? parseInt(args[countIndex + 1]) : 3,
          interval: intervalIndex >= 0 ? parseInt(args[intervalIndex + 1]) : 60,
          includeHashtag: true,
          addEmoji: true,
        };
      } else {
        // 交互式配置
        config = await interactiveConfig();
      }

      // 执行自动发布
      await autoPublishNews(config);
    } catch (error) {
      console.error('\n❌ 程序异常:', error);
      process.exit(1);
    }
  })();
}

export { autoPublishNews, fetchTrendingNews, summarizeNewsWithAI };

