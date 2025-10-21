/**
 * 今日头条 MCP 服务器配置
 */

import * as path from 'path';
import * as os from 'os';

// 今日头条相关 URL
export const TOUTIAO_URLS = {
  login: 'https://mp.toutiao.com/auth/page/login',
  homepage: 'https://mp.toutiao.com/profile_v4/index',
  userInfo: 'https://mp.toutiao.com/profile_v4/user/info',

  // 发布相关
  publishArticle: 'https://mp.toutiao.com/profile_v4/graphic/publish',
  publishMicroPost: 'https://mp.toutiao.com/profile_v4/weitoutiao/publish?from=toutiao_pc',
  upload: 'https://mp.toutiao.com/upload_photo/v2/',

  // 内容管理
  articleList: 'https://mp.toutiao.com/profile_v4/graphic/articles',
  deleteArticle: 'https://mp.toutiao.com/profile_v4/graphic/delete',

  // 数据分析
  analytics: 'https://mp.toutiao.com/profile_v4/analysis/overview',
  articleStats: 'https://mp.toutiao.com/profile_v4/analysis/article',
};

// 默认 HTTP 请求头
export const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'application/json, text/plain, */*',
  'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Referer': 'https://mp.toutiao.com/',
};

// Selenium 配置
export const SELENIUM_CONFIG = {
  implicitWait: 10000, // 10 seconds
  explicitWait: 30000, // 30 seconds
  headless: false, // 是否使用无头模式
  chromeOptions: [
    '--no-sandbox',
    '--disable-dev-shm-usage',
    '--disable-blink-features=AutomationControlled',
    '--disable-infobars',
    '--start-maximized',
  ],
};

// 内容发布配置
export const CONTENT_CONFIG = {
  defaultCategory: '科技',
  maxImagesPerArticle: 20,
  maxImagesPerMicroPost: 9,
  autoCompressImages: true,
  maxImageSize: 1024 * 1024, // 1MB
  imageQuality: 85,
};

// Cookie 文件路径
export function getCookiesFilePath(): string {
  return path.join(process.cwd(), 'toutiao_cookies.json');
}

// 下载文件夹路径
export function getDownloadFolderPath(folderName: string = 'downloaded_images'): string {
  return path.join(process.cwd(), folderName);
}

// 日志配置
export const LOG_CONFIG = {
  level: process.env.LOG_LEVEL || 'info',
  file: path.join(process.cwd(), 'toutiao_mcp.log'),
};

// MCP 服务器配置
export const MCP_CONFIG = {
  name: 'toutiao-mcp-server',
  version: '1.0.0',
  description: '今日头条内容管理 MCP 服务器 - Node.js/TypeScript 实现',
};
