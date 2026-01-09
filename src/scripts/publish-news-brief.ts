#!/usr/bin/env tsx

/**
 * 发布新闻简报到今日头条微头条
 */

import * as fs from 'fs';
import { TouTiaoAuth } from '../lib/auth';
import { TouTiaoPublisher } from '../lib/publisher';

async function main() {
  console.log('='.repeat(60));
  console.log('发布新闻简报到今日头条');
  console.log('='.repeat(60));
  console.log();

  // 读取准备好的内容
  const contentPath = '/Users/allen_shao/.claude/skills/news-brief/temp/toutiao-content.txt';

  if (!fs.existsSync(contentPath)) {
    console.error('❌ 未找到内容文件:', contentPath);
    console.error('请先运行: node scripts/publish-to-toutiao.js <markdown-file>');
    process.exit(1);
  }

  const content = fs.readFileSync(contentPath, 'utf8');

  console.log('📖 已读取内容');
  console.log('📝 字数:', content.length);
  console.log();

  // 初始化认证
  console.log('🔐 检查登录状态...');
  const auth = new TouTiaoAuth();
  const cookies = auth.getCookies();

  if (cookies.length === 0) {
    console.error('❌ 未登录，请先运行: npm run login');
    process.exit(1);
  }

  console.log('✅ 已登录 (Cookie 数量:', cookies.length, ')');
  console.log();

  // 初始化发布器
  const publisher = new TouTiaoPublisher(auth);

  console.log('🚀 开始发布到今日头条...');
  console.log('⏳ 这将打开浏览器自动操作，请稍候...');
  console.log();

  try {
    const result = await publisher.publishMicroPost({
      content: content,
      topic: '热点新闻'
    });

    console.log();
    console.log('='.repeat(60));

    if (result.success) {
      console.log('✅ 发布成功！');
      console.log(result.message || '内容已成功发布到今日头条');
      if (result.url) {
        console.log('🔗 链接:', result.url);
      }
    } else {
      console.log('❌ 发布失败');
      console.log('原因:', result.message);
    }

    console.log('='.repeat(60));

  } catch (error: any) {
    console.error();
    console.error('❌ 发布过程中出现错误:', error.message);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('发生错误:', error);
  process.exit(1);
});
