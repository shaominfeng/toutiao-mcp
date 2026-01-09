/**
 * 环境变量加载和验证模块
 *
 * 职责：
 * 1. 加载 .env 文件
 * 2. 验证必需的环境变量
 * 3. 提供友好的错误提示
 *
 * 使用方式：
 * import { loadEnv } from '../config/env';
 * loadEnv();
 */

import * as dotenv from 'dotenv';
import * as path from 'path';
import * as fs from 'fs';

/**
 * 环境变量加载选项
 */
interface LoadEnvOptions {
  /**
   * 是否验证必需的环境变量
   * @default true
   */
  validate?: boolean;

  /**
   * 是否在缺少 .env 文件时显示警告
   * @default true
   */
  warnIfMissing?: boolean;

  /**
   * 自定义 .env 文件路径
   */
  envPath?: string;
}

/**
 * 必需的环境变量列表
 */
const REQUIRED_ENV_VARS = [
  {
    name: 'COOKIE_ENCRYPTION_KEY',
    validator: (value: string) => value.length >= 32,
    errorMessage: 'COOKIE_ENCRYPTION_KEY must be at least 32 characters long',
    hint: 'Set a strong password (at least 32 characters) in your .env file',
  },
] as const;

/**
 * 加载环境变量
 */
export function loadEnv(options: LoadEnvOptions = {}): void {
  const {
    validate = true,
    warnIfMissing = true,
    envPath = path.resolve(process.cwd(), '.env'),
  } = options;

  // 检查 .env 文件是否存在
  const envFileExists = fs.existsSync(envPath);

  if (!envFileExists && warnIfMissing) {
    console.warn('\n⚠️  Warning: .env file not found at:', envPath);
    console.warn('   Copy .env.example to .env and configure your settings.\n');
  }

  // 加载环境变量
  const result = dotenv.config({ path: envPath });

  if (result.error && warnIfMissing) {
    console.warn('⚠️  Failed to load .env file:', result.error.message);
  }

  // 验证必需的环境变量
  if (validate) {
    validateRequiredEnvVars();
  }
}

/**
 * 验证必需的环境变量
 */
function validateRequiredEnvVars(): void {
  const missingVars: string[] = [];
  const invalidVars: Array<{ name: string; message: string; hint?: string }> = [];

  for (const envVar of REQUIRED_ENV_VARS) {
    const value = process.env[envVar.name];

    if (!value) {
      missingVars.push(envVar.name);
    } else if (envVar.validator && !envVar.validator(value)) {
      invalidVars.push({
        name: envVar.name,
        message: envVar.errorMessage,
        hint: envVar.hint,
      });
    }
  }

  // 报告缺失的环境变量
  if (missingVars.length > 0) {
    console.error('\n❌ Error: Required environment variables are missing:');
    missingVars.forEach((varName) => {
      const envVar = REQUIRED_ENV_VARS.find((v) => v.name === varName);
      console.error(`   - ${varName}`);
      if (envVar?.hint) {
        console.error(`     Hint: ${envVar.hint}`);
      }
    });
    console.error('\nPlease set these variables in your .env file.\n');
    process.exit(1);
  }

  // 报告无效的环境变量
  if (invalidVars.length > 0) {
    console.error('\n❌ Error: Environment variables validation failed:');
    invalidVars.forEach((v) => {
      console.error(`   - ${v.name}: ${v.message}`);
      if (v.hint) {
        console.error(`     Hint: ${v.hint}`);
      }
    });
    console.error();
    process.exit(1);
  }
}

/**
 * 仅加载环境变量，不进行验证
 * 适用于不需要所有环境变量的场景（如测试）
 */
export function loadEnvWithoutValidation(): void {
  loadEnv({ validate: false, warnIfMissing: false });
}

/**
 * 获取环境变量，如果不存在则抛出错误
 */
export function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Required environment variable ${name} is not set. Please check your .env file.`
    );
  }
  return value;
}

/**
 * 获取环境变量，如果不存在则返回默认值
 */
export function getEnv(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}
