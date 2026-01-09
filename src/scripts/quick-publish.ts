#!/usr/bin/env tsx

/**
 * 快速发布脚本 - 跳过登录验证，直接发布
 */

import * as fs from 'fs';
import { TouTiaoAuth } from '../lib/auth';
import { TouTiaoPublisher } from '../lib/publisher';

async function quickPublish(contentFile: string) {
  try {
    console.log('\n' + '='.repeat(70));
    console.log('🚀 快速发布工具（跳过登录验证）');
    console.log('='.repeat(70));

    // 读取内容
    console.log(`\n📖 读取文件: ${contentFile}`);
    if (!fs.existsSync(contentFile)) {
      throw new Error(`文件不存在: ${contentFile}`);
    }

    const content = fs.readFileSync(contentFile, 'utf-8');
    console.log(`✅ 成功读取 ${content.length} 字符`);

    // 创建认证和发布器实例
    console.log('\n📝 初始化发布器...');
    const auth = new TouTiaoAuth();
    const publisher = new TouTiaoPublisher(auth);

    // 直接发布，跳过登录验证
    console.log('\n📤 开始发布微头条...');
    const result = await publisher.publishMicroPost({
      content: content.trim(),
    });

    console.log('\n' + '='.repeat(70));
    if (result.success) {
      console.log('✅ 发布成功！');
      console.log(`   ${result.message}`);
    } else {
      console.log('❌ 发布失败');
      console.log(`   ${result.message}`);
    }
    console.log('='.repeat(70) + '\n');

    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error(`\n❌ 错误: ${error}`);
    process.exit(1);
  }
}

// 主程序
const args = process.argv.slice(2);
if (args.length === 0) {
  console.log('\n使用方法:');
  console.log('  npx tsx src/scripts/quick-publish.ts <内容文件>\n');
  process.exit(0);
}

quickPublish(args[0]);
