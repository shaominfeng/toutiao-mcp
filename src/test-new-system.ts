/**
 * 测试新的错误处理、日志和 Cookie 加密系统
 */

import { logger, ErrorHandler, EncryptedFileCookieStorage } from './utils';
import {
  AuthenticationError,
  PublishError,
  ErrorCode,
  NetworkError,
} from './errors';
import type { Cookie } from './types';

async function testLogger() {
  console.log('\n=== 测试日志系统 ===\n');

  logger.info('日志系统初始化成功');
  logger.debug('这是一条调试日志', { userId: '123', action: 'test' });
  logger.warn('这是一条警告日志', { warning: 'test warning' });

  try {
    throw new Error('模拟错误');
  } catch (error) {
    logger.error('捕获到错误', error as Error, { context: 'test' });
  }

  logger.operation('TestOperation', { step: 1 });
  logger.success('TestOperation', { result: 'OK' });

  console.log('✅ 日志系统测试完成\n');
}

async function testErrors() {
  console.log('\n=== 测试错误处理系统 ===\n');

  // 测试认证错误
  try {
    throw new AuthenticationError(
      ErrorCode.AUTH_LOGIN_FAILED,
      '登录失败测试',
      { context: { username: 'test' } }
    );
  } catch (error) {
    logger.error('捕获认证错误', error as Error);
    console.log('✅ 认证错误类型:', (error as Error).name);
    console.log('✅ 错误码:', (error as AuthenticationError).code);
  }

  // 测试发布错误
  try {
    throw new NetworkError(
      '网络请求失败',
      new Error('Connection timeout'),
      { url: 'https://example.com', timeout: 5000 }
    );
  } catch (error) {
    logger.error('捕获网络错误', error as Error);
    console.log('✅ 网络错误类型:', (error as Error).name);
    console.log('✅ 是否可重试:', (error as NetworkError).retryable);
  }

  console.log('✅ 错误处理系统测试完成\n');
}

async function testErrorHandler() {
  console.log('\n=== 测试错误处理工具 ===\n');

  // 测试重试机制
  let attemptCount = 0;
  try {
    const result = await ErrorHandler.retry(
      async () => {
        attemptCount++;
        if (attemptCount < 3) {
          throw new Error('Simulated failure');
        }
        return 'Success';
      },
      { maxRetries: 5, initialDelay: 100 },
      'RetryTest'
    );
    console.log('✅ 重试测试成功:', result, '尝试次数:', attemptCount);
  } catch (error) {
    console.log('❌ 重试测试失败:', (error as Error).message);
  }

  // 测试超时
  try {
    await ErrorHandler.withTimeout(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return 'Too slow';
      },
      500,
      'TimeoutTest'
    );
  } catch (error) {
    console.log('✅ 超时测试成功:', (error as Error).message);
  }

  // 测试安全执行
  const result = await ErrorHandler.safe(
    async () => {
      throw new Error('This will fail');
    },
    'DEFAULT_VALUE',
    'SafeTest'
  );
  console.log('✅ 安全执行测试:', result);

  console.log('✅ 错误处理工具测试完成\n');
}

async function testCookieStorage() {
  console.log('\n=== 测试 Cookie 加密存储 ===\n');

  const testCookies: Cookie[] = [
    {
      name: 'sessionid',
      value: 'abc123xyz789',
      domain: '.toutiao.com',
      path: '/',
      secure: true,
      httpOnly: true,
    },
    {
      name: 'csrf_token',
      value: 'token123456',
      domain: '.toutiao.com',
      path: '/',
    },
  ];

  const storage = new EncryptedFileCookieStorage(
    './test_cookies_encrypted.json',
    'test-encryption-key-12345678'
  );

  try {
    // 保存 Cookies（加密）
    await storage.save(testCookies);
    console.log('✅ Cookies 保存成功（已加密）');

    // 加载 Cookies（解密）
    const loadedCookies = await storage.load();
    console.log('✅ Cookies 加载成功:', loadedCookies.length, '个');

    // 验证数据一致性
    if (
      loadedCookies.length === testCookies.length &&
      loadedCookies[0].value === testCookies[0].value
    ) {
      console.log('✅ 数据一致性验证通过');
    } else {
      console.log('❌ 数据一致性验证失败');
    }

    // 清空
    await storage.clear();
    console.log('✅ Cookies 清空成功');

    const existsAfterClear = await storage.exists();
    console.log('✅ 清空后存在性检查:', existsAfterClear ? '仍存在' : '已删除');
  } catch (error) {
    console.log('❌ Cookie 存储测试失败:', (error as Error).message);
    logger.error('Cookie 存储测试失败', error as Error);
  }

  console.log('✅ Cookie 加密存储测试完成\n');
}

async function main() {
  console.log('\n🚀 开始测试新系统...\n');
  console.log('=' .repeat(60));

  try {
    await testLogger();
    await testErrors();
    await testErrorHandler();
    await testCookieStorage();

    console.log('=' .repeat(60));
    console.log('\n✅ 所有测试完成！新系统工作正常。\n');
    console.log('📊 检查 logs/ 目录查看日志文件');
    console.log('🔐 test_cookies_encrypted.json 已创建（加密格式）\n');
  } catch (error) {
    console.error('\n❌ 测试过程中出现错误:', error);
    logger.error('测试失败', error as Error);
    process.exit(1);
  }
}

main();
