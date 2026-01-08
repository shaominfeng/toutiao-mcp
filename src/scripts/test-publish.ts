#!/usr/bin/env tsx

/**
 * 今日头条发布测试脚本
 */

import * as readline from 'readline';
import { TouTiaoAuth } from '../lib/auth';
import { TouTiaoPublisher } from '../lib/publisher';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(prompt, (answer) => {
      resolve(answer.trim());
    });
  });
}

async function main() {
  console.log('='.repeat(60));
  console.log('今日头条内容发布工具');
  console.log('='.repeat(60));
  console.log();

  const auth = new TouTiaoAuth();
  await auth.init(); // 初始化加密存储
  const publisher = new TouTiaoPublisher(auth);

  // 检查登录状态
  console.log('正在检查登录状态...');
  const isLoggedIn = await auth.checkLoginStatus();

  if (!isLoggedIn) {
    console.log('❌ 未登录或登录已过期');
    console.log('请先运行登录脚本: npm run login');
    process.exit(1);
  }

  console.log('✅ 已登录');
  console.log();

  // 选择发布类型
  console.log('请选择发布类型:');
  console.log('  1. 发布微头条（快速）');
  console.log('  2. 发布图文文章');
  console.log('  0. 退出');
  console.log();

  const choice = await question('请选择 (0-2): ');

  if (choice === '0') {
    console.log('已退出');
    rl.close();
    process.exit(0);
  }

  if (choice === '1') {
    // 发布微头条
    console.log();
    console.log('--- 发布微头条 ---');
    console.log('请输入微头条内容 (输入 END 结束):');
    console.log('-'.repeat(60));

    let content = '';
    let line = '';
    while ((line = await question('')) !== 'END') {
      content += line + '\n';
    }

    if (!content.trim()) {
      console.log('❌ 内容不能为空');
      rl.close();
      process.exit(1);
    }

    console.log();
    const confirm = await question('确认发布？(y/n): ');

    if (confirm.toLowerCase() !== 'y') {
      console.log('已取消');
      rl.close();
      process.exit(0);
    }

    console.log();
    console.log('正在发布微头条...');

    const result = await publisher.publishMicroPost({
      content: content.trim(),
    });

    console.log();
    if (result.success) {
      console.log('✅ 发布成功！');
      console.log(result.message);
    } else {
      console.log('❌ 发布失败');
      console.log(result.message);
    }
  } else if (choice === '2') {
    // 发布图文文章
    console.log();
    console.log('--- 发布图文文章 ---');

    const title = await question('文章标题 (2-30个字): ');
    if (!title || title.length < 2 || title.length > 30) {
      console.log('❌ 标题长度必须在2-30个字之间');
      rl.close();
      process.exit(1);
    }

    console.log();
    console.log('文章内容 (输入 END 结束):');
    console.log('-'.repeat(60));

    let content = '';
    let line = '';
    while ((line = await question('')) !== 'END') {
      content += line + '\n';
    }

    if (!content.trim()) {
      console.log('❌ 内容不能为空');
      rl.close();
      process.exit(1);
    }

    console.log();
    const imagePath = await question('封面图片路径 (可选，直接回车跳过): ');

    console.log();
    const confirm = await question('确认发布？(y/n): ');

    if (confirm.toLowerCase() !== 'y') {
      console.log('已取消');
      rl.close();
      process.exit(0);
    }

    console.log();
    console.log('正在发布文章...');

    const result = await publisher.publishArticle({
      title: title.trim(),
      content: content.trim(),
      images: imagePath ? [imagePath] : undefined,
    });

    console.log();
    if (result.success) {
      console.log('✅ 发布成功！');
      console.log(`标题: ${result.title}`);
      console.log(result.message);
    } else {
      console.log('❌ 发布失败');
      console.log(result.message);
    }
  } else {
    console.log('无效的选择');
  }

  rl.close();
}

main().catch((error) => {
  console.error('发生错误:', error);
  rl.close();
  process.exit(1);
});
