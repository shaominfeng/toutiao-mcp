/**
 * 自定义新闻发布脚本
 * 功能：从文件读取内容并发布到今日头条微头条
 * 支持带格式的文本内容（保留换行、段落等格式）
 */

import { loadEnv } from '../config/env';
import * as fs from 'fs';
import * as path from 'path';
import { TouTiaoAuth } from '../lib/auth';
import { TouTiaoPublisher } from '../lib/publisher';

// 加载环境变量
loadEnv();

interface PublishOptions {
  contentFile: string;    // 内容文件路径
  topic?: string;         // 话题标签
  images?: string[];      // 图片路径列表
  autoConfirm?: boolean;  // 自动确认（跳过预览）
}

/**
 * 从文件读取内容
 */
function readContentFromFile(filePath: string): string {
  try {
    if (!fs.existsSync(filePath)) {
      throw new Error(`文件不存在: ${filePath}`);
    }

    const content = fs.readFileSync(filePath, 'utf-8');

    if (!content.trim()) {
      throw new Error('文件内容为空');
    }

    console.log(`✅ 成功读取文件: ${filePath}`);
    console.log(`   文件大小: ${content.length} 字符`);

    return content;
  } catch (error) {
    console.error(`❌ 读取文件失败: ${error}`);
    throw error;
  }
}

/**
 * 验证图片文件
 */
function validateImages(imagePaths: string[]): string[] {
  const validImages: string[] = [];
  const validExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  for (const imgPath of imagePaths) {
    const absolutePath = path.resolve(imgPath);

    if (!fs.existsSync(absolutePath)) {
      console.warn(`⚠️  图片文件不存在，已跳过: ${imgPath}`);
      continue;
    }

    const ext = path.extname(absolutePath).toLowerCase();
    if (!validExtensions.includes(ext)) {
      console.warn(`⚠️  不支持的图片格式，已跳过: ${imgPath}`);
      continue;
    }

    validImages.push(absolutePath);
  }

  return validImages;
}

/**
 * 预览内容
 */
function previewContent(content: string, topic?: string, images?: string[]): void {
  console.log('\n' + '='.repeat(70));
  console.log('📋 内容预览');
  console.log('='.repeat(70));

  if (topic) {
    console.log(`\n🏷️  话题标签: #${topic}#\n`);
  }

  // 显示内容（如果太长则截断）
  const maxPreviewLength = 500;
  if (content.length > maxPreviewLength) {
    console.log(content.substring(0, maxPreviewLength));
    console.log(`\n... (还有 ${content.length - maxPreviewLength} 个字符) ...\n`);
  } else {
    console.log(content);
    console.log();
  }

  console.log('─'.repeat(70));
  console.log(`📊 统计信息:`);
  console.log(`   字符数: ${content.length}`);
  console.log(`   行数: ${content.split('\n').length}`);

  if (images && images.length > 0) {
    console.log(`   配图数量: ${images.length}`);
    images.forEach((img, index) => {
      console.log(`     ${index + 1}. ${path.basename(img)}`);
    });
  }

  console.log('='.repeat(70) + '\n');
}

/**
 * 交互式确认
 */
async function confirm(message: string): Promise<boolean> {
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (y/n): `, (answer: string) => {
      rl.close();
      resolve(answer.trim().toLowerCase() === 'y');
    });
  });
}

/**
 * 发布微头条
 */
async function publishCustomNews(options: PublishOptions): Promise<void> {
  console.log('\n' + '='.repeat(70));
  console.log('🚀 自定义新闻发布工具');
  console.log('='.repeat(70));

  // 1. 检查登录状态
  console.log('\n📝 步骤 1/4: 检查登录状态...');
  const auth = new TouTiaoAuth();
  await auth.init(); // 初始化加密存储
  const isLoggedIn = await auth.checkLoginStatus();

  if (!isLoggedIn) {
    console.error('❌ 未登录，请先运行: npm run login');
    process.exit(1);
  }
  console.log('✅ 已登录');

  // 2. 读取内容
  console.log('\n📝 步骤 2/4: 读取内容文件...');
  let content = readContentFromFile(options.contentFile);

  // 如果有话题标签，添加到内容开头
  if (options.topic && !options.topic.startsWith('#')) {
    content = `#${options.topic}# ${content}`;
  } else if (options.topic) {
    content = `${options.topic} ${content}`;
  }

  // 3. 验证图片（如果有）
  let validImages: string[] = [];
  if (options.images && options.images.length > 0) {
    console.log('\n📝 步骤 3/4: 验证图片文件...');
    validImages = validateImages(options.images);

    if (validImages.length === 0 && options.images.length > 0) {
      console.warn('⚠️  所有图片都无效，将发布纯文本内容');
    } else if (validImages.length > 0) {
      console.log(`✅ 验证通过 ${validImages.length} 张图片`);
    }
  } else {
    console.log('\n📝 步骤 3/4: 无图片，跳过验证');
  }

  // 4. 预览和确认
  console.log('\n📝 步骤 4/4: 准备发布...');
  previewContent(content, options.topic, validImages);

  if (!options.autoConfirm) {
    const shouldContinue = await confirm('确认发布？');
    if (!shouldContinue) {
      console.log('\n❌ 已取消发布');
      process.exit(0);
    }
  }

  // 5. 执行发布
  console.log('\n📤 正在发布微头条...');
  const publisher = new TouTiaoPublisher(auth);

  const result = await publisher.publishMicroPost({
    content,
    images: validImages.length > 0 ? validImages : undefined,
    topic: options.topic,
  });

  console.log('\n' + '='.repeat(70));
  if (result.success) {
    console.log('✅ 发布成功！');
    console.log('='.repeat(70));
  } else {
    console.log('❌ 发布失败');
    console.log(`   错误信息: ${result.message}`);
    console.log('='.repeat(70));
    process.exit(1);
  }
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
  console.log(`
自定义新闻发布工具 - 使用说明

用法：
  npm run publish-custom -- <内容文件> [选项]

参数：
  <内容文件>        必需，内容文件路径（支持 .txt, .md 等文本文件）

选项：
  --topic <话题>    可选，话题标签（不需要加 # 号）
  --images <路径>   可选，图片路径，多张图片用逗号分隔（最多9张）
  --yes, -y         可选，跳过确认，直接发布
  --help, -h        显示此帮助信息

示例：
  # 基础用法：发布纯文本
  npm run publish-custom -- ./news.txt

  # 添加话题标签
  npm run publish-custom -- ./news.txt --topic "热点资讯"

  # 添加配图（单张）
  npm run publish-custom -- ./news.txt --images ./image.jpg

  # 添加配图（多张）
  npm run publish-custom -- ./news.txt --images ./img1.jpg,./img2.jpg,./img3.jpg

  # 完整示例（带话题和配图，自动确认）
  npm run publish-custom -- ./news.md --topic "科技" --images ./cover.jpg --yes

文件格式说明：
  - 支持纯文本 (.txt) 和 Markdown (.md) 文件
  - 会保留换行和段落格式
  - 建议内容控制在 2000 字以内
  - 图片格式支持：jpg, jpeg, png, gif, webp

注意事项：
  - 发布前请确保已登录（运行 npm run login）
  - 图片大小建议不超过 5MB
  - 话题标签会自动添加到内容开头
  `);
}

/**
 * 解析命令行参数
 */
function parseArgs(): PublishOptions | null {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    showHelp();
    return null;
  }

  const options: PublishOptions = {
    contentFile: '',
    autoConfirm: false,
  };

  // 第一个非选项参数是内容文件
  for (let i = 0; i < args.length; i++) {
    if (!args[i].startsWith('-')) {
      options.contentFile = args[i];
      break;
    }
  }

  if (!options.contentFile) {
    console.error('❌ 错误：未指定内容文件');
    console.log('运行 npm run publish-custom -- --help 查看使用说明\n');
    return null;
  }

  // 解析选项
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    switch (arg) {
      case '--topic':
        if (i + 1 < args.length) {
          options.topic = args[++i];
        }
        break;

      case '--images':
        if (i + 1 < args.length) {
          options.images = args[++i].split(',').map(img => img.trim());
        }
        break;

      case '--yes':
      case '-y':
        options.autoConfirm = true;
        break;
    }
  }

  return options;
}

// 主程序入口
if (require.main === module) {
  (async () => {
    try {
      const options = parseArgs();

      if (!options) {
        process.exit(0);
      }

      await publishCustomNews(options);

      console.log('\n🎉 任务完成！\n');
    } catch (error) {
      console.error('\n❌ 程序异常:', error);
      process.exit(1);
    }
  })();
}

export { publishCustomNews, readContentFromFile };
